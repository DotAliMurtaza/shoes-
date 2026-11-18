import 'dotenv/config';
import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import {
  HistoryTurn,
  matchInstantResponse,
  searchCatalogWithContext,
} from './src/lib/assistantEngine.ts';

const app = express();
app.use(express.json({ limit: '256kb' }));

const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

// Lightweight per-IP sliding-window rate limiter (30 requests per 60s)
const RATE_WINDOW_MS = 60_000;
const RATE_MAX_REQUESTS = 30;
const ipRequests = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipRequests.get(ip) || []).filter((ts) => now - ts < RATE_WINDOW_MS);
  if (timestamps.length >= RATE_MAX_REQUESTS) {
    ipRequests.set(ip, timestamps);
    return true;
  }
  timestamps.push(now);
  ipRequests.set(ip, timestamps);
  return false;
}

// Reuse a single configured Gemini client instance across requests to avoid init overhead
let cachedClient: GoogleGenAI | null | undefined;

function getGeminiClient(): GoogleGenAI | null {
  if (cachedClient !== undefined) return cachedClient;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    cachedClient = null;
    return null;
  }
  cachedClient = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
  return cachedClient;
}

function sendSSE(res: Response, payload: Record<string, unknown>): void {
  if (res.writableEnded) return;
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function sanitizeHistory(raw: unknown): HistoryTurn[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .slice(-4)
    .filter(
      (item): item is { role: string; text: string } =>
        Boolean(item) &&
        typeof item === 'object' &&
        typeof (item as { role?: unknown }).role === 'string' &&
        typeof (item as { text?: unknown }).text === 'string'
    )
    .map((item) => ({
      role: item.role === 'user' ? 'user' : 'assistant',
      text: item.text.trim().slice(0, 220),
    }))
    .filter((item) => item.text.length > 0);
}

app.post('/api/assistant', async (req: Request, res: Response) => {
  const requestStart = performance.now();
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';

  if (isRateLimited(clientIp)) {
    return res.status(429).json({
      error: 'Too many messages sent briefly. Please pause a moment and try again.',
    });
  }

  const { message, history, stream = true } = req.body as {
    message?: unknown;
    history?: unknown;
    stream?: boolean;
  };

  if (typeof message !== 'string' || !message.trim()) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  const trimmedMessage = message.trim().slice(0, 500);
  const safeHistory = sanitizeHistory(history);

  // Layer 1: Instant Predefined Hybrid Match (<5ms, zero AI call)
  const instant = matchInstantResponse(trimmedMessage, safeHistory);
  if (instant) {
    const totalMs = Math.round(performance.now() - requestStart);
    console.info(`[AI Assistant] source=instant totalMs=${totalMs}`);

    if (!stream) {
      return res.json({
        reply: instant.reply,
        recommendedIds: instant.recommendedIds,
        metrics: { source: 'instant', totalMs },
      });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    sendSSE(res, {
      type: 'meta',
      recommendedIds: instant.recommendedIds,
      source: 'instant',
      localFilterMs: totalMs,
    });
    sendSSE(res, { type: 'chunk', text: instant.reply });
    sendSSE(res, { type: 'done', metrics: { ttftMs: totalMs, totalMs, source: 'instant' } });
    return res.end();
  }

  // Layer 2: Fast Local Product Matching + Follow-Up Context (~1ms)
  const localMatchStart = performance.now();
  const catalogMatch = searchCatalogWithContext(trimmedMessage, safeHistory);
  const localFilterMs = Math.round(performance.now() - localMatchStart);
  const recommendedIds = catalogMatch.matchedProducts.map((p) => p.id);

  if (catalogMatch.canAnswerInstantly && catalogMatch.instantReply) {
    const totalMs = Math.round(performance.now() - requestStart);
    console.info(
      `[AI Assistant] source=local-catalog localFilterMs=${localFilterMs} totalMs=${totalMs}`
    );

    if (!stream) {
      return res.json({
        reply: catalogMatch.instantReply,
        recommendedIds,
        metrics: { source: 'local-catalog', totalMs },
      });
    }

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    sendSSE(res, {
      type: 'meta',
      recommendedIds,
      source: 'local-catalog',
      localFilterMs,
    });
    sendSSE(res, { type: 'chunk', text: catalogMatch.instantReply });
    sendSSE(res, {
      type: 'done',
      metrics: { ttftMs: totalMs, totalMs, source: 'local-catalog' },
    });
    return res.end();
  }

  // Layer 3: Ultra-Fast Streaming AI with Compact Matched Context Only
  const ai = getGeminiClient();
  if (!ai) {
    return res.status(503).json({
      error: 'Gemini API key is not configured on the server.',
      recommendedIds,
    });
  }

  // Compact system instruction — sends ONLY 1-3 matched items instead of the full catalog
  const systemInstruction = `You are VELLMONT's AI Shoe Assistant (Atelier by Ali Murtaza).
Reply in 2–3 concise, warm sentences with zero fluff. Recommend ONLY from the matched pairs below (never invent shoes or prices). Guide sizing (EU 36–45) and mention WhatsApp checkout (0328-2305470) or 14-day unworn exchange only when helpful.

MATCHED PAIRS:
${catalogMatch.compactContext}${catalogMatch.contextSummary ? `\nCUSTOMER FILTER: ${catalogMatch.contextSummary}` : ''}
POLICY: Free shipping >= Rs. 8,000 (Rs. 350 otherwise). COD nationwide.`;

  const recentTurns = safeHistory
    .map((h) => `${h.role === 'user' ? 'Customer' : 'Assistant'}: ${h.text}`)
    .join('\n');

  const prompt = recentTurns
    ? `Context:\n${recentTurns}\n\nCustomer: ${trimmedMessage}`
    : trimmedMessage;

  const outerAbort = new AbortController();
  const totalTimeoutHandle = setTimeout(() => {
    outerAbort.abort(new Error('AI request timed out'));
  }, 13_000);

  let clientClosed = false;
  res.on('close', () => {
    if (!res.writableEnded) {
      clientClosed = true;
      outerAbort.abort(new Error('Client disconnected'));
    }
  });

  if (!stream) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          abortSignal: outerAbort.signal,
        },
      });
      clearTimeout(totalTimeoutHandle);
      const totalMs = Math.round(performance.now() - requestStart);
      const reply = (response.text ?? '').trim();
      console.info(`[AI Assistant] source=ai-sync totalMs=${totalMs}`);
      return res.json({ reply, recommendedIds, metrics: { source: 'ai', totalMs } });
    } catch (err) {
      clearTimeout(totalTimeoutHandle);
      console.error('AI Assistant sync error:', err);
      return res.status(502).json({
        error: 'Unable to reach AI concierge right now.',
        recommendedIds,
      });
    }
  }

  // Configure SSE Stream headers & flush immediately
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  // Send matched product IDs immediately before AI even yields its first token
  sendSSE(res, {
    type: 'meta',
    recommendedIds,
    source: 'ai',
    localFilterMs,
  });

  let ttftMs: number | null = null;
  let fullText = '';

  const runGeminiStream = async (attemptTimeoutMs: number) => {
    const attemptAbort = new AbortController();
    const onOuterAbort = () => attemptAbort.abort(outerAbort.signal.reason);
    outerAbort.signal.addEventListener('abort', onOuterAbort, { once: true });

    let firstTokenReceived = false;
    const firstTokenTimer = setTimeout(() => {
      if (!firstTokenReceived) {
        attemptAbort.abort(new Error('First-token timeout'));
      }
    }, attemptTimeoutMs);

    try {
      const streamResult = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite',
        contents: prompt,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
          abortSignal: attemptAbort.signal,
        },
      });

      for await (const chunk of streamResult) {
        if (clientClosed || outerAbort.signal.aborted) break;
        const chunkText = chunk.text ?? '';
        if (!chunkText) continue;

        if (!firstTokenReceived) {
          firstTokenReceived = true;
          clearTimeout(firstTokenTimer);
          ttftMs = Math.round(performance.now() - requestStart);
        }
        fullText += chunkText;
        sendSSE(res, { type: 'chunk', text: chunkText });
      }
    } finally {
      clearTimeout(firstTokenTimer);
      outerAbort.signal.removeEventListener('abort', onOuterAbort);
    }
  };

  try {
    try {
      await runGeminiStream(5_500);
    } catch (firstErr) {
      if (clientClosed || outerAbort.signal.aborted || fullText.length > 0) {
        throw firstErr;
      }
      console.warn('[AI Assistant] retrying stream after transient stall:', (firstErr as Error)?.message);
      await runGeminiStream(6_500);
    }

    clearTimeout(totalTimeoutHandle);
    const totalMs = Math.round(performance.now() - requestStart);
    console.info(
      `[AI Assistant] source=ai-stream localFilterMs=${localFilterMs} ttftMs=${ttftMs ?? totalMs} totalMs=${totalMs} chars=${fullText.length}`
    );

    if (!clientClosed) {
      sendSSE(res, {
        type: 'done',
        metrics: {
          source: 'ai',
          localFilterMs,
          ttftMs: ttftMs ?? totalMs,
          totalMs,
        },
      });
      res.end();
    }
  } catch (err) {
    clearTimeout(totalTimeoutHandle);
    const totalMs = Math.round(performance.now() - requestStart);
    const isAbort = outerAbort.signal.aborted;
    console.error(`[AI Assistant] stream failed after ${totalMs}ms:`, err);

    if (!clientClosed && !res.writableEnded) {
      sendSSE(res, {
        type: 'error',
        error: isAbort
          ? 'Request timed out while waiting for AI response.'
          : 'AI concierge connection was interrupted.',
        recommendedIds,
        retryable: true,
      });
      res.end();
    }
  }
});

async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexFile = path.join(distDir, 'index.html');
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VELLMONT Atelier server running at http://localhost:${PORT}`);
  });
}

startServer();

import { useEffect, useRef, useState } from 'react';
import { Check, Eye, Minus, RotateCcw, Send, ShoppingBag, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, ShoeProduct, formatPKR, getEffectivePrice } from '../lib/products';
import { ChatMessage, loadChatHistory, saveChatHistory } from '../lib/storage';
import { matchInstantResponse, searchCatalogWithContext } from '../lib/assistantEngine';
import { AnimatedAISparkleIcon } from './AnimatedIcons';

interface AIAssistantProps {
  onViewProduct: (productId: string) => void;
  onAddToCart: (
    product: ShoeProduct,
    size: number,
    colorName: string,
    colorHex: string
  ) => void;
  hideLauncher?: boolean;
}

const QUICK_ACTIONS = [
  'Find Shoes',
  'Best Sellers',
  'Shoes Under Rs. 5000',
  'Formal Shoes',
  'Casual Shoes',
  'Track Order Help',
];

const CLIENT_TIMEOUT_MS = 10_500;

interface ChatProductCardProps {
  product: ShoeProduct;
  onView: () => void;
  onAdd: (size: number) => void;
}

function ChatProductCard({ product, onView, onAdd }: ChatProductCardProps) {
  const defaultSize = product.sizes.includes(42) ? 42 : product.sizes[0];
  const [selectedSize, setSelectedSize] = useState<number>(defaultSize);
  const [justAdded, setJustAdded] = useState(false);

  const handleAdd = () => {
    onAdd(selectedSize);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div className="rounded-xl border border-[#C9A461]/30 bg-[#16110E] p-2.5 transition-colors hover:border-[#C9A461]/70">
      <div className="flex items-start gap-2.5">
        <img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          className="h-14 w-16 shrink-0 rounded-lg object-cover border border-white/10"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-sm font-semibold text-white">
            {product.name}
          </p>
          <p className="text-[11px] font-medium text-[#E2C285] tabular-nums">
            {formatPKR(getEffectivePrice(product))}
            <span className="ml-1.5 text-[10px] text-[#9C9286]">· {product.category}</span>
          </p>

          {/* Compact Available EU Sizes Selector */}
          <div className="mt-1.5 flex flex-wrap items-center gap-1">
            <span className="text-[9px] uppercase tracking-wider text-[#8C8277] mr-0.5">
              EU:
            </span>
            {product.sizes.slice(0, 6).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                aria-label={`Select EU size ${sz} for ${product.name}`}
                className={`rounded px-1.5 py-0.5 text-[10px] font-medium tabular-nums transition-colors ${
                  selectedSize === sz
                    ? 'bg-[#C9A461] text-[#0A0807]'
                    : 'border border-white/10 bg-[#0D0A08] text-[#C8BEB0] hover:border-[#C9A461]/50'
                }`}
              >
                {sz}
              </button>
            ))}
            {product.sizes.length > 6 && (
              <span className="text-[9px] text-[#8C8277]">+{product.sizes.length - 6}</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: View Product & Add to Cart */}
      <div className="mt-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={onView}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-white/15 bg-[#0D0A08] px-2.5 py-1.5 text-[11px] font-medium text-[#EBE5DC] transition-colors hover:border-[#C9A461] hover:text-[#E2C285]"
        >
          <Eye className="h-3 w-3" />
          View Product
        </button>
        <button
          type="button"
          onClick={handleAdd}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-[#C9A461] px-2.5 py-1.5 text-[11px] font-semibold text-[#0A0807] transition-colors hover:bg-[#E2C285]"
        >
          {justAdded ? (
            <>
              <Check className="h-3 w-3" />
              Added (EU {selectedSize})
            </>
          ) : (
            <>
              <ShoppingBag className="h-3 w-3" />
              Add to Cart
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function AIAssistant({
  onViewProduct,
  onAddToCart,
  hideLauncher = false,
}: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tooltipDismissed, setTooltipDismissed] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = loadChatHistory();
    if (saved.length > 0) return saved;
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        text: 'Welcome to VELLMONT Atelier. Ask me for wedding, office, or under-Rs. 5,000 shoes, sizing help, or WhatsApp checkout guidance.',
        timestamp: Date.now(),
      },
    ];
  });

  const scrollEndRef = useRef<HTMLDivElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const inFlightRef = useRef(false);
  const lastSubmitRef = useRef<{ text: string; time: number }>({ text: '', time: 0 });
  const metricsRef = useRef<{ totalRequests: number; failedRequests: number }>({
    totalRequests: 0,
    failedRequests: 0,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!isOpen && !tooltipDismissed) {
        setShowTooltip(true);
      }
    }, 2500);
    return () => window.clearTimeout(timer);
  }, [isOpen, tooltipDismissed]);

  useEffect(() => {
    saveChatHistory(messages);
    if (isOpen) {
      scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const cancelActiveRequest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    inFlightRef.current = false;
    setIsTyping(false);
    setIsStreaming(false);
  };

  const sendMessage = async (textToSend: string, isRetry = false) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const now = Date.now();
    if (
      !isRetry &&
      lastSubmitRef.current.text === trimmed &&
      now - lastSubmitRef.current.time < 600
    ) {
      return;
    }
    if (inFlightRef.current) return;

    lastSubmitRef.current = { text: trimmed, time: now };
    inFlightRef.current = true;
    metricsRef.current.totalRequests += 1;

    const requestStart = performance.now();
    const recentHistory = messages
      .filter((m) => !m.isError)
      .slice(-4)
      .map((m) => ({ role: m.role, text: m.text }));

    if (!isRetry) {
      const userMsg: ChatMessage = {
        id: `user-${now}`,
        role: 'user',
        text: trimmed,
        timestamp: now,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
    }

    // Layer 1: Instant Client-Side Predefined & Deterministic Catalog Responses (<120ms, zero network)
    const instant = matchInstantResponse(trimmed, recentHistory);
    if (instant) {
      setIsTyping(true);
      window.setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: instant.reply,
          recommendedIds: instant.recommendedIds,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
        inFlightRef.current = false;
        console.debug(
          `[AI Assistant] client-instant totalMs=${Math.round(performance.now() - requestStart)}`
        );
      }, 90);
      return;
    }

    const localSearch = searchCatalogWithContext(trimmed, recentHistory);
    if (localSearch.canAnswerInstantly && localSearch.instantReply) {
      setIsTyping(true);
      window.setTimeout(() => {
        const assistantMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          text: localSearch.instantReply!,
          recommendedIds: localSearch.matchedProducts.map((p) => p.id),
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setIsTyping(false);
        inFlightRef.current = false;
        console.debug(
          `[AI Assistant] client-local totalMs=${Math.round(performance.now() - requestStart)}`
        );
      }, 90);
      return;
    }

    // Layer 2: Real-Time SSE Streaming Request with Abort & Timeout Protection
    const controller = new AbortController();
    abortControllerRef.current = controller;
    let timedOut = false;
    const timeoutId = window.setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, CLIENT_TIMEOUT_MS);

    setIsTyping(true);
    setIsStreaming(true);

    const aiMsgId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let messageInserted = false;
    let accumulatedText = '';
    let streamedIds = localSearch.matchedProducts.map((p) => p.id);
    let ttftLogged = false;

    const upsertStreamingBubble = (text: string, ids: string[], isError = false, retryText?: string) => {
      setMessages((prev) => {
        if (!messageInserted) {
          messageInserted = true;
          return [
            ...prev,
            {
              id: aiMsgId,
              role: 'assistant',
              text,
              recommendedIds: ids,
              timestamp: Date.now(),
              isError,
              retryText,
            },
          ];
        }
        return prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, text, recommendedIds: ids, isError, retryText }
            : m
        );
      });
    };

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          message: trimmed,
          history: recentHistory,
          stream: true,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/event-stream')) {
        const json = (await response.json()) as {
          reply?: string;
          recommendedIds?: string[];
        };
        setIsTyping(false);
        upsertStreamingBubble(
          json.reply || 'Here are my tailored selections from the VELLMONT collection.',
          json.recommendedIds || streamedIds
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const eventBlock of events) {
          const lines = eventBlock.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const rawJson = line.slice(6).trim();
            if (!rawJson) continue;

            let evt: {
              type?: string;
              text?: string;
              recommendedIds?: string[];
              error?: string;
              metrics?: { ttftMs?: number; totalMs?: number };
            };
            try {
              evt = JSON.parse(rawJson);
            } catch {
              continue;
            }

            if (evt.type === 'meta') {
              if (Array.isArray(evt.recommendedIds)) {
                streamedIds = evt.recommendedIds;
              }
            } else if (evt.type === 'chunk' && evt.text) {
              if (!ttftLogged) {
                ttftLogged = true;
                setIsTyping(false);
                console.debug(
                  `[AI Assistant] ttftMs=${Math.round(performance.now() - requestStart)}`
                );
              }
              accumulatedText += evt.text;
              upsertStreamingBubble(accumulatedText, streamedIds);
            } else if (evt.type === 'error') {
              throw new Error(evt.error || 'Stream interrupted');
            } else if (evt.type === 'done') {
              console.debug(
                `[AI Assistant] totalMs=${Math.round(performance.now() - requestStart)}`
              );
            }
          }
        }
      }

      // Ensure bubble exists if stream finished cleanly with empty chunks
      if (!accumulatedText.trim()) {
        upsertStreamingBubble(
          'Here are our tailored selections matching your request:',
          streamedIds
        );
      }
    } catch (err) {
      const isManualAbort = (err as Error)?.name === 'AbortError' && !timedOut;
      if (!isManualAbort) {
        metricsRef.current.failedRequests += 1;
        console.warn('[AI Assistant] request fallback triggered:', err);
        const fallbackText =
          accumulatedText.trim().length > 20
            ? `${accumulatedText.trim()} (Connection interrupted)`
            : "Sorry, I'm taking longer than expected. You can explore our latest shoe collections while I reconnect.";
        upsertStreamingBubble(fallbackText, streamedIds, true, trimmed);
      }
    } finally {
      window.clearTimeout(timeoutId);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
      inFlightRef.current = false;
      setIsTyping(false);
      setIsStreaming(false);
    }
  };

  const handleResetChat = () => {
    cancelActiveRequest();
    const initial: ChatMessage[] = [
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        text: 'Chat cleared. How may I assist you with your footwear selection today?',
        timestamp: Date.now(),
      },
    ];
    setMessages(initial);
    saveChatHistory(initial);
  };

  const handleOpenToggle = () => {
    setIsOpen((o) => !o);
    setShowTooltip(false);
    setTooltipDismissed(true);
  };

  if (hideLauncher && !isOpen) return null;

  return (
    <div className="fixed right-4 bottom-4 z-[65] flex flex-col items-end sm:right-6 sm:bottom-6">
      {/* Luxury Concierge Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.94 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 flex h-[510px] max-h-[75vh] w-[calc(100vw-2rem)] max-w-[390px] flex-col overflow-hidden rounded-3xl border border-[#C9A461]/40 bg-[#100D0B] text-[#F5F0E8] shadow-[0_24px_64px_rgba(0,0,0,0.72)]"
            role="dialog"
            aria-label="AI Shoe Assistant chat"
          >
            {/* Header with Circular AI Avatar, Minimize, Clear & Close */}
            <div className="flex items-center justify-between border-b border-[#C9A461]/20 bg-gradient-to-r from-[#1A1410] to-[#120E0B] px-4 py-3.5">
              <div className="flex items-center gap-3">
                <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A461]/60 bg-[#0A0807] text-[#E2C285]">
                  <AnimatedAISparkleIcon className="h-4 w-4" />
                  <span className="absolute -right-0.5 -bottom-0.5 h-2.5 w-2.5 rounded-full border border-[#120E0B] bg-emerald-500" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-semibold leading-tight text-white">
                    AI Shoe Assistant
                  </h3>
                  <p className="text-[10px] font-semibold tracking-[0.14em] text-[#C9A461]">
                    AI ONLINE · INSTANT CONCIERGE
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleResetChat}
                  title="Clear chat history"
                  aria-label="Clear chat history"
                  className="rounded-full p-1.5 text-[#9C9286] hover:bg-white/10 hover:text-white"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Minimize chat"
                  aria-label="Minimize AI Shoe Assistant"
                  className="rounded-full p-1.5 text-[#9C9286] hover:bg-white/10 hover:text-white"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  title="Close chat"
                  aria-label="Close AI Shoe Assistant"
                  className="rounded-full p-1.5 text-[#9C9286] hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Feed */}
            <div className="flex-1 overflow-y-auto space-y-3 bg-[#0B0908] p-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className={`flex flex-col ${
                    msg.role === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[86%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed whitespace-pre-line ${
                      msg.role === 'user'
                        ? 'rounded-br-sm bg-[#C9A461] font-medium text-[#0A0807]'
                        : msg.isError
                          ? 'rounded-bl-sm border border-amber-500/35 bg-[#1B1310] text-[#EBE5DC]'
                          : 'rounded-bl-sm border border-white/10 bg-[#181310] text-[#EBE5DC]'
                    }`}
                  >
                    {msg.text}

                    {msg.isError && msg.retryText && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => sendMessage(msg.retryText!, true)}
                          disabled={isStreaming}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#C9A461]/50 bg-[#0D0A08] px-2.5 py-1 text-[11px] font-medium text-[#E2C285] transition-colors hover:bg-[#C9A461] hover:text-[#0A0807] disabled:opacity-40"
                        >
                          <RotateCcw className="h-3 w-3" />
                          Retry
                        </button>
                      </div>
                    )}
                  </div>

                  {msg.recommendedIds && msg.recommendedIds.length > 0 && (
                    <div className="mt-2 w-[92%] space-y-2">
                      {msg.recommendedIds.map((pid) => {
                        const prod = PRODUCTS.find((p) => p.id === pid);
                        if (!prod) return null;
                        const primaryColor = prod.colors[0] || {
                          name: 'Signature',
                          hex: '#181615',
                        };
                        return (
                          <ChatProductCard
                            key={prod.id}
                            product={prod}
                            onView={() => {
                              setIsOpen(false);
                              onViewProduct(prod.id);
                            }}
                            onAdd={(chosenSize) =>
                              onAddToCart(
                                prod,
                                chosenSize,
                                primaryColor.name,
                                primaryColor.hex
                              )
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-start">
                  <div className="inline-flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/10 bg-[#181310] px-4 py-2.5 text-xs text-[#C9A461]">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C9A461]" />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C9A461]"
                      style={{ animationDelay: '0.15s' }}
                    />
                    <span
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#C9A461]"
                      style={{ animationDelay: '0.3s' }}
                    />
                  </div>
                </div>
              )}
              <div ref={scrollEndRef} />
            </div>

            {/* Quick Action Buttons */}
            <div className="flex gap-1.5 overflow-x-auto border-t border-white/10 bg-[#120E0B] px-3 py-2">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={isStreaming}
                  onClick={() => sendMessage(action)}
                  className="shrink-0 rounded-full border border-[#C9A461]/30 bg-[#1A1410] px-2.5 py-1 text-[11px] text-[#E2C285] transition-colors hover:border-[#C9A461] hover:bg-[#C9A461] hover:text-[#0A0807] disabled:opacity-45"
                >
                  {action}
                </button>
              ))}
            </div>

            {/* Input Field */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-2 border-t border-white/10 bg-[#14100D] px-3 py-2.5"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                maxLength={500}
                placeholder="Ask about shoes, sizes, or budget..."
                aria-label="Message AI Shoe Assistant"
                className="min-h-[38px] flex-1 rounded-xl border border-white/10 bg-[#0B0908] px-3 text-xs text-white placeholder-[#857A6E] focus:border-[#C9A461] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isStreaming || isTyping || !input.trim()}
                aria-label="Send message"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A461] text-[#0A0807] transition-opacity disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Tooltip + Circular Launcher Row */}
      <div className="flex items-center gap-3">
        <AnimatePresence>
          {showTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 10, scale: 0.95 }}
              className="hidden sm:flex items-center gap-2 rounded-full border border-[#C9A461]/40 bg-[#120E0B]/95 px-3.5 py-2 text-xs text-[#F5F0E8] shadow-xl"
            >
              <button
                type="button"
                onClick={handleOpenToggle}
                className="font-medium hover:text-[#E2C285]"
              >
                Need help choosing shoes?
              </button>
              <button
                type="button"
                aria-label="Dismiss assistant tooltip"
                onClick={() => {
                  setShowTooltip(false);
                  setTooltipDismissed(true);
                }}
                className="text-[#8C8277] hover:text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Perfect Circular Black & Gold Launcher with Rotating Ring, Glow Pulse & Float */}
        <div className="relative flex flex-col items-center">
          <motion.div
            animate={isOpen ? { y: 0 } : { y: [0, -5, 0] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Soft Golden Pulse */}
            <motion.span
              aria-hidden="true"
              animate={{ scale: [1, 1.22, 1], opacity: [0.45, 0, 0.45] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="pointer-events-none absolute inset-0 rounded-full border border-[#C9A461]/60"
            />

            {/* Animated Rotating Outer Ring */}
            <motion.span
              aria-hidden="true"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
              className="pointer-events-none absolute -inset-1 rounded-full border border-dashed border-[#E2C285]/55"
            />

            <motion.button
              type="button"
              onClick={handleOpenToggle}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.94 }}
              aria-label={isOpen ? 'Close AI Shoe Assistant' : 'Open AI Shoe Assistant'}
              className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full border-2 border-[#C9A461] bg-[#0B0908] text-[#E2C285] shadow-[0_0_24px_rgba(201,164,97,0.35)]"
            >
              {isOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <AnimatedAISparkleIcon className="h-6 w-6 text-[#E2C285]" />
              )}
            </motion.button>
          </motion.div>

          {/* Small AI ONLINE Status Indicator */}
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-full border border-[#C9A461]/35 bg-[#0B0908]/95 px-2 py-0.5 text-[9px] font-bold tracking-[0.12em] text-[#E2C285] shadow">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            AI ONLINE
          </span>
        </div>
      </div>
    </div>
  );
}

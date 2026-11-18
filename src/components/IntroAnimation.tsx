import { useEffect, useState } from 'react';
import { motion } from 'motion/react';

interface IntroAnimationProps {
  onComplete: () => void;
}

export default function IntroAnimation({ onComplete }: IntroAnimationProps) {
  const [stage, setStage] = useState<'dark' | 'silhouette' | 'title'>('dark');

  useEffect(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const t1 = window.setTimeout(() => setStage('silhouette'), 280);
    const t2 = window.setTimeout(() => setStage('title'), 1400);
    const t3 = window.setTimeout(() => onComplete(), 4100);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <motion.div
      key="vellmont-intro"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#050403] text-[#F5F0E8]"
      role="dialog"
      aria-label="Brand introduction"
    >
      {/* Subtle Golden Volumetric Glow */}
      <motion.div
        initial={{ opacity: 0, scale: 0.75 }}
        animate={{
          opacity: stage === 'dark' ? 0 : 0.88,
          scale: stage === 'title' ? 1.15 : 0.95,
        }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
        className="pointer-events-none absolute h-[480px] w-[480px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(201,164,97,0.22) 0%, rgba(140,98,57,0.08) 42%, rgba(5,4,3,0) 72%)',
        }}
      />

      {/* Lightweight Golden Shoe Silhouette */}
      <motion.div
        initial={{ opacity: 0, scale: 0.88, y: 12 }}
        animate={{
          opacity: stage === 'dark' ? 0 : 1,
          scale: stage === 'title' ? 0.95 : 1,
          y: 0,
        }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="relative mb-8 flex items-center justify-center"
      >
        <svg
          viewBox="0 0 420 190"
          className="h-28 w-64 sm:h-36 sm:w-88 drop-shadow-[0_18px_32px_rgba(201,164,97,0.25)]"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="introGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6E4E24" />
              <stop offset="42%" stopColor="#E7CA8E" />
              <stop offset="68%" stopColor="#C9A461" />
              <stop offset="100%" stopColor="#4A3316" />
            </linearGradient>
          </defs>
          <ellipse cx="210" cy="172" rx="165" ry="6" fill="rgba(201,164,97,0.12)" />
          <path
            d="M44 136 C42 110, 50 74, 58 58 C78 66, 98 68, 126 52 C148 39, 166 26, 184 28 C215 32, 248 64, 294 84 C334 98, 376 106, 384 128 C387 136, 380 146, 366 148 L156 149 C140 149, 134 142, 120 142 L94 142 L92 152 L46 152 C42 152, 42 143, 44 136 Z"
            stroke="url(#introGoldGrad)"
            strokeWidth="2.2"
            fill="rgba(201,164,97,0.06)"
          />
          <path
            d="M126 54 C146 82, 168 104, 206 116 C236 125, 256 138, 258 147"
            stroke="url(#introGoldGrad)"
            strokeWidth="1.2"
            strokeDasharray="3 4"
          />
          <path
            d="M276 80 C295 95, 314 114, 336 147"
            stroke="url(#introGoldGrad)"
            strokeWidth="1.2"
            strokeDasharray="3 4"
          />
        </svg>
      </motion.div>

      {/* Luxury Atelier Text Reveal: MADE BY ALI MURTAZA */}
      <div className="relative px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: stage === 'title' ? 0.85 : 0,
            y: stage === 'title' ? 0 : 10,
          }}
          transition={{ duration: 0.6 }}
          className="mb-3 text-xs tracking-[0.38em] text-[#C9A461] uppercase"
        >
          Vellmont Luxury Footwear
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, letterSpacing: '0.26em', y: 12 }}
          animate={{
            opacity: stage === 'title' ? 1 : 0,
            letterSpacing: stage === 'title' ? '0.16em' : '0.26em',
            y: stage === 'title' ? 0 : 12,
          }}
          transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          className="gold-shimmer-text font-serif text-3xl font-semibold tracking-[0.16em] sm:text-5xl md:text-6xl"
        >
          MADE BY ALI MURTAZA
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{
            scaleX: stage === 'title' ? 1 : 0,
            opacity: stage === 'title' ? 0.75 : 0,
          }}
          transition={{ duration: 0.85, delay: 0.2 }}
          className="mx-auto mt-5 h-[1px] w-48 origin-center bg-gradient-to-r from-transparent via-[#C9A461] to-transparent"
        />
      </div>

      {/* Skip Intro Button */}
      <button
        type="button"
        onClick={onComplete}
        className="absolute right-6 bottom-6 rounded-full border border-[#C9A461]/30 bg-[#120D0A]/75 px-4 py-2 text-xs font-medium tracking-wider text-[#E2C285] transition-colors hover:border-[#C9A461] hover:bg-[#1E1610] hover:text-white focus-visible:outline-2 focus-visible:outline-[#C9A461]"
      >
        Skip Intro →
      </button>
    </motion.div>
  );
}

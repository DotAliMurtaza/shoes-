import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ArrowRight, Sparkles } from 'lucide-react';
import { NavRoute } from './Navbar';

interface HeroSectionProps {
  onNavigate: (route: NavRoute) => void;
  onScrollToCollection: () => void;
  introDone: boolean;
}

const HERO_SLIDES = [
  {
    id: 'vellmont-sovereign-brogue',
    title: 'Sovereign Cognac Brogue',
    collection: 'Premium Collection · Hand-Burnished Calfskin',
    image: '/src/assets/images/hero_leather_oxford_1794984719868.jpg',
    price: 'Rs. 18,900',
  },
  {
    id: 'vellmont-everyday-taupe-mule',
    title: 'Verona Buckled Suede Mule',
    collection: 'Everyday Slipper Edition · Taupe Suede',
    image: '/src/assets/images/banner_everyday_slipper_1794984719657.jpg',
    price: 'Rs. 4,650',
  },
  {
    id: 'vellmont-milano-espresso-sneaker',
    title: 'Milano Espresso Low',
    collection: 'Architectural Sneakers · Nappa & Cognac',
    image: '/src/assets/images/shoe_sneaker_espresso_1794984721146.jpg',
    price: 'Rs. 9,400',
  },
];

const AMBIENT_PARTICLES = [
  { left: '12%', top: '24%', size: 4, delay: 0, dur: 6.5 },
  { left: '28%', top: '68%', size: 3, delay: 1.2, dur: 7.2 },
  { left: '46%', top: '18%', size: 5, delay: 0.7, dur: 8.0 },
  { left: '64%', top: '76%', size: 3, delay: 1.9, dur: 6.8 },
  { left: '82%', top: '22%', size: 4, delay: 0.4, dur: 7.5 },
  { left: '91%', top: '60%', size: 3, delay: 2.3, dur: 6.2 },
];

export default function HeroSection({
  onNavigate,
  onScrollToCollection,
  introDone,
}: HeroSectionProps) {
  const heroRef = useRef<HTMLElement | null>(null);
  const parallaxFrameRef = useRef<HTMLDivElement | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState(0);

  // Auto-advance featured editorial look smoothly
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  // GSAP entrance for hero typography
  useEffect(() => {
    if (!introDone || !heroRef.current) return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.from('.hero-stagger', {
        y: 26,
        opacity: 0,
        duration: 0.85,
        stagger: 0.11,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
      });
    }, heroRef);

    return () => ctx.revert();
  }, [introDone]);

  // Subtle desktop mouse parallax on the photography showcase
  useEffect(() => {
    const section = heroRef.current;
    const frame = parallaxFrameRef.current;
    if (!section || !frame) return;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    const handleMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const rect = section.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      frame.style.transform = `translate3d(${(nx * -14).toFixed(1)}px, ${(ny * -10).toFixed(1)}px, 0)`;
    };

    const handleLeave = () => {
      frame.style.transform = 'translate3d(0px, 0px, 0)';
    };

    section.addEventListener('pointermove', handleMove, { passive: true });
    section.addEventListener('pointerleave', handleLeave);
    return () => {
      section.removeEventListener('pointermove', handleMove);
      section.removeEventListener('pointerleave', handleLeave);
    };
  }, []);

  const currentSlide = HERO_SLIDES[activeSlideIdx];

  return (
    <section
      ref={heroRef}
      className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-gradient-to-br from-[#080605] via-[#130D09] to-[#0B0806] text-[#F5F0E8]"
    >
      {/* Animated Champagne-Gold Ambient Gradients */}
      <motion.div
        aria-hidden="true"
        animate={{ opacity: [0.35, 0.58, 0.35], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        className="pointer-events-none absolute -top-24 right-[-10%] h-[560px] w-[560px] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(201,164,97,0.22) 0%, rgba(140,98,57,0.08) 45%, transparent 72%)',
        }}
      />

      {/* Subtle Diagonal Golden Light Sweep */}
      <motion.div
        aria-hidden="true"
        animate={{ x: ['-100%', '220%'] }}
        transition={{ duration: 7.5, repeat: Infinity, repeatDelay: 4, ease: 'easeInOut' }}
        className="pointer-events-none absolute inset-y-0 w-1/3 skew-x-[-22deg] bg-gradient-to-r from-transparent via-[#E2C285]/[0.05] to-transparent"
      />

      {/* Floating Decorative Golden Dust Particles */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {AMBIENT_PARTICLES.map((p, idx) => (
          <motion.span
            key={idx}
            style={{ left: p.left, top: p.top, width: p.size, height: p.size }}
            animate={{ y: [-10, 12, -10], opacity: [0.18, 0.65, 0.18] }}
            transition={{
              duration: p.dur,
              delay: p.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute rounded-full bg-[#E2C285]"
          />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1380px] grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8 lg:py-10">
        {/* Left Editorial Typography Column */}
        <div className="lg:col-span-5 flex flex-col items-start">
          <p className="hero-stagger mb-4 text-xs font-medium tracking-[0.28em] text-[#C9A461] uppercase">
            VELLMONT Atelier · Made by Ali Murtaza
          </p>

          <h1 className="hero-stagger font-serif text-4xl font-semibold leading-[1.06] tracking-tight text-[#FBF7F0] sm:text-5xl xl:text-[58px]">
            CRAFTED FOR THOSE WHO WALK WITH PURPOSE
          </h1>

          <p className="hero-stagger mt-5 max-w-lg text-[15px] leading-relaxed text-[#CFC5B8] sm:text-base">
            Discover timeless craftsmanship, exceptional comfort, and premium footwear designed for every occasion.
          </p>

          <div className="hero-stagger mt-8 flex flex-wrap items-center gap-4">
            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate({ page: 'collections' })}
              className="group inline-flex min-h-[48px] items-center gap-2.5 rounded-lg bg-gradient-to-r from-[#C9A461] via-[#DFBE80] to-[#C9A461] bg-[length:200%_auto] px-7 py-3 text-xs font-bold tracking-[0.12em] text-[#0A0807] shadow-[0_14px_34px_rgba(201,164,97,0.28)] transition-all duration-300 hover:bg-right hover:shadow-[0_18px_42px_rgba(201,164,97,0.42)] whitespace-nowrap"
            >
              <span>EXPLORE COLLECTION</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </motion.button>

            <motion.button
              type="button"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onScrollToCollection}
              className="inline-flex min-h-[48px] items-center gap-2 rounded-lg border border-[#C9A461]/45 bg-[#16100C]/85 px-6 py-3 text-xs font-semibold tracking-[0.12em] text-[#F1E8DA] transition-colors hover:border-[#C9A461] hover:bg-[#C9A461]/15 hover:text-white whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4 text-[#C9A461]" />
              <span>SHOP NOW</span>
            </motion.button>
          </div>

          <div className="hero-stagger mt-10 grid w-full max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <p className="font-serif text-2xl font-semibold text-[#E2C285] tabular-nums">140+</p>
              <p className="mt-0.5 text-xs text-[#A3988A]">Artisan Steps</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-semibold text-[#E2C285] tabular-nums">100%</p>
              <p className="mt-0.5 text-xs text-[#A3988A]">Full-Grain Leather</p>
            </div>
            <div>
              <p className="font-serif text-2xl font-semibold text-[#E2C285] tabular-nums">4.9 ★</p>
              <p className="mt-0.5 text-xs text-[#A3988A]">Verified Rating</p>
            </div>
          </div>
        </div>

        {/* Right 2D Luxury Product Photography Reveal Column */}
        <div className="lg:col-span-7">
          <div
            ref={parallaxFrameRef}
            style={{ transition: 'transform 220ms cubic-bezier(0.16, 1, 0.3, 1)' }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl border border-[#C9A461]/30 bg-[#120D0A] shadow-[0_30px_80px_rgba(0,0,0,0.72)]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide.id}
                  initial={{ opacity: 0, scale: 1.06 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                  onClick={() => onNavigate({ page: 'product', productId: currentSlide.id })}
                  className="group relative cursor-pointer"
                >
                  <img
                    src={currentSlide.image}
                    alt={currentSlide.title}
                    referrerPolicy="no-referrer"
                    className="aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />

                  {/* Contrast Scrim & Editorial Caption */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between gap-2 p-5 sm:flex-row sm:items-end sm:p-7">
                    <div>
                      <p className="text-[11px] font-medium tracking-[0.2em] text-[#E2C285] uppercase">
                        {currentSlide.collection}
                      </p>
                      <h2 className="mt-1 font-serif text-2xl font-semibold text-white sm:text-3xl">
                        {currentSlide.title}
                      </h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-[#E2C285] tabular-nums">
                        {currentSlide.price}
                      </span>
                      <span className="rounded-lg border border-[#C9A461]/50 bg-[#0B0908]/80 px-3 py-1.5 text-xs font-medium text-white transition-colors group-hover:bg-[#C9A461] group-hover:text-[#0A0807]">
                        Inspect Pair →
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Editorial Slide Indicators */}
            <div className="mt-4 flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                {HERO_SLIDES.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setActiveSlideIdx(idx)}
                    aria-label={`View ${s.title}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      activeSlideIdx === idx
                        ? 'w-10 bg-[#C9A461]'
                        : 'w-4 bg-white/25 hover:bg-white/45'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-[#9C9286] tabular-nums">
                0{activeSlideIdx + 1} / 0{HERO_SLIDES.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

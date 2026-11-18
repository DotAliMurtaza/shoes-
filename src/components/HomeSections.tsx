import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
  Feather,
  Lock,
  Star,
} from 'lucide-react';
import { PRODUCTS, ShoeProduct } from '../lib/products';
import { WHATSAPP_NUMBER_DISPLAY, WHATSAPP_NUMBER_INTL } from '../lib/whatsapp';
import ProductCard from './ProductCard';
import { NavRoute } from './Navbar';
import {
  AnimatedDeliveryIcon,
  AnimatedLocationIcon,
  AnimatedSupportIcon,
  AnimatedWhatsAppIcon,
} from './AnimatedIcons';

gsap.registerPlugin(ScrollTrigger);

interface HomeSectionsProps {
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onViewDetails: (productId: string) => void;
  onAddToCart: (product: ShoeProduct, size: number, colorName: string, colorHex: string) => void;
  onNavigate: (route: NavRoute) => void;
  savedEmail?: string;
  onSubscribeNewsletter: (email: string) => void;
}

const CATEGORY_SHOWCASE = [
  {
    name: 'Formal Shoes',
    caption: 'Brogues & Oxfords',
    image: '/src/assets/images/shoe_formal_obsidian_1794984721310.jpg',
  },
  {
    name: 'Sneakers',
    caption: 'Court & Minimalist',
    image: '/src/assets/images/shoe_sneaker_espresso_1794984721146.jpg',
  },
  {
    name: 'Casual Shoes',
    caption: 'Mules & Slippers',
    image: '/src/assets/images/shoe_slipper_suede_1794984722813.jpg',
  },
  {
    name: 'Sports Shoes',
    caption: 'Knit Performance',
    image: '/src/assets/images/shoe_sport_obsidian_1794984721850.jpg',
  },
  {
    name: 'Leather Shoes',
    caption: 'Loafers & Museum Calf',
    image: '/src/assets/images/shoe_loafer_cognac_1794984722286.jpg',
  },
];

const TESTIMONIALS = [
  {
    name: 'Hamza Tariq',
    role: 'Principal Architect · Lahore',
    quote:
      'Ordered the Sovereign Cognac Brogue for my brother’s reception. The burnished patina looks richer in person than on screen, and zero heel blister even after 8 hours standing.',
    product: 'Sovereign Cognac Brogue',
    rating: 5,
  },
  {
    name: 'Zainab Farooq',
    role: 'Creative Director · Karachi',
    quote:
      'The Verona Buckled Suede Mule and Alabaster Court Sneakers have become my daily uniform. The AI assistant sized me at EU 38 on the first try.',
    product: 'Verona Buckled Suede Mule',
    rating: 5,
  },
  {
    name: 'Bilal Siddiqui',
    role: 'Corporate Counsel · Islamabad',
    quote:
      'Seamless WhatsApp order confirmation—received my Valence Office Derby in 48 hours with dust bags and cedar shoe horn included.',
    product: 'Valence Office Derby',
    rating: 5,
  },
];

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const elRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let started = false;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          started = true;
          const start = performance.now();
          const duration = 1100;
          const step = (now: number) => {
            const p = Math.min(1, (now - start) / duration);
            const eased = 1 - Math.pow(1 - p, 3);
            setVal(Math.round(target * eased));
            if (p < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={elRef} className="tabular-nums">
      {val}
      {suffix}
    </span>
  );
}

export default function HomeSections({
  wishlistIds,
  onToggleWishlist,
  onViewDetails,
  onAddToCart,
  onNavigate,
  savedEmail,
  onSubscribeNewsletter,
}: HomeSectionsProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [emailInput, setEmailInput] = useState(savedEmail || '');
  const [subscribed, setSubscribed] = useState(Boolean(savedEmail));
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('.gsap-fade-up').forEach((el) => {
        gsap.from(el, {
          y: 26,
          opacity: 0,
          duration: 0.72,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: {
            trigger: el,
            start: 'top 87%',
            once: true,
          },
        });
      });
    }, container);

    return () => ctx.revert();
  }, []);

  // Auto-advance testimonial slider smoothly
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveReviewIdx((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, []);

  const bestSellers = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 3);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) return;
    onSubscribeNewsletter(emailInput.trim());
    setSubscribed(true);
  };

  const currentReview = TESTIMONIALS[activeReviewIdx];

  return (
    <div ref={containerRef}>
      {/* Categories Showcase Strip */}
      <section className="bg-[#0F0B09] py-16 text-[#F5F0E8] border-y border-[#C9A461]/15">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          <div className="gsap-fade-up flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.24em] text-[#C9A461] uppercase">
                Explore By Silhouette
              </p>
              <h2 className="mt-1 font-serif text-3xl font-semibold text-white sm:text-4xl">
                Curated Shoe Categories
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate({ page: 'collections' })}
              className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider text-[#E2C285] uppercase hover:text-white"
            >
              <span>All Categories</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORY_SHOWCASE.map((cat) => (
              <motion.button
                key={cat.name}
                type="button"
                whileHover={{ y: -4 }}
                onClick={() => onNavigate({ page: 'collections', category: cat.name })}
                className="group relative overflow-hidden rounded-xl border border-[#C9A461]/20 bg-[#17120E] text-left transition-colors hover:border-[#C9A461]"
              >
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#F7F3EC]">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3.5">
                  <p className="font-serif text-lg font-semibold text-white group-hover:text-[#E2C285]">
                    {cat.name}
                  </p>
                  <p className="text-[11px] text-[#A89E91]">{cat.caption}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Campaign Spotlight — The Everyday Slipper */}
      <section className="relative overflow-hidden bg-[#0A0807] py-16 text-[#F5F0E8] sm:py-22">
        <div className="mx-auto grid max-w-[1380px] grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="gsap-fade-up lg:col-span-5">
            <p className="text-xs font-medium tracking-[0.24em] text-[#C9A461] uppercase">
              Campaign Edition · Everyday Comfort
            </p>
            <h2 className="mt-3 font-serif text-4xl font-semibold leading-tight text-white sm:text-5xl">
              The Everyday Slipper
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[#C9BFB2]">
              Hand-lasted taupe suede and full-grain espresso calfskin with brushed-brass roller buckles. Crafted to carry effortlessly from quiet morning study to evening architecture walks.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onViewDetails('vellmont-everyday-taupe-mule')}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-lg bg-gradient-to-r from-[#C9A461] to-[#E2C285] px-6 py-2.5 text-sm font-semibold text-[#0A0807] transition-transform hover:-translate-y-0.5 whitespace-nowrap"
              >
                <span>Shop Slippers</span>
                <ArrowRight className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'collections', category: 'Casual Shoes' })}
                className="inline-flex min-h-[46px] items-center rounded-lg border border-[#C9A461]/40 px-5 py-2.5 text-sm font-medium text-[#E9DFD1] transition-colors hover:border-[#C9A461] hover:text-white whitespace-nowrap"
              >
                View Casual Edit
              </button>
            </div>
          </div>

          <div className="gsap-fade-up lg:col-span-7">
            <div className="relative overflow-hidden rounded-2xl border border-[#C9A461]/25 bg-[#140F0C] shadow-2xl">
              <img
                src="/src/assets/images/banner_everyday_slipper_1794984719657.jpg"
                alt="VELLMONT Verona Buckled Suede Mule floating over dark stone"
                referrerPolicy="no-referrer"
                loading="lazy"
                className="aspect-[16/9] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Best Sellers Showcase */}
      <section className="bg-[#F3EDE3] py-16 text-[#14100D] sm:py-20">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          <div className="gsap-fade-up flex flex-col justify-between gap-4 border-b border-[#E0D6C6] pb-6 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-medium tracking-[0.22em] text-[#8C6239] uppercase">
                Most Requested
              </p>
              <h2 className="mt-1 font-serif text-3xl font-semibold text-[#14100D] sm:text-4xl">
                Best Sellers
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate({ page: 'collections', filter: 'bestsellers' })}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#8C6239] hover:text-[#14100D] whitespace-nowrap"
            >
              <span>Browse All Best Sellers</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {bestSellers.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onViewDetails={onViewDetails}
                onAddToCart={onAddToCart}
                showBestSellerTag={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us — Animated Circular Icons */}
      <section className="bg-[#0B0908] py-16 text-[#F5F0E8] sm:py-20 border-y border-[#C9A461]/15">
        <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
          <div className="gsap-fade-up text-center max-w-2xl mx-auto">
            <p className="text-xs font-medium tracking-[0.24em] text-[#C9A461] uppercase">
              Why Choose Us
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
              The Vellmont Promise
            </h2>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Award,
                title: 'Premium Quality',
                desc: 'Over 140 hand-finishing operations per pair, inspected under studio light before dispatch.',
              },
              {
                icon: Feather,
                title: 'Comfortable Design',
                desc: 'Anatomical cork-and-memory-foam footbeds that contour naturally to your arch over time.',
              },
              {
                icon: null,
                customIcon: 'delivery',
                title: 'Fast Delivery',
                desc: 'Express insured nationwide delivery—complimentary on all orders Rs. 8,000 and above.',
              },
              {
                icon: Lock,
                title: 'Secure Shopping',
                desc: 'Direct verified WhatsApp order confirmation with 14-day unworn size exchange protection.',
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  whileHover={{ y: -4 }}
                  className="gsap-fade-up flex flex-col items-center rounded-xl border border-[#C9A461]/20 bg-[#14100D] p-6 text-center transition-colors hover:border-[#C9A461]/55"
                >
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.08 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                    className="flex h-14 w-14 items-center justify-center rounded-full border border-[#C9A461]/45 bg-[#C9A461]/12 text-[#E2C285]"
                  >
                    {item.customIcon === 'delivery' ? (
                      <AnimatedDeliveryIcon className="h-6 w-6" />
                    ) : (
                      Icon && <Icon className="h-6 w-6" />
                    )}
                  </motion.div>
                  <h3 className="mt-4 font-serif text-xl font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#B5AAA0]">{item.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brand Story — Atelier Ali Murtaza + Animated Counters */}
      <section className="relative overflow-hidden bg-[#120D0A] py-20 text-[#F5F0E8]">
        <div className="mx-auto grid max-w-[1380px] grid-cols-1 items-stretch gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="gsap-fade-up lg:col-span-6 overflow-hidden rounded-2xl border border-[#C9A461]/25">
            <img
              src="/src/assets/images/hero_leather_oxford_1794984719868.jpg"
              alt="Hand-burnished cognac brogue craftsmanship at Ali Murtaza Atelier"
              referrerPolicy="no-referrer"
              loading="lazy"
              className="h-full min-h-[320px] w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
            />
          </div>

          <div className="gsap-fade-up lg:col-span-6 flex flex-col justify-center">
            <p className="text-xs font-medium tracking-[0.26em] text-[#C9A461] uppercase">
              Brand Story · Atelier Ali Murtaza
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold leading-tight text-white sm:text-5xl">
              Made by Ali Murtaza — Where Architecture Meets Leather
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-[#CFC6BA]">
              Every VELLMONT silhouette begins as a sculpted wooden last carved for anatomical poise. Rather than masking structural shortcuts with heavy adhesives, our atelier builds shoes like fine horology: stitched Goodyear welts, breathable lambskin linings, and hand-burnished patinas that deepen in character with every mile.
            </p>

            {/* Animated Counters */}
            <div className="mt-8 grid grid-cols-3 gap-4 border-y border-white/10 py-5">
              <div>
                <p className="font-serif text-2xl font-semibold text-[#E2C285] sm:text-3xl">
                  <AnimatedCounter target={140} suffix="+" />
                </p>
                <p className="mt-0.5 text-xs text-[#A3988A]">Craft Steps</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-[#E2C285] sm:text-3xl">
                  <AnimatedCounter target={12} />
                </p>
                <p className="mt-0.5 text-xs text-[#A3988A]">Signature Lasts</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-semibold text-[#E2C285] sm:text-3xl">
                  <AnimatedCounter target={48} suffix="h" />
                </p>
                <p className="mt-0.5 text-xs text-[#A3988A]">Express Dispatch</p>
              </div>
            </div>

            <div className="mt-7 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate({ page: 'about' })}
                className="inline-flex min-h-[46px] items-center gap-2 rounded-lg border border-[#C9A461] px-6 py-2.5 text-sm font-semibold text-[#E2C285] transition-colors hover:bg-[#C9A461] hover:text-[#0A0807] whitespace-nowrap"
              >
                <span>Read Our Story</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Reviews — Smooth Testimonial Slider with Animated Rating Stars */}
      <section className="bg-[#FAF7F2] py-16 text-[#14100D] sm:py-20">
        <div className="mx-auto max-w-[1040px] px-4 sm:px-6 lg:px-8">
          <div className="gsap-fade-up text-center">
            <p className="text-xs font-medium tracking-[0.22em] text-[#8C6239] uppercase">
              Customer Reviews
            </p>
            <h2 className="mt-2 font-serif text-3xl font-semibold text-[#14100D] sm:text-4xl">
              Worn Across Boardrooms & Ceremonies
            </h2>
          </div>

          <div className="mt-10 relative">
            <div className="overflow-hidden rounded-2xl border border-[#E5DDD0] bg-white p-7 shadow-sm sm:p-10">
              <AnimatePresence mode="wait">
                <motion.blockquote
                  key={currentReview.name}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-1.5 text-[#C9A461]">
                    {Array.from({ length: currentReview.rating }).map((_, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: idx * 0.08, duration: 0.3 }}
                      >
                        <Star className="h-5 w-5 fill-[#C9A461]" />
                      </motion.span>
                    ))}
                  </div>

                  <p className="mx-auto mt-6 max-w-2xl font-serif text-xl leading-relaxed text-[#221B15] sm:text-2xl">
                    “{currentReview.quote}”
                  </p>

                  <footer className="mt-6">
                    <p className="font-serif text-lg font-semibold text-[#14100D]">
                      {currentReview.name}
                    </p>
                    <p className="text-xs text-[#6E645A]">
                      {currentReview.role} · {currentReview.product}
                    </p>
                  </footer>
                </motion.blockquote>
              </AnimatePresence>
            </div>

            {/* Slider Controls */}
            <div className="mt-6 flex items-center justify-center gap-4">
              <button
                type="button"
                aria-label="Previous testimonial"
                onClick={() =>
                  setActiveReviewIdx(
                    (prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DFD5C5] bg-white text-[#14100D] transition-colors hover:border-[#C9A461] hover:bg-[#14100D] hover:text-[#E2C285]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="flex items-center gap-2">
                {TESTIMONIALS.map((t, idx) => (
                  <button
                    key={t.name}
                    type="button"
                    aria-label={`View review by ${t.name}`}
                    onClick={() => setActiveReviewIdx(idx)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      activeReviewIdx === idx ? 'w-7 bg-[#C9A461]' : 'w-2 bg-[#D6CEC2]'
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-label="Next testimonial"
                onClick={() =>
                  setActiveReviewIdx((prev) => (prev + 1) % TESTIMONIALS.length)
                }
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#DFD5C5] bg-white text-[#14100D] transition-colors hover:border-[#C9A461] hover:bg-[#14100D] hover:text-[#E2C285]"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="border-t border-[#C9A461]/20 bg-[#0F0B09] py-16 text-[#F5F0E8]">
        <div className="mx-auto flex max-w-[920px] flex-col items-center px-4 text-center sm:px-6">
          <p className="text-xs font-medium tracking-[0.24em] text-[#C9A461] uppercase">
            Private Invitation
          </p>
          <h2 className="mt-2 font-serif text-3xl font-semibold text-white sm:text-4xl">
            Receive Early Access to Limited Lasts
          </h2>
          <p className="mt-3 max-w-xl text-sm text-[#B8AEA0]">
            Join the VELLMONT Atelier ledger for bespoke seasonal releases, leather care guides, and private trunk show invitations.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="mt-7 flex w-full max-w-md flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              required
              value={emailInput}
              onChange={(e) => {
                setEmailInput(e.target.value);
                setSubscribed(false);
              }}
              placeholder="Enter your email address"
              aria-label="Email address for newsletter"
              className="min-h-[46px] flex-1 rounded-lg border border-[#C9A461]/30 bg-[#1A1410] px-4 text-sm text-white placeholder-[#8B8073] focus:border-[#C9A461] focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#C9A461] to-[#E2C285] px-6 text-sm font-semibold text-[#0A0807] transition-opacity hover:opacity-95 whitespace-nowrap"
            >
              {subscribed ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Subscribed</span>
                </>
              ) : (
                <span>Subscribe</span>
              )}
            </button>
          </form>
          {subscribed && (
            <p className="mt-3 text-xs text-[#E2C285]">
              Welcome to the Atelier Ledger. Your invitation preferences are saved.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

interface FooterProps {
  onNavigate: (route: NavRoute) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  return (
    <footer className="border-t border-[#C9A461]/20 bg-[#070605] py-14 text-[#C9BFB2]">
      <div className="mx-auto grid max-w-[1380px] grid-cols-1 gap-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <p className="font-serif text-2xl font-semibold tracking-[0.2em] text-[#F5F0E8]">
            VELLMONT
          </p>
          <p className="mt-3 text-xs leading-relaxed text-[#9C9286]">
            Luxury handcrafted footwear house by Ali Murtaza. Merging architectural poise with timeless full-grain leather craftsmanship.
          </p>
          <p className="mt-4 text-xs font-medium tracking-wider text-[#C9A461]">
            MADE BY ALI MURTAZA
          </p>
        </div>

        <div>
          <h3 className="font-serif text-lg font-semibold text-white">Collections</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              { label: 'Formal Shoes', cat: 'Formal Shoes' },
              { label: 'Sneakers', cat: 'Sneakers' },
              { label: 'Leather Shoes', cat: 'Leather Shoes' },
              { label: 'Casual & Slippers', cat: 'Casual Shoes' },
              { label: 'Sports Shoes', cat: 'Sports Shoes' },
              { label: 'Premium Collection', cat: 'Premium Collection' },
            ].map((item) => (
              <li key={item.label}>
                <button
                  type="button"
                  onClick={() => onNavigate({ page: 'collections', category: item.cat })}
                  className="transition-colors hover:text-[#E2C285]"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-lg font-semibold text-white">Atelier & Care</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'about' })}
                className="transition-colors hover:text-[#E2C285]"
              >
                About Ali Murtaza Atelier
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'cart' })}
                className="transition-colors hover:text-[#E2C285]"
              >
                Shopping Bag
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'account' })}
                className="transition-colors hover:text-[#E2C285]"
              >
                Saved Wishlist & History
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => onNavigate({ page: 'contact' })}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-[#E2C285]"
              >
                <AnimatedSupportIcon className="h-3.5 w-3.5 text-[#C9A461]" />
                <span>Contact & Private Fittings</span>
              </button>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-serif text-lg font-semibold text-white">Concierge & WhatsApp</h3>
          <p className="mt-3 flex items-center gap-2 text-xs text-[#9C9286]">
            <AnimatedLocationIcon className="h-4 w-4 text-[#C9A461] shrink-0" />
            <span>Gulberg III Design District, Lahore</span>
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER_INTL}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-[#C9A461]/40 bg-[#15100C] px-4 py-2.5 text-xs font-semibold text-[#E2C285] transition-colors hover:border-[#C9A461] hover:bg-[#C9A461] hover:text-[#0A0807]"
          >
            <AnimatedWhatsAppIcon className="h-4 w-4" />
            <span>WhatsApp: {WHATSAPP_NUMBER_DISPLAY}</span>
          </a>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-[1380px] flex-col items-center justify-between gap-4 border-t border-white/10 px-4 pt-6 text-xs text-[#80766B] sm:flex-row sm:px-6 lg:px-8">
        <p>© {new Date().getFullYear()} VELLMONT Atelier · Made by Ali Murtaza. All rights reserved.</p>
        <p>Handcrafted Footwear · Express WhatsApp Ordering</p>
      </div>
    </footer>
  );
}

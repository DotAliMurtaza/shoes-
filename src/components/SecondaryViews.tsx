import { useState } from 'react';
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import { PRODUCTS, ShoeProduct, formatPKR, getEffectivePrice } from '../lib/products';
import { CartItem } from '../lib/storage';
import {
  WHATSAPP_NUMBER_DISPLAY,
  WHATSAPP_NUMBER_INTL,
  buildWhatsAppOrderUrl,
  calculateShipping,
} from '../lib/whatsapp';
import ProductCard from './ProductCard';
import { AnimatedLocationIcon, AnimatedWhatsAppIcon } from './AnimatedIcons';

export function CartView({
  items,
  onUpdateQty,
  onRemoveItem,
  onCheckout,
  onContinueShopping,
}: {
  items: CartItem[];
  onUpdateQty: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onCheckout: () => void;
  onContinueShopping: () => void;
}) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  return (
    <section className="min-h-[75vh] bg-[#FAF7F2] py-12 text-[#14100D] sm:py-16">
      <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8">
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">Shopping Bag</h1>

        {items.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-[#E5DDD0] bg-white p-12 text-center">
            <ShoppingBag className="mx-auto h-12 w-12 text-[#C9A461]" />
            <h2 className="mt-4 font-serif text-2xl font-semibold">Your bag is empty</h2>
            <p className="mt-2 text-sm text-[#5E544B]">
              Discover handcrafted leather dress shoes, sneakers, and mules across our collection.
            </p>
            <button
              type="button"
              onClick={onContinueShopping}
              className="mt-6 rounded-lg bg-[#14100D] px-6 py-3 text-sm font-semibold text-[#E2C285]"
            >
              Explore Collection
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-8 space-y-4">
              {items.map((item, idx) => (
                <div
                  key={`${item.productId}-${item.size}-${item.colorName}`}
                  className="flex flex-col gap-4 rounded-xl border border-[#E5DDD0] bg-white p-4 sm:flex-row sm:items-center"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="h-24 w-32 rounded-lg object-cover bg-[#F7F3EC] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-xl font-semibold text-[#14100D]">
                      {item.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#6E645A]">
                      {item.category} · Size EU {item.size} · {item.colorName}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#8C6239] tabular-nums">
                      {formatPKR(item.price)}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <div className="flex items-center rounded-lg border border-[#DFD5C5] bg-[#FAF7F2]">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() => onUpdateQty(idx, -1)}
                        className="flex h-9 w-9 items-center justify-center"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() => onUpdateQty(idx, 1)}
                        className="flex h-9 w-9 items-center justify-center"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="w-24 text-right text-sm font-bold tabular-nums">
                      {formatPKR(item.price * item.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemoveItem(idx)}
                      aria-label={`Remove ${item.name}`}
                      className="p-1.5 text-[#8C8277] hover:text-[#9E2A2B]"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="lg:col-span-4 rounded-2xl border border-[#E5DDD0] bg-[#14100D] p-6 text-[#F5F0E8]">
              <h2 className="font-serif text-2xl font-semibold text-white">Order Summary</h2>
              <div className="mt-5 space-y-2.5 text-sm">
                <div className="flex justify-between text-[#C9BFB2]">
                  <span>Subtotal</span>
                  <span className="tabular-nums">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#C9BFB2]">
                  <span>Delivery</span>
                  <span className="tabular-nums">
                    {shipping === 0 ? 'Complimentary' : formatPKR(shipping)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-white/15 pt-3 text-lg font-semibold text-white">
                  <span>Total</span>
                  <span className="text-[#E2C285] tabular-nums">{formatPKR(total)}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={onCheckout}
                className="mt-6 min-h-[48px] w-full rounded-lg bg-gradient-to-r from-[#C9A461] to-[#E2C285] text-sm font-semibold text-[#0A0807]"
              >
                Proceed to WhatsApp Checkout
              </button>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}

export function AboutView({ onShopNow }: { onShopNow: () => void }) {
  return (
    <div className="bg-[#0B0908] text-[#F5F0E8]">
      <section className="mx-auto max-w-[1220px] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <p className="text-xs font-medium tracking-[0.26em] text-[#C9A461] uppercase">
          VELLMONT Atelier · Made by Ali Murtaza
        </p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-semibold leading-tight text-white sm:text-6xl">
          Sculpted Footwear Engineered Like Fine Architecture
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-[#C9BFB2]">
          Founded with a singular obsession for balance, posture, and enduring leathercraft, VELLMONT unites traditional Goodyear storm welting with anatomical last geometry.
        </p>

        <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 overflow-hidden rounded-2xl border border-[#C9A461]/25">
            <img
              src="/src/assets/images/hero_leather_oxford_1794984719868.jpg"
              alt="Handcrafted VELLMONT Oxford"
              referrerPolicy="no-referrer"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-5">
            <h2 className="font-serif text-3xl font-semibold text-[#E2C285]">
              Hand-Lasted Precision
            </h2>
            <p className="text-sm leading-relaxed text-[#CFC6BA]">
              Every signature Oxford, loafer, and court sneaker is built from full-grain Italian calfskin, a 360-degree stitched welt, cork-and-memory-foam footbeds, and brushed-brass hardware—finishing each pair across 140+ workshop stages.
            </p>
            <button
              type="button"
              onClick={onShopNow}
              className="inline-flex min-h-[46px] items-center rounded-lg bg-gradient-to-r from-[#C9A461] to-[#E2C285] px-6 text-sm font-semibold text-[#0A0807]"
            >
              Explore the Collection
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export function ContactView() {
  const [name, setName] = useState('');
  const [topic, setTopic] = useState('Sizing & Fit Consultation');
  const [message, setMessage] = useState('');
  const [readyLink, setReadyLink] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formatted = `Hello VELLMONT Atelier,\n*Name:* ${name}\n*Topic:* ${topic}\n*Message:* ${message}`;
    const url = buildWhatsAppOrderUrl(formatted);
    setReadyLink(url);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="min-h-[75vh] bg-[#FAF7F2] py-14 text-[#14100D] sm:py-20">
      <div className="mx-auto grid max-w-[1140px] grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
        <div className="lg:col-span-5">
          <p className="text-xs font-medium tracking-[0.22em] text-[#8C6239] uppercase">
            Client Concierge
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Contact Atelier</h1>
          <p className="mt-3 text-sm leading-relaxed text-[#5E544B]">
            Reach Ali Murtaza Atelier directly on WhatsApp for bespoke sizing advice, bulk wedding orders, or shipment tracking.
          </p>

          <div className="mt-8 space-y-4 rounded-2xl border border-[#E5DDD0] bg-white p-6">
            <div className="flex items-start gap-3">
              <AnimatedWhatsAppIcon className="h-5 w-5 text-[#1C6B43] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase text-[#6E645A]">WhatsApp Direct</p>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER_INTL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-bold text-[#14100D] hover:text-[#8C6239]"
                >
                  {WHATSAPP_NUMBER_DISPLAY}
                </a>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <AnimatedLocationIcon className="h-5 w-5 text-[#8C6239] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase text-[#6E645A]">Flagship Studio</p>
                <p className="text-sm text-[#14100D]">
                  Gulberg III Design District, Lahore · Nationwide Express Dispatch
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 rounded-2xl border border-[#E5DDD0] bg-white p-6 shadow-sm sm:p-8">
          <h2 className="font-serif text-2xl font-semibold">Send Direct Concierge Message</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label htmlFor="contact-name" className="block text-xs font-semibold text-[#3D342B]">
                Your Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#DCD2C2] bg-[#FAF7F2] px-4 text-sm focus:border-[#C9A461] focus:outline-none"
              />
            </div>
            <div>
              <label htmlFor="contact-topic" className="block text-xs font-semibold text-[#3D342B]">
                Inquiry Topic
              </label>
              <select
                id="contact-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1.5 min-h-[44px] w-full rounded-lg border border-[#DCD2C2] bg-[#FAF7F2] px-4 text-sm focus:border-[#C9A461] focus:outline-none"
              >
                <option>Sizing & Fit Consultation</option>
                <option>Wedding & Custom Patina Order</option>
                <option>Order Status & Delivery</option>
                <option>General Atelier Inquiry</option>
              </select>
            </div>
            <div>
              <label htmlFor="contact-msg" className="block text-xs font-semibold text-[#3D342B]">
                Message
              </label>
              <textarea
                id="contact-msg"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="How can our shoemakers assist you?"
                className="mt-1.5 w-full rounded-lg border border-[#DCD2C2] bg-[#FAF7F2] p-3.5 text-sm focus:border-[#C9A461] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="min-h-[46px] w-full rounded-lg bg-[#1C6B43] text-sm font-semibold text-white hover:bg-[#155534]"
            >
              Send via WhatsApp
            </button>
          </form>

          {readyLink && (
            <p className="mt-4 text-xs text-[#4E443B]">
              WhatsApp message prepared.{' '}
              <a
                href={readyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#1C6B43] underline"
              >
                Click here if WhatsApp did not launch
              </a>
              .
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function AccountWishlistView({
  wishlistIds,
  recentIds,
  onToggleWishlist,
  onViewDetails,
  onAddToCart,
  onBackHome,
}: {
  wishlistIds: string[];
  recentIds: string[];
  onToggleWishlist: (id: string) => void;
  onViewDetails: (id: string) => void;
  onAddToCart: (p: ShoeProduct, sz: number, col: string, hex: string) => void;
  onBackHome: () => void;
}) {
  const wishlisted = PRODUCTS.filter((p) => wishlistIds.includes(p.id));
  const recent = recentIds
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is ShoeProduct => Boolean(p));

  return (
    <section className="min-h-[75vh] bg-[#FAF7F2] py-12 text-[#14100D] sm:py-16">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBackHome}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold uppercase text-[#6E645A] hover:text-[#14100D]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Atelier</span>
        </button>

        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">
          Saved Wishlist & History
        </h1>

        <div className="mt-8">
          <h2 className="flex items-center gap-2 font-serif text-2xl font-semibold">
            <Heart className="h-5 w-5 text-[#C9A461]" />
            <span>Saved Pairs ({wishlisted.length})</span>
          </h2>

          {wishlisted.length === 0 ? (
            <p className="mt-4 rounded-xl border border-[#E5DDD0] bg-white p-8 text-sm text-[#5E544B]">
              No saved footwear yet. Tap the heart icon on any shoe to save it here.
            </p>
          ) : (
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {wishlisted.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={true}
                  onToggleWishlist={onToggleWishlist}
                  onViewDetails={onViewDetails}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </div>

        {recent.length > 0 && (
          <div className="mt-14 border-t border-[#E5DDD0] pt-10">
            <h2 className="font-serif text-2xl font-semibold">Recently Viewed</h2>
            <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted={wishlistIds.includes(p.id)}
                  onToggleWishlist={onToggleWishlist}
                  onViewDetails={onViewDetails}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function SearchModal({
  isOpen,
  onClose,
  onSelectProduct,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (id: string) => void;
}) {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();
  const matches = q
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.occasion.toLowerCase().includes(q)
      )
    : PRODUCTS.slice(0, 6);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center bg-black/75 p-4 pt-20 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Search footwear catalog"
    >
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-[#C9A461]/30 bg-[#120E0B] text-[#F5F0E8] shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
          <Search className="h-5 w-5 text-[#C9A461]" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Oxford, sneakers, suede mule, wedding, office..."
            className="flex-1 bg-transparent text-sm text-white placeholder-[#8C8277] focus:outline-none"
          />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-full p-1 text-[#9C9286] hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/5 p-3">
          {matches.length === 0 ? (
            <p className="p-8 text-center text-sm text-[#9C9286]">
              No shoes matched “{query}”. Try searching for “Oxford”, “Sneakers”, or “Slipper”.
            </p>
          ) : (
            matches.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  onClose();
                  onSelectProduct(p.id);
                }}
                className="flex w-full items-center gap-4 rounded-xl p-2.5 text-left transition-colors hover:bg-white/5"
              >
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="h-14 w-18 rounded-lg object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="truncate font-serif text-lg font-semibold text-white">
                    {p.name}
                  </p>
                  <p className="text-xs text-[#9C9286]">
                    {p.category} · {p.gender}
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#E2C285] tabular-nums">
                  {formatPKR(getEffectivePrice(p))}
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

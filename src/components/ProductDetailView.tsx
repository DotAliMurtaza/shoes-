import { Suspense, lazy, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Box,
  CheckCircle2,
  Image as ImageIcon,
  Minus,
  Plus,
  Ruler,
  ShieldCheck,
  ShoppingBag,
  Star,
  X,
} from 'lucide-react';
import {
  PRODUCTS,
  ShoeProduct,
  formatPKR,
  getEffectivePrice,
} from '../lib/products';
import ProductCard from './ProductCard';
import { AnimatedDeliveryIcon, AnimatedWishlistHeart } from './AnimatedIcons';

const Shoe3DCanvas = lazy(() => import('./Shoe3DCanvas'));

interface ProductDetailViewProps {
  productId: string;
  wishlistIds: string[];
  recentIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (
    product: ShoeProduct,
    size: number,
    colorName: string,
    colorHex: string,
    quantity?: number
  ) => void;
  onBuyNow: (
    product: ShoeProduct,
    size: number,
    colorName: string,
    colorHex: string,
    quantity: number
  ) => void;
  onBackToCollections: () => void;
  onViewProduct: (productId: string) => void;
}

export default function ProductDetailView({
  productId,
  wishlistIds,
  recentIds,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onBackToCollections,
  onViewProduct,
}: ProductDetailViewProps) {
  const product = PRODUCTS.find((p) => p.id === productId) ?? PRODUCTS[0];

  const [viewMode, setViewMode] = useState<'gallery' | '3d'>('gallery');
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);

  useEffect(() => {
    setActiveImageIdx(0);
    setSelectedColorIdx(0);
    setSelectedSize(null);
    setQuantity(1);
    setSizeError(false);
    setAddedFeedback(false);
  }, [productId]);

  const activeColor = product.colors[selectedColorIdx] ?? product.colors[0];
  const effectivePrice = getEffectivePrice(product);
  const isWishlisted = wishlistIds.includes(product.id);

  const handleAdd = () => {
    if (selectedSize === null) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    onAddToCart(product, selectedSize, activeColor.name, activeColor.hex, quantity);
    setAddedFeedback(true);
    window.setTimeout(() => setAddedFeedback(false), 1800);
  };

  const handleBuy = () => {
    if (selectedSize === null) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    onBuyNow(product, selectedSize, activeColor.name, activeColor.hex, quantity);
  };

  const recentlyViewedProducts = recentIds
    .filter((id) => id !== product.id)
    .map((id) => PRODUCTS.find((p) => p.id === id))
    .filter((p): p is ShoeProduct => Boolean(p))
    .slice(0, 3);

  return (
    <div className="bg-[#FAF7F2] py-10 text-[#14100D] sm:py-14">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        {/* Back Breadcrumb */}
        <button
          type="button"
          onClick={onBackToCollections}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#6E645A] uppercase transition-colors hover:text-[#14100D]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Collection</span>
        </button>

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Gallery & 360° 3D Viewport */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div className="mb-3 flex items-center justify-between">
              <div className="inline-flex rounded-lg border border-[#E2D8C8] bg-white p-1">
                <button
                  type="button"
                  onClick={() => setViewMode('gallery')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === 'gallery'
                      ? 'bg-[#14100D] text-[#E2C285]'
                      : 'text-[#5E544B] hover:text-[#14100D]'
                  }`}
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Studio Photos</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('3d')}
                  className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    viewMode === '3d'
                      ? 'bg-[#14100D] text-[#E2C285]'
                      : 'text-[#5E544B] hover:text-[#14100D]'
                  }`}
                >
                  <Box className="h-3.5 w-3.5" />
                  <span>360° Interactive 3D</span>
                </button>
              </div>
              <span className="text-xs text-[#6E645A]">
                {viewMode === '3d' ? 'Drag to rotate 360°' : `${activeImageIdx + 1} / ${product.gallery.length}`}
              </span>
            </div>

            {viewMode === 'gallery' ? (
              <div>
                <div className="overflow-hidden rounded-2xl border border-[#E6DED2] bg-white shadow-sm">
                  <img
                    src={product.gallery[activeImageIdx] ?? product.image}
                    alt={`${product.name} studio view ${activeImageIdx + 1}`}
                    referrerPolicy="no-referrer"
                    className="aspect-[4/3] w-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                </div>
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {product.gallery.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => setActiveImageIdx(idx)}
                      className={`overflow-hidden rounded-lg border-2 transition-all ${
                        activeImageIdx === idx
                          ? 'border-[#C9A461] shadow-md'
                          : 'border-transparent opacity-75 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`${product.name} thumbnail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="aspect-[4/3] w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[420px] sm:h-[500px] overflow-hidden rounded-2xl border border-[#C9A461]/30 bg-[#0D0A08]">
                <Suspense
                  fallback={
                    <div className="flex h-full w-full items-center justify-center text-xs tracking-wider text-[#E2C285]">
                      Loading 360° 3D Studio...
                    </div>
                  }
                >
                  <Shoe3DCanvas
                    shapeType={product.shoeShape}
                    upperHex={activeColor.hex}
                    soleHex={activeColor.soleHex}
                    allowExplodeControls={false}
                    initialExploded={false}
                    heightClass="h-full w-full"
                    showParticles={false}
                  />
                </Suspense>
              </div>
            )}
          </div>

          {/* Right Column: Contiguous Purchase Module */}
          <div className="lg:col-span-5 rounded-2xl border border-[#E5DDD0] bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center justify-between text-xs text-[#6E645A]">
              <span className="tracking-widest uppercase font-medium text-[#8C6239]">
                {product.category} · {product.gender}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#14100D] tabular-nums">
                <Star className="h-3.5 w-3.5 fill-[#C9A461] text-[#C9A461]" />
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#14100D] sm:text-4xl">
              {product.name}
            </h1>
            <p className="mt-1 text-sm text-[#6E645A]">{product.subtitle}</p>

            {/* Price & Stock Status */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-[#EFE8DC] py-4">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-bold text-[#14100D] tabular-nums">
                  {formatPKR(effectivePrice)}
                </span>
                {product.discountPrice && (
                  <span className="text-sm text-[#8C8277] line-through tabular-nums">
                    {formatPKR(product.price)}
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-[#1F5E3B]">
                In Stock ({product.stockCount} pairs ready)
              </span>
            </div>

            {/* Description */}
            <p className="mt-5 text-sm leading-relaxed text-[#433A31]">
              {product.description}
            </p>

            {/* Color Selection */}
            <div className="mt-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-[#14100D]">Colorway</span>
                <span className="text-[#6E645A]">{activeColor.name}</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2.5">
                {product.colors.map((c, idx) => (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColorIdx(idx)}
                    aria-label={`Select colorway ${c.name}`}
                    className={`flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-medium transition-all ${
                      selectedColorIdx === idx
                        ? 'border-[#14100D] bg-[#FAF7F2] text-[#14100D] ring-1 ring-[#C9A461]'
                        : 'border-[#E2D8C8] text-[#5E544B] hover:border-[#8C6239]'
                    }`}
                  >
                    <span
                      className="h-3.5 w-3.5 rounded-full border border-black/20"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Required Size Selection */}
            <div className="mt-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#14100D]">
                  Select Size (EU) <span className="text-[#9E2A2B]">*</span>
                </span>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#8C6239] underline underline-offset-2 hover:text-[#14100D]"
                >
                  <Ruler className="h-3.5 w-3.5" />
                  <span>Size Guide</span>
                </button>
              </div>

              <div
                className={`mt-2.5 grid grid-cols-4 gap-2 rounded-xl p-1 sm:grid-cols-7 ${
                  sizeError ? 'ring-2 ring-[#9E2A2B] bg-[#9E2A2B]/5' : ''
                }`}
              >
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setSelectedSize(size);
                      setSizeError(false);
                    }}
                    className={`min-h-[42px] rounded-lg border text-xs font-semibold tabular-nums transition-colors ${
                      selectedSize === size
                        ? 'border-[#14100D] bg-[#14100D] text-[#E2C285]'
                        : 'border-[#E2D8C8] bg-white text-[#2A221B] hover:border-[#C9A461]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {sizeError && (
                <p role="alert" className="mt-2 text-xs font-medium text-[#9E2A2B]">
                  Please select your EU shoe size before adding to bag.
                </p>
              )}
            </div>

            {/* Quantity & Action CTAs */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-lg border border-[#DFD5C5] bg-[#FAF7F2]">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-11 w-10 items-center justify-center text-[#3D342B] hover:text-[#14100D]"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-sm font-semibold tabular-nums">
                  {quantity}
                </span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => setQuantity((q) => Math.min(product.stockCount, q + 1))}
                  className="flex h-11 w-10 items-center justify-center text-[#3D342B] hover:text-[#14100D]"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                className="flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#C9A461] to-[#E2C285] px-5 text-sm font-semibold text-[#0A0807] transition-all hover:opacity-95 whitespace-nowrap"
              >
                {addedFeedback ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Added to Bag</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                aria-label="Toggle wishlist"
                className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors ${
                  isWishlisted
                    ? 'border-[#C9A461] bg-[#14100D] text-[#E2C285]'
                    : 'border-[#DFD5C5] text-[#5E544B] hover:border-[#14100D]'
                }`}
              >
                <AnimatedWishlistHeart active={isWishlisted} className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={handleBuy}
              className="mt-3 flex min-h-[46px] w-full items-center justify-center rounded-lg border border-[#14100D] bg-[#14100D] px-6 text-sm font-semibold text-[#E2C285] transition-colors hover:bg-[#261E18]"
            >
              Buy Now · WhatsApp Checkout
            </button>

            {/* Craftsmanship Details */}
            <dl className="mt-7 space-y-3 border-t border-[#EFE8DC] pt-5 text-xs">
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-[#6E645A]">Occasion</dt>
                <dd className="text-right text-[#14100D]">{product.occasion}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-[#6E645A]">Materials</dt>
                <dd className="text-right text-[#14100D]">{product.materials}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="font-semibold text-[#6E645A]">Construction</dt>
                <dd className="text-right text-[#14100D]">{product.construction}</dd>
              </div>
            </dl>

            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-[#FAF7F2] p-3.5 text-[11px] text-[#4E443B]">
              <div className="flex items-center gap-2">
                <AnimatedDeliveryIcon className="h-4 w-4 text-[#8C6239] shrink-0" />
                <span>Free delivery over Rs. 8,000</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#8C6239] shrink-0" />
                <span>14-day size exchange</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recently Viewed Products */}
        {recentlyViewedProducts.length > 0 && (
          <div className="mt-16 border-t border-[#E5DDD0] pt-12">
            <h2 className="font-serif text-2xl font-semibold text-[#14100D] sm:text-3xl">
              Recently Viewed
            </h2>
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recentlyViewedProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  isWishlisted={wishlistIds.includes(item.id)}
                  onToggleWishlist={onToggleWishlist}
                  onViewDetails={onViewProduct}
                  onAddToCart={(p, sz, col, hex) => onAddToCart(p, sz, col, hex, 1)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Size Guide Modal */}
      {sizeGuideOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Footwear size guide"
        >
          <div className="w-full max-w-lg rounded-2xl border border-[#C9A461]/30 bg-[#14100D] p-6 text-[#F5F0E8] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="font-serif text-2xl font-semibold text-[#E2C285]">
                VELLMONT Size Guide
              </h3>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(false)}
                aria-label="Close size guide"
                className="rounded-full p-1.5 text-[#B8AEA0] hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-3 text-xs text-[#C9BFB2]">
              Measure your foot from heel to longest toe against a wall. If between sizes, select the larger EU size for dress shoes.
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-white/10 text-[#C9A461]">
                    <th className="py-2">EU</th>
                    <th className="py-2">UK</th>
                    <th className="py-2">US Men</th>
                    <th className="py-2">Foot Length</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-[#E8E1D7]">
                  {[
                    ['38', '5', '6', '24.2 cm'],
                    ['39', '6', '7', '24.9 cm'],
                    ['40', '6.5', '7.5', '25.5 cm'],
                    ['41', '7.5', '8.5', '26.2 cm'],
                    ['42', '8', '9', '26.8 cm'],
                    ['43', '9', '10', '27.5 cm'],
                    ['44', '10', '11', '28.2 cm'],
                    ['45', '11', '12', '28.9 cm'],
                  ].map(([eu, uk, us, cm]) => (
                    <tr key={eu}>
                      <td className="py-2 font-semibold">{eu}</td>
                      <td className="py-2">{uk}</td>
                      <td className="py-2">{us}</td>
                      <td className="py-2">{cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

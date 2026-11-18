import { useState, MouseEvent } from 'react';
import { motion } from 'motion/react';
import { Eye, Star } from 'lucide-react';
import { ShoeProduct, formatPKR, getEffectivePrice } from '../lib/products';
import { AnimatedBagIcon, AnimatedWishlistHeart } from './AnimatedIcons';

interface ProductCardProps {
  product: ShoeProduct;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onViewDetails: (productId: string) => void;
  onAddToCart: (product: ShoeProduct, size: number, colorName: string, colorHex: string) => void;
  showBestSellerTag?: boolean;
}

export default function ProductCard({
  product,
  isWishlisted,
  onToggleWishlist,
  onViewDetails,
  onAddToCart,
  showBestSellerTag = false,
}: ProductCardProps) {
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<number>(product.sizes[2] ?? product.sizes[0]);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });
  const [imgError, setImgError] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [addClickCount, setAddClickCount] = useState(0);

  const effectivePrice = getEffectivePrice(product);
  const activeColor = product.colors[selectedColorIdx] ?? product.colors[0];

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rx: Number((-y * 5).toFixed(2)),
      ry: Number((x * 5).toFixed(2)),
    });
  };

  const handleMouseLeave = () => {
    setTilt({ rx: 0, ry: 0 });
  };

  const handleQuickAdd = () => {
    onAddToCart(product, selectedSize, activeColor.name, activeColor.hex);
    setAddClickCount((c) => c + 1);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: `perspective(950px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: 'transform 200ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 250ms ease, border-color 250ms ease',
      }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E6DED2] bg-white text-[#14100D] shadow-[0_6px_24px_rgba(20,16,13,0.05)] hover:border-[#C9A461] hover:shadow-[0_18px_42px_rgba(140,98,57,0.16)]"
    >
      {/* Product Image Stage */}
      <div
        onClick={() => onViewDetails(product.id)}
        className="relative aspect-[4/3] w-full cursor-pointer overflow-hidden bg-[#F7F3EC]"
      >
        {!imgError ? (
          <img
            src={product.image}
            alt={product.name}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#F3ECE1] to-[#E5D7C3] p-6 text-center">
            <span className="font-serif text-lg font-semibold text-[#5C3D24]">{product.name}</span>
            <span className="mt-1 text-xs text-[#8C6239]">{product.category}</span>
          </div>
        )}

        {showBestSellerTag && (
          <motion.span
            animate={{ opacity: [0.9, 1, 0.9] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="absolute top-3 left-3 rounded-md bg-[#14100D]/90 px-2.5 py-1 text-[10px] font-semibold tracking-wider text-[#E2C285] uppercase"
          >
            Best Seller
          </motion.span>
        )}

        {/* Animated Wishlist Action */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleWishlist(product.id);
          }}
          aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
          className={`absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${
            isWishlisted
              ? 'border-[#C9A461] bg-[#14100D] text-[#E2C285]'
              : 'border-[#E6DED2] bg-white/90 text-[#5D534A] hover:border-[#C9A461] hover:text-[#14100D]'
          }`}
        >
          <AnimatedWishlistHeart active={isWishlisted} className="h-4 w-4" />
        </button>

        {/* Quick Inspect Overlay Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(product.id);
          }}
          className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-lg bg-[#14100D]/85 px-3 py-1.5 text-[11px] font-medium text-[#F5F0E8] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <Eye className="h-3.5 w-3.5 text-[#C9A461]" />
          <span>View Details</span>
        </button>
      </div>

      {/* Product Body */}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center justify-between text-xs text-[#6E645A]">
          <span className="tracking-wide uppercase">
            {product.category} <span aria-hidden="true">·</span> {product.gender}
          </span>
          <span className="inline-flex items-center gap-1 font-medium text-[#3B2E22] tabular-nums">
            <Star className="h-3.5 w-3.5 fill-[#C9A461] text-[#C9A461]" />
            {product.rating.toFixed(1)}
          </span>
        </div>

        <h3
          onClick={() => onViewDetails(product.id)}
          className="mt-2 cursor-pointer font-serif text-xl font-semibold leading-snug text-[#14100D] transition-colors group-hover:text-[#8C6239]"
        >
          {product.name}
        </h3>
        <p className="mt-0.5 text-xs text-[#6E645A] line-clamp-1">{product.subtitle}</p>

        {/* Pricing */}
        <div className="mt-3 flex items-baseline gap-2.5">
          <span className="text-base font-bold text-[#14100D] tabular-nums">
            {formatPKR(effectivePrice)}
          </span>
          {product.discountPrice && (
            <span className="text-xs text-[#8C8277] line-through tabular-nums">
              {formatPKR(product.price)}
            </span>
          )}
        </div>

        {/* Color Swatches & Size Quick-Select */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#EFE8DC] pt-3.5">
          <div className="flex items-center gap-1.5" aria-label="Available colors">
            {product.colors.map((c, idx) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                aria-label={`Select color ${c.name}`}
                onClick={() => setSelectedColorIdx(idx)}
                className={`h-4 w-4 rounded-full border transition-transform ${
                  selectedColorIdx === idx
                    ? 'scale-110 border-[#14100D] ring-2 ring-[#C9A461]/50'
                    : 'border-black/20 hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1">
            <label htmlFor={`size-${product.id}`} className="text-[11px] text-[#6E645A]">
              EU
            </label>
            <select
              id={`size-${product.id}`}
              value={selectedSize}
              onChange={(e) => setSelectedSize(Number(e.target.value))}
              className="rounded-md border border-[#DFD5C5] bg-[#FAF7F2] px-1.5 py-1 text-xs font-medium text-[#14100D] tabular-nums focus:border-[#C9A461] focus:outline-none"
            >
              {product.sizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => onViewDetails(product.id)}
            className="min-h-[40px] rounded-lg border border-[#D8CEC0] bg-transparent px-3 py-2 text-xs font-semibold text-[#2A221B] transition-colors hover:border-[#14100D] hover:bg-[#FAF7F2] whitespace-nowrap"
          >
            View Details
          </button>
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
              justAdded
                ? 'bg-[#1F5E3B] text-white'
                : 'bg-gradient-to-r from-[#C9A461] to-[#D9B675] text-[#0A0807] hover:from-[#B58F4B] hover:to-[#C9A461]'
            }`}
          >
            <AnimatedBagIcon bounceKey={addClickCount} className="h-3.5 w-3.5" />
            <span>{justAdded ? 'Added' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </motion.article>
  );
}

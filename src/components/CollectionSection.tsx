import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, SlidersHorizontal } from 'lucide-react';
import { PRODUCTS, SHOE_CATEGORIES, ShoeCategory, ShoeProduct, getEffectivePrice } from '../lib/products';
import ProductCard from './ProductCard';

interface CollectionSectionProps {
  title?: string;
  subtitle?: string;
  initialCategory?: string;
  initialGender?: string;
  initialFilter?: string;
  maxItems?: number;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onViewDetails: (productId: string) => void;
  onAddToCart: (product: ShoeProduct, size: number, colorName: string, colorHex: string) => void;
  onExploreAll?: () => void;
}

export default function CollectionSection({
  title = 'Featured Collection',
  subtitle = 'Sculpted footwear across six ateliers—from bespoke formal brogues to architectural everyday mules.',
  initialCategory = 'All',
  initialGender = 'All',
  initialFilter = '',
  maxItems,
  wishlistIds,
  onToggleWishlist,
  onViewDetails,
  onAddToCart,
  onExploreAll,
}: CollectionSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [activeGender, setActiveGender] = useState<string>(initialGender);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    setActiveGender(initialGender);
  }, [initialGender]);

  const filteredProducts = useMemo(() => {
    let list = [...PRODUCTS];

    if (initialFilter === 'new') {
      list = list.filter((p) => p.isNewArrival);
    } else if (initialFilter === 'bestsellers') {
      list = list.filter((p) => p.isBestSeller);
    }

    if (activeCategory !== 'All') {
      list = list.filter((p) => p.category === (activeCategory as ShoeCategory));
    }

    if (activeGender !== 'All') {
      list = list.filter((p) => p.gender === activeGender || p.gender === 'Unisex');
    }

    if (sortBy === 'price-asc') {
      list.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return maxItems ? list.slice(0, maxItems) : list;
  }, [activeCategory, activeGender, sortBy, initialFilter, maxItems]);

  const categories = ['All', ...SHOE_CATEGORIES];

  return (
    <section className="bg-[#FAF7F2] py-16 text-[#14100D] sm:py-20">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 border-b border-[#E5DDD0] pb-6 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] text-[#8C6239] uppercase">
              Curated Footwear
            </p>
            <h2 className="mt-1 font-serif text-3xl font-semibold tracking-tight text-[#14100D] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5E544B]">{subtitle}</p>
          </div>

          {onExploreAll && (
            <button
              type="button"
              onClick={onExploreAll}
              className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[#8C6239] transition-colors hover:text-[#14100D] md:self-auto whitespace-nowrap"
            >
              <span>View Full Catalog</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`min-h-[36px] rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                  activeCategory === cat
                    ? 'bg-[#14100D] text-[#E2C285]'
                    : 'bg-[#EFE8DC] text-[#4E443B] hover:bg-[#E4DAC9] hover:text-[#14100D]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-lg bg-[#EFE8DC] p-1">
              {['All', 'Men', 'Women'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setActiveGender(g)}
                  className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                    activeGender === g
                      ? 'bg-white text-[#14100D] shadow-sm'
                      : 'text-[#5E544B] hover:text-[#14100D]'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-[#DFD5C5] bg-white px-3 py-1.5">
              <SlidersHorizontal className="h-3.5 w-3.5 text-[#8C6239]" />
              <select
                aria-label="Sort footwear"
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as 'featured' | 'price-asc' | 'price-desc' | 'rating')
                }
                className="bg-transparent text-xs font-medium text-[#14100D] focus:outline-none"
              >
                <option value="featured">Featured Order</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="mt-10 rounded-xl border border-[#E5DDD0] bg-white p-12 text-center">
            <p className="font-serif text-2xl text-[#14100D]">No footwear matches these filters.</p>
            <p className="mt-2 text-sm text-[#5E544B]">
              Reset category or gender filters to explore the complete VELLMONT collection.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveCategory('All');
                setActiveGender('All');
              }}
              className="mt-5 rounded-lg bg-[#14100D] px-5 py-2.5 text-xs font-semibold text-[#E2C285]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isWishlisted={wishlistIds.includes(product.id)}
                onToggleWishlist={onToggleWishlist}
                onViewDetails={onViewDetails}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

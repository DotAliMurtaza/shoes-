import { useEffect, useRef, useState } from 'react';
import { Heart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PRODUCTS, formatPKR, getEffectivePrice } from '../lib/products';
import {
  AnimatedBagIcon,
  AnimatedHomeIcon,
  AnimatedMenuToggle,
  AnimatedSearchIcon,
  AnimatedUserIcon,
} from './AnimatedIcons';

export type NavRoute =
  | { page: 'home' }
  | { page: 'collections'; category?: string; gender?: string; filter?: string }
  | { page: 'product'; productId: string }
  | { page: 'cart' }
  | { page: 'checkout' }
  | { page: 'about' }
  | { page: 'contact' }
  | { page: 'account' };

interface NavbarProps {
  currentRoute: NavRoute;
  onNavigate: (route: NavRoute) => void;
  cartCount: number;
  cartBounceKey: number;
  wishlistCount: number;
  onOpenCart: () => void;
}

export default function Navbar({
  currentRoute,
  onNavigate,
  cartCount,
  cartBounceKey,
  wishlistCount,
  onOpenCart,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchWrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchWrapperRef.current &&
        !searchWrapperRef.current.contains(e.target as Node)
      ) {
        setSearchExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navItems: Array<{ label: string; route: NavRoute; isActive: boolean }> = [
    {
      label: 'Home',
      route: { page: 'home' },
      isActive: currentRoute.page === 'home',
    },
    {
      label: 'Collections',
      route: { page: 'collections' },
      isActive:
        currentRoute.page === 'collections' &&
        !currentRoute.gender &&
        !currentRoute.filter,
    },
    {
      label: 'Men',
      route: { page: 'collections', gender: 'Men' },
      isActive: currentRoute.page === 'collections' && currentRoute.gender === 'Men',
    },
    {
      label: 'Women',
      route: { page: 'collections', gender: 'Women' },
      isActive: currentRoute.page === 'collections' && currentRoute.gender === 'Women',
    },
    {
      label: 'New Arrivals',
      route: { page: 'collections', filter: 'new' },
      isActive: currentRoute.page === 'collections' && currentRoute.filter === 'new',
    },
    {
      label: 'About Us',
      route: { page: 'about' },
      isActive: currentRoute.page === 'about',
    },
    {
      label: 'Contact',
      route: { page: 'contact' },
      isActive: currentRoute.page === 'contact',
    },
  ];

  const handleLinkClick = (route: NavRoute) => {
    setMobileOpen(false);
    setSearchExpanded(false);
    onNavigate(route);
  };

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchMatches = trimmedQuery
    ? PRODUCTS.filter(
        (p) =>
          p.name.toLowerCase().includes(trimmedQuery) ||
          p.category.toLowerCase().includes(trimmedQuery) ||
          p.subtitle.toLowerCase().includes(trimmedQuery) ||
          p.occasion.toLowerCase().includes(trimmedQuery)
      ).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-50 border-b border-[#C9A461]/20 bg-[#0B0908]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-[1380px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          type="button"
          onClick={() => handleLinkClick({ page: 'home' })}
          className="group flex items-center gap-2.5 whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-[#C9A461]"
        >
          <svg
            viewBox="0 0 28 24"
            className="h-5 w-6 text-[#C9A461] transition-transform duration-300 group-hover:scale-105"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 4L14 20L25 4M8.5 4L14 12L19.5 4"
              stroke="currentColor"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="font-serif text-xl font-semibold tracking-[0.22em] text-[#F5F0E8] sm:text-2xl">
            VELLMONT
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Main navigation"
          className="hidden lg:flex items-center gap-6 text-[13px] font-medium tracking-wide text-[#D8CFC3]"
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => handleLinkClick(item.route)}
              className={`group relative py-1.5 transition-colors whitespace-nowrap shrink-0 ${
                item.isActive ? 'text-[#E2C285]' : 'hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`absolute inset-x-0 bottom-0 h-[1.5px] origin-left bg-gradient-to-r from-[#C9A461] to-[#E2C285] transition-transform duration-300 ${
                  item.isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Zone 3: Animated Search Bar Transition, Account, Cart Bag & Mobile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Smooth Icon-to-Search-Bar Transition */}
          <div ref={searchWrapperRef} className="relative flex items-center">
            <AnimatePresence mode="wait">
              {searchExpanded ? (
                <motion.div
                  key="search-input"
                  initial={{ width: 40, opacity: 0.4 }}
                  animate={{ width: 220, opacity: 1 }}
                  exit={{ width: 40, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="flex h-10 items-center gap-2 rounded-full border border-[#C9A461]/50 bg-[#17120E] px-3"
                >
                  <AnimatedSearchIcon className="h-4 w-4 text-[#C9A461] shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shoes..."
                    aria-label="Search footwear"
                    className="w-full bg-transparent text-xs text-white placeholder-[#8C8277] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchExpanded(false);
                      setSearchQuery('');
                    }}
                    aria-label="Close search"
                    className="text-[#9C9286] hover:text-white"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="search-trigger"
                  type="button"
                  onClick={() => setSearchExpanded(true)}
                  aria-label="Search shoes"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#D8CFC3] transition-colors hover:bg-white/10 hover:text-[#E2C285]"
                >
                  <AnimatedSearchIcon className="h-[18px] w-[18px]" />
                </motion.button>
              )}
            </AnimatePresence>

            {/* Instant Dropdown Search Results */}
            <AnimatePresence>
              {searchExpanded && trimmedQuery.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="absolute top-12 right-0 z-50 w-72 sm:w-80 overflow-hidden rounded-xl border border-[#C9A461]/30 bg-[#14100D] shadow-2xl"
                >
                  {searchMatches.length === 0 ? (
                    <p className="p-4 text-xs text-[#9C9286]">
                      No shoes matched “{searchQuery}”.
                    </p>
                  ) : (
                    <div className="divide-y divide-white/10">
                      {searchMatches.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => {
                            setSearchExpanded(false);
                            setSearchQuery('');
                            onNavigate({ page: 'product', productId: p.id });
                          }}
                          className="flex w-full items-center gap-3 p-2.5 text-left hover:bg-white/5"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="h-10 w-14 rounded object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-serif text-sm font-semibold text-white">
                              {p.name}
                            </p>
                            <p className="text-[11px] text-[#E2C285] tabular-nums">
                              {formatPKR(getEffectivePrice(p))}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Account / Wishlist Button with hover rotation */}
          <button
            type="button"
            onClick={() => handleLinkClick({ page: 'account' })}
            aria-label="Wishlist and account"
            className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#D8CFC3] transition-colors hover:bg-white/10 hover:text-[#E2C285]"
          >
            <AnimatedUserIcon className="h-[18px] w-[18px]" />
            {wishlistCount > 0 && (
              <motion.span
                key={wishlistCount}
                initial={{ scale: 0.6 }}
                animate={{ scale: 1 }}
                className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#C9A461] text-[9px] font-bold text-[#0A0807]"
              >
                {wishlistCount}
              </motion.span>
            )}
          </button>

          {/* Animated Shopping Bag Button */}
          <button
            type="button"
            onClick={onOpenCart}
            aria-label="Open shopping bag"
            className="relative flex h-10 items-center gap-2 rounded-full border border-[#C9A461]/40 bg-[#C9A461]/10 px-3.5 text-xs font-semibold text-[#E2C285] transition-colors hover:border-[#C9A461] hover:bg-[#C9A461] hover:text-[#0A0807] whitespace-nowrap"
          >
            <AnimatedBagIcon bounceKey={cartBounceKey} className="h-4 w-4" />
            <span className="hidden sm:inline">Bag</span>
            <motion.span
              key={cartCount}
              initial={{ scale: 1.35 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 450, damping: 16 }}
              className="tabular-nums font-bold"
            >
              {cartCount}
            </motion.span>
          </button>

          {/* Animated Hamburger-to-Close Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="flex h-10 w-10 items-center justify-center rounded-full text-[#D8CFC3] hover:bg-white/10 lg:hidden"
          >
            <AnimatedMenuToggle isOpen={mobileOpen} />
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden border-t border-[#C9A461]/15 bg-[#0E0B09] lg:hidden"
          >
            <div className="flex flex-col space-y-1 px-4 py-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleLinkClick(item.route)}
                  className={`flex min-h-[44px] items-center justify-between rounded-lg px-3 text-left text-sm font-medium transition-colors ${
                    item.isActive
                      ? 'bg-[#C9A461]/15 text-[#E2C285]'
                      : 'text-[#DFD8CE] hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    {item.label === 'Home' && <AnimatedHomeIcon className="h-4 w-4 text-[#C9A461]" />}
                    <span>{item.label}</span>
                  </span>
                  <span className="text-xs text-[#C9A461]">→</span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleLinkClick({ page: 'account' })}
                className="flex min-h-[44px] items-center gap-2 rounded-lg px-3 text-sm font-medium text-[#DFD8CE] hover:bg-white/5"
              >
                <Heart className="h-4 w-4 text-[#C9A461]" />
                <span>Saved Wishlist ({wishlistCount})</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

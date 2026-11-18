import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'motion/react';
import { ShoeProduct, getEffectivePrice } from './lib/products';
import {
  CartItem,
  CustomerPreferences,
  loadCart,
  loadPreferences,
  loadRecentViewed,
  loadWishlist,
  recordRecentViewed,
  saveCart,
  savePreferences,
  saveWishlist,
} from './lib/storage';
import IntroAnimation from './components/IntroAnimation';
import Navbar, { NavRoute } from './components/Navbar';
import HeroSection from './components/HeroSection';
import CollectionSection from './components/CollectionSection';
import HomeSections, { Footer } from './components/HomeSections';
import ProductDetailView from './components/ProductDetailView';
import CartDrawer from './components/CartDrawer';
import CheckoutView from './components/CheckoutView';
import AIAssistant from './components/AIAssistant';
import {
  AboutView,
  AccountWishlistView,
  CartView,
  ContactView,
} from './components/SecondaryViews';

function parseRouteFromPath(pathname: string): NavRoute {
  if (pathname.startsWith('/product/')) {
    const id = pathname.replace('/product/', '').trim();
    if (id) return { page: 'product', productId: id };
  }
  if (pathname === '/collections') return { page: 'collections' };
  if (pathname === '/cart') return { page: 'cart' };
  if (pathname === '/checkout') return { page: 'checkout' };
  if (pathname === '/about') return { page: 'about' };
  if (pathname === '/contact') return { page: 'contact' };
  if (pathname === '/account') return { page: 'account' };
  return { page: 'home' };
}

function pathForRoute(route: NavRoute): string {
  switch (route.page) {
    case 'product':
      return `/product/${route.productId}`;
    case 'collections':
      return '/collections';
    case 'cart':
      return '/cart';
    case 'checkout':
      return '/checkout';
    case 'about':
      return '/about';
    case 'contact':
      return '/contact';
    case 'account':
      return '/account';
    default:
      return '/';
  }
}

export default function App() {
  const [introDone, setIntroDone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.sessionStorage.getItem('vellmont_intro_seen') === '1';
  });

  const [route, setRoute] = useState<NavRoute>(() => {
    if (typeof window === 'undefined') return { page: 'home' };
    return parseRouteFromPath(window.location.pathname);
  });

  const [cart, setCart] = useState<CartItem[]>(() => loadCart());
  const [cartBounceKey, setCartBounceKey] = useState(0);
  const [wishlist, setWishlist] = useState<string[]>(() => loadWishlist());
  const [recentIds, setRecentIds] = useState<string[]>(() => loadRecentViewed());
  const [prefs, setPrefs] = useState<CustomerPreferences>(() => loadPreferences());

  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const collectionRef = useRef<HTMLDivElement | null>(null);
  const cursorGlowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    saveCart(cart);
  }, [cart]);

  useEffect(() => {
    saveWishlist(wishlist);
  }, [wishlist]);

  useEffect(() => {
    savePreferences(prefs);
  }, [prefs]);

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    const glow = cursorGlowRef.current;
    if (!glow) return;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReducedMotion) return;

    const handleMove = (e: PointerEvent) => {
      glow.style.transform = `translate3d(${e.clientX - 220}px, ${e.clientY - 220}px, 0)`;
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  const handleIntroComplete = useCallback(() => {
    try {
      window.sessionStorage.setItem('vellmont_intro_seen', '1');
    } catch {
      // Ignore storage error
    }
    setIntroDone(true);
  }, []);

  const navigate = useCallback((nextRoute: NavRoute) => {
    setRoute(nextRoute);
    const targetPath = pathForRoute(nextRoute);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath);
    }
    if (nextRoute.page === 'product') {
      setRecentIds(recordRecentViewed(nextRoute.productId));
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleViewProduct = useCallback(
    (productId: string) => {
      navigate({ page: 'product', productId });
    },
    [navigate]
  );

  const handleToggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [productId, ...prev]
    );
  }, []);

  const handleAddToCart = useCallback(
    (
      product: ShoeProduct,
      size: number,
      colorName: string,
      colorHex: string,
      quantity = 1,
      openDrawer = true
    ) => {
      const price = getEffectivePrice(product);
      setCart((prev) => {
        const idx = prev.findIndex(
          (i) =>
            i.productId === product.id &&
            i.size === size &&
            i.colorName === colorName
        );
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = {
            ...updated[idx],
            quantity: updated[idx].quantity + quantity,
          };
          return updated;
        }
        return [
          ...prev,
          {
            productId: product.id,
            name: product.name,
            image: product.image,
            category: product.category,
            price,
            size,
            colorName,
            colorHex,
            quantity,
          },
        ];
      });
      setCartBounceKey((k) => k + 1);
      if (openDrawer) {
        setCartDrawerOpen(true);
      }
    },
    []
  );

  const handleBuyNow = useCallback(
    (
      product: ShoeProduct,
      size: number,
      colorName: string,
      colorHex: string,
      quantity: number
    ) => {
      handleAddToCart(product, size, colorName, colorHex, quantity, false);
      navigate({ page: 'checkout' });
    },
    [handleAddToCart, navigate]
  );

  const handleUpdateQty = useCallback((index: number, delta: number) => {
    setCart((prev) => {
      const item = prev[index];
      if (!item) return prev;
      const nextQty = item.quantity + delta;
      if (nextQty <= 0) {
        return prev.filter((_, i) => i !== index);
      }
      const updated = [...prev];
      updated[index] = { ...item, quantity: nextQty };
      return updated;
    });
  }, []);

  const handleRemoveCartItem = useCallback((index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const totalCartCount = cart.reduce((sum, i) => sum + i.quantity, 0);
  const routeKey = `${route.page}-${route.page === 'product' ? route.productId : route.page === 'collections' ? `${route.category || ''}-${route.gender || ''}-${route.filter || ''}` : ''}`;

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative min-h-screen flex flex-col bg-[#0A0807] text-[#F5F0E8]">
        {/* Mouse-following ambient golden glow */}
        <div
          ref={cursorGlowRef}
          aria-hidden="true"
          className="pointer-events-none fixed top-0 left-0 z-30 hidden h-[440px] w-[440px] rounded-full opacity-25 lg:block"
          style={{
            background:
              'radial-gradient(circle, rgba(201,164,97,0.16) 0%, rgba(201,164,97,0) 70%)',
            transform: 'translate3d(-999px, -999px, 0)',
          }}
        />

        {/* Cinematic Intro (once per session) */}
        <AnimatePresence>
          {!introDone && <IntroAnimation onComplete={handleIntroComplete} />}
        </AnimatePresence>

        {/* Sticky Floating Luxury Navigation */}
        <Navbar
          currentRoute={route}
          onNavigate={navigate}
          cartCount={totalCartCount}
          cartBounceKey={cartBounceKey}
          wishlistCount={wishlist.length}
          onOpenCart={() => setCartDrawerOpen(true)}
        />

        {/* Main Content Switcher with Smooth Page Transitions */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={routeKey}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              {route.page === 'home' && (
                <>
                  <HeroSection
                    onNavigate={navigate}
                    introDone={introDone}
                    onScrollToCollection={() =>
                      collectionRef.current?.scrollIntoView({ behavior: 'smooth' })
                    }
                  />

                  <div ref={collectionRef}>
                    <CollectionSection
                      title="Featured Collection"
                      subtitle="Explore six curated footwear categories—from Goodyear-welted formal Oxfords to sculpted leather sneakers and everyday suede slippers."
                      maxItems={6}
                      wishlistIds={wishlist}
                      onToggleWishlist={handleToggleWishlist}
                      onViewDetails={handleViewProduct}
                      onAddToCart={(p, sz, col, hex) =>
                        handleAddToCart(p, sz, col, hex, 1, true)
                      }
                      onExploreAll={() => navigate({ page: 'collections' })}
                    />
                  </div>

                  <HomeSections
                    wishlistIds={wishlist}
                    onToggleWishlist={handleToggleWishlist}
                    onViewDetails={handleViewProduct}
                    onAddToCart={(p, sz, col, hex) =>
                      handleAddToCart(p, sz, col, hex, 1, true)
                    }
                    onNavigate={navigate}
                    savedEmail={prefs.newsletterEmail}
                    onSubscribeNewsletter={(email) =>
                      setPrefs((prev) => ({ ...prev, newsletterEmail: email }))
                    }
                  />
                </>
              )}

              {route.page === 'collections' && (
                <CollectionSection
                  title={
                    route.filter === 'new'
                      ? 'New Arrivals'
                      : route.filter === 'bestsellers'
                        ? 'Atelier Best Sellers'
                        : route.gender
                          ? `${route.gender}’s Footwear Collection`
                          : route.category
                            ? route.category
                            : 'Complete Footwear Collection'
                  }
                  subtitle="Handcrafted Italian-grade leather dress shoes, minimalist sneakers, athletic runners, and everyday suede mules."
                  initialCategory={route.category || 'All'}
                  initialGender={route.gender || 'All'}
                  initialFilter={route.filter || ''}
                  wishlistIds={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onViewDetails={handleViewProduct}
                  onAddToCart={(p, sz, col, hex) =>
                    handleAddToCart(p, sz, col, hex, 1, true)
                  }
                />
              )}

              {route.page === 'product' && (
                <ProductDetailView
                  productId={route.productId}
                  wishlistIds={wishlist}
                  recentIds={recentIds}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={(p, sz, col, hex, qty) =>
                    handleAddToCart(p, sz, col, hex, qty ?? 1, true)
                  }
                  onBuyNow={handleBuyNow}
                  onBackToCollections={() => navigate({ page: 'collections' })}
                  onViewProduct={handleViewProduct}
                />
              )}

              {route.page === 'cart' && (
                <CartView
                  items={cart}
                  onUpdateQty={handleUpdateQty}
                  onRemoveItem={handleRemoveCartItem}
                  onCheckout={() => navigate({ page: 'checkout' })}
                  onContinueShopping={() => navigate({ page: 'collections' })}
                />
              )}

              {route.page === 'checkout' && (
                <div className="pb-20 sm:pb-0">
                  <CheckoutView
                    items={cart}
                    savedPrefs={prefs}
                    onSavePrefs={setPrefs}
                    onBackToCart={() => navigate({ page: 'cart' })}
                    onContinueShopping={() => navigate({ page: 'collections' })}
                  />
                </div>
              )}

              {route.page === 'about' && (
                <AboutView onShopNow={() => navigate({ page: 'collections' })} />
              )}

              {route.page === 'contact' && <ContactView />}

              {route.page === 'account' && (
                <AccountWishlistView
                  wishlistIds={wishlist}
                  recentIds={recentIds}
                  onToggleWishlist={handleToggleWishlist}
                  onViewDetails={handleViewProduct}
                  onAddToCart={(p, sz, col, hex) =>
                    handleAddToCart(p, sz, col, hex, 1, true)
                  }
                  onBackHome={() => navigate({ page: 'home' })}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <Footer onNavigate={navigate} />

        {/* Slide-Over Cart Drawer */}
        <CartDrawer
          isOpen={cartDrawerOpen}
          onClose={() => setCartDrawerOpen(false)}
          items={cart}
          onUpdateQty={handleUpdateQty}
          onRemoveItem={handleRemoveCartItem}
          onProceedToCheckout={() => navigate({ page: 'checkout' })}
          onViewFullCart={() => navigate({ page: 'cart' })}
        />

        {/* Floating Circular AI Shoe Assistant (hidden when CartDrawer covers bottom-right) */}
        <AIAssistant
          onViewProduct={handleViewProduct}
          onAddToCart={(p, sz, col, hex) =>
            handleAddToCart(p, sz, col, hex, 1, true)
          }
          hideLauncher={cartDrawerOpen}
        />
      </div>
    </MotionConfig>
  );
}

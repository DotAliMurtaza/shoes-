import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../lib/storage';
import { formatPKR } from '../lib/products';
import { calculateShipping } from '../lib/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (index: number, delta: number) => void;
  onRemoveItem: (index: number) => void;
  onProceedToCheckout: () => void;
  onViewFullCart: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
  onViewFullCart,
}: CartDrawerProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;
  const remainingForFree = Math.max(0, 8000 - subtotal);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end" role="dialog" aria-modal="true" aria-label="Shopping bag">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-[#C9A461]/25 bg-[#0F0C09] text-[#F5F0E8] shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-5 w-5 text-[#C9A461]" />
                <h2 className="font-serif text-2xl font-semibold text-white">
                  Your Shopping Bag
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close shopping bag"
                className="rounded-full p-1.5 text-[#B8AEA0] hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Free Delivery Progress */}
            {items.length > 0 && (
              <div className="border-b border-white/10 bg-[#17120E] px-6 py-3 text-xs">
                {remainingForFree === 0 ? (
                  <p className="font-medium text-[#E2C285]">
                    Complimentary express nationwide delivery unlocked.
                  </p>
                ) : (
                  <p className="text-[#C9BFB2]">
                    Add <span className="font-semibold text-[#E2C285] tabular-nums">{formatPKR(remainingForFree)}</span> more for complimentary delivery.
                  </p>
                )}
              </div>
            )}

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-12">
                  <ShoppingBag className="h-12 w-12 text-[#C9A461]/40" />
                  <p className="mt-4 font-serif text-2xl text-white">Your bag is empty</p>
                  <p className="mt-2 max-w-xs text-xs text-[#9C9286]">
                    Explore our handcrafted Oxford brogues, court sneakers, and suede mules to begin your order.
                  </p>
                </div>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={`${item.productId}-${item.size}-${item.colorName}`}
                    className="flex gap-4 rounded-xl border border-white/10 bg-[#17120E] p-3.5"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="h-20 w-24 rounded-lg object-cover bg-[#241C16] shrink-0"
                    />
                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-serif text-base font-semibold text-white">
                            {item.name}
                          </h3>
                          <p className="text-[11px] text-[#B8AEA0]">
                            EU {item.size} · {item.colorName}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemoveItem(idx)}
                          aria-label={`Remove ${item.name}`}
                          className="text-[#8C8277] transition-colors hover:text-[#E57373]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center rounded-md border border-white/15 bg-[#0D0A08]">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() => onUpdateQty(idx, -1)}
                            className="flex h-7 w-7 items-center justify-center text-[#C9BFB2] hover:text-white"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-semibold tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() => onUpdateQty(idx, 1)}
                            className="flex h-7 w-7 items-center justify-center text-[#C9BFB2] hover:text-white"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <span className="text-sm font-semibold text-[#E2C285] tabular-nums">
                          {formatPKR(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Totals & Checkout */}
            {items.length > 0 && (
              <div className="border-t border-white/10 bg-[#14100D] px-6 py-5">
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#B8AEA0]">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{formatPKR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#B8AEA0]">
                    <span>Delivery</span>
                    <span className="tabular-nums">
                      {shipping === 0 ? 'Complimentary' : formatPKR(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-white/10 pt-2.5 text-base font-semibold text-white">
                    <span>Total</span>
                    <span className="text-[#E2C285] tabular-nums">{formatPKR(total)}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onProceedToCheckout();
                    }}
                    className="min-h-[46px] w-full rounded-lg bg-gradient-to-r from-[#C9A461] to-[#E2C285] text-sm font-semibold text-[#0A0807] transition-opacity hover:opacity-95"
                  >
                    Proceed to WhatsApp Checkout
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewFullCart();
                    }}
                    className="min-h-[40px] w-full rounded-lg border border-white/15 text-xs font-medium text-[#D8CFC3] hover:border-[#C9A461] hover:text-white"
                  >
                    View Full Shopping Bag
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

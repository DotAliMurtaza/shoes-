import { useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  MessageCircle,
  ShieldAlert,
} from 'lucide-react';
import { CartItem, CustomerPreferences } from '../lib/storage';
import { formatPKR } from '../lib/products';
import {
  WHATSAPP_NUMBER_DISPLAY,
  buildWhatsAppOrderMessage,
  buildWhatsAppOrderUrl,
  calculateShipping,
} from '../lib/whatsapp';

interface CheckoutViewProps {
  items: CartItem[];
  savedPrefs: CustomerPreferences;
  onSavePrefs: (prefs: CustomerPreferences) => void;
  onBackToCart: () => void;
  onContinueShopping: () => void;
}

export default function CheckoutView({
  items,
  savedPrefs,
  onSavePrefs,
  onBackToCart,
  onContinueShopping,
}: CheckoutViewProps) {
  const [fullName, setFullName] = useState(savedPrefs.lastName || '');
  const [phone, setPhone] = useState(savedPrefs.lastPhone || '');
  const [address, setAddress] = useState(savedPrefs.lastAddress || '');
  const [city, setCity] = useState(savedPrefs.lastCity || '');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');
  const [preparedUrl, setPreparedUrl] = useState<string | null>(null);
  const [preparedMessage, setPreparedMessage] = useState<string>('');
  const [copied, setCopied] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + shipping;

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setFormError('Please enter your full name, phone number, and complete delivery address.');
      return;
    }
    if (items.length === 0) {
      setFormError('Your shopping bag is empty.');
      return;
    }

    setFormError('');
    onSavePrefs({
      ...savedPrefs,
      lastName: fullName.trim(),
      lastPhone: phone.trim(),
      lastAddress: address.trim(),
      lastCity: city.trim(),
    });

    const msg = buildWhatsAppOrderMessage(
      { fullName, phone, address, city, notes },
      items,
      subtotal,
      shipping,
      total
    );
    const url = buildWhatsAppOrderUrl(msg);
    setPreparedMessage(msg);
    setPreparedUrl(url);

    // Launch WhatsApp via programmatic anchor click (avoids window.open)
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(preparedMessage);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Ignore clipboard failure
    }
  };

  if (items.length === 0) {
    return (
      <section className="min-h-[70vh] bg-[#FAF7F2] py-16 text-[#14100D]">
        <div className="mx-auto max-w-xl px-4 text-center">
          <h1 className="font-serif text-4xl font-semibold">Checkout</h1>
          <p className="mt-3 text-sm text-[#5E544B]">
            Your shopping bag is currently empty. Select a pair from our collection before checking out.
          </p>
          <button
            type="button"
            onClick={onContinueShopping}
            className="mt-6 rounded-lg bg-[#14100D] px-6 py-3 text-sm font-semibold text-[#E2C285]"
          >
            Browse Footwear Collection
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-[80vh] bg-[#FAF7F2] py-12 text-[#14100D] sm:py-16">
      <div className="mx-auto max-w-[1220px] px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onBackToCart}
          className="mb-6 inline-flex items-center gap-2 text-xs font-semibold tracking-wider text-[#6E645A] uppercase hover:text-[#14100D]"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Bag</span>
        </button>

        <h1 className="font-serif text-3xl font-semibold text-[#14100D] sm:text-4xl">
          Direct WhatsApp Order Checkout
        </h1>
        <p className="mt-2 text-sm text-[#5E544B]">
          Complete your delivery details below. Your itemized order will open directly in WhatsApp ({WHATSAPP_NUMBER_DISPLAY}) for you to send and confirm.
        </p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
          {/* Customer Information Form */}
          <div className="lg:col-span-7 rounded-2xl border border-[#E5DDD0] bg-white p-6 shadow-sm sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-[#14100D]">
              Customer Information
            </h2>

            <form onSubmit={handleConfirmOrder} className="mt-6 space-y-5">
              <div>
                <label htmlFor="checkout-name" className="block text-xs font-semibold text-[#3D342B]">
                  Full Name <span className="text-[#9E2A2B]">*</span>
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Usman Ahmed"
                  className="mt-1.5 min-h-[46px] w-full rounded-lg border border-[#DCD2C2] bg-[#FAF7F2] px-4 text-sm text-[#14100D] focus:border-[#C9A461] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="checkout-phone" className="block text-xs font-semibold text-[#3D342B]">
                    Phone / WhatsApp Number <span className="text-[#9E2A2B]">*</span>
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="03XX-XXXXXXX"
                    className="mt-1.5 min-h-[46px] w-full rounded-lg border border-[#DCD2C2] bg-[#FAF7F2] px-4 text-sm text-[#14100D] focus:border-[#C9A461] focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="checkout-city" className="block text-xs font-semibold text-[#3D342B]">
                    City
                  </label>
                  <input
                    id="checkout-city"
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    className="mt-1.5 min-h-[46px] w-full rounded-lg border border-[#DCD2C2] bg-[#FAF7F2] px-4 text-sm text-[#14100D] focus:border-[#C9A461] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="checkout-address" className="block text-xs font-semibold text-[#3D342B]">
                  Complete Delivery Address <span className="text-[#9E2A2B]">*</span>
                </label>
                <textarea
                  id="checkout-address"
                  rows={3}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="House / Street / Sector / Landmark"
                  className="mt-1.5 w-full rounded-lg border border-[#DCD2C2] bg-[#FAF7F2] p-3.5 text-sm text-[#14100D] focus:border-[#C9A461] focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="checkout-notes" className="block text-xs font-semibold text-[#3D342B]">
                  Delivery Notes (Optional)
                </label>
                <input
                  id="checkout-notes"
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Preferred delivery window or gift wrapping request"
                  className="mt-1.5 min-h-[46px] w-full rounded-lg border border-[#DCD2C2] bg-[#FAF7F2] px-4 text-sm text-[#14100D] focus:border-[#C9A461] focus:outline-none"
                />
              </div>

              {formError && (
                <p role="alert" className="text-xs font-medium text-[#9E2A2B]">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="flex min-h-[50px] w-full items-center justify-center gap-2.5 rounded-lg bg-[#1C6B43] px-6 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[#155534]"
              >
                <MessageCircle className="h-5 w-5" />
                <span>Confirm Order & Open WhatsApp</span>
              </button>
            </form>

            {/* Honest Pending WhatsApp Confirmation Notice */}
            {preparedUrl && (
              <div className="mt-6 rounded-xl border border-[#C9A461] bg-[#FAF4E8] p-5">
                <div className="flex items-start gap-3">
                  <ShieldAlert className="h-5 w-5 text-[#8C6239] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-serif text-xl font-semibold text-[#14100D]">
                      Action Required: Send Your Message in WhatsApp
                    </h3>
                    <p className="mt-1 text-xs leading-relaxed text-[#4E443B]">
                      Your order is <strong>not confirmed yet</strong> until you tap <strong>Send</strong> inside WhatsApp. If WhatsApp did not open automatically, click the button below or copy your formatted order summary.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a
                        href={preparedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[42px] items-center gap-2 rounded-lg bg-[#1C6B43] px-5 text-xs font-semibold text-white hover:bg-[#155534]"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span>Open WhatsApp ({WHATSAPP_NUMBER_DISPLAY})</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyMessage}
                        className="inline-flex min-h-[42px] items-center gap-2 rounded-lg border border-[#C9A461] bg-white px-4 text-xs font-semibold text-[#14100D] hover:bg-[#FAF7F2]"
                      >
                        {copied ? <Check className="h-4 w-4 text-[#1C6B43]" /> : <Copy className="h-4 w-4" />}
                        <span>{copied ? 'Copied Order Text' : 'Copy Order Message'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <aside className="lg:col-span-5 rounded-2xl border border-[#E5DDD0] bg-[#14100D] p-6 text-[#F5F0E8] shadow-sm sm:p-8">
            <h2 className="font-serif text-2xl font-semibold text-white">
              Order Summary
            </h2>

            <div className="mt-5 divide-y divide-white/10">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.colorName}`}
                  className="flex items-center gap-3.5 py-3.5"
                >
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="h-14 w-16 rounded-lg object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-serif text-base font-semibold text-white">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-[#B8AEA0]">
                      Size EU {item.size} · {item.colorName} · Qty {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[#E2C285] tabular-nums">
                    {formatPKR(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-2.5 border-t border-white/15 pt-5 text-sm">
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
                <span>Total Amount</span>
                <span className="text-[#E2C285] tabular-nums">{formatPKR(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

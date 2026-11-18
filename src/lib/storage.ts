export interface CartItem {
  productId: string;
  name: string;
  image: string;
  category: string;
  price: number;
  size: number;
  colorName: string;
  colorHex: string;
  quantity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  recommendedIds?: string[];
  isError?: boolean;
  retryText?: string;
}

export interface CustomerPreferences {
  lastName?: string;
  lastPhone?: string;
  lastAddress?: string;
  lastCity?: string;
  preferredSize?: number;
  newsletterEmail?: string;
}

const KEYS = {
  CART: 'vellmont_cart_v1',
  WISHLIST: 'vellmont_wishlist_v1',
  RECENT: 'vellmont_recent_v1',
  CHAT: 'vellmont_ai_chat_v1',
  PREFS: 'vellmont_prefs_v1',
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function safeRead<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota issues safely
  }
}

export function loadCart(): CartItem[] {
  return safeRead<CartItem[]>(KEYS.CART, []);
}

export function saveCart(items: CartItem[]): void {
  safeWrite(KEYS.CART, items);
}

export function loadWishlist(): string[] {
  return safeRead<string[]>(KEYS.WISHLIST, []);
}

export function saveWishlist(ids: string[]): void {
  safeWrite(KEYS.WISHLIST, ids);
}

export function loadRecentViewed(): string[] {
  return safeRead<string[]>(KEYS.RECENT, []);
}

export function recordRecentViewed(productId: string): string[] {
  const existing = loadRecentViewed().filter((id) => id !== productId);
  const updated = [productId, ...existing].slice(0, 6);
  safeWrite(KEYS.RECENT, updated);
  return updated;
}

export function loadChatHistory(): ChatMessage[] {
  return safeRead<ChatMessage[]>(KEYS.CHAT, []);
}

export function saveChatHistory(messages: ChatMessage[]): void {
  safeWrite(KEYS.CHAT, messages.slice(-40));
}

export function loadPreferences(): CustomerPreferences {
  return safeRead<CustomerPreferences>(KEYS.PREFS, {});
}

export function savePreferences(prefs: CustomerPreferences): void {
  safeWrite(KEYS.PREFS, prefs);
}

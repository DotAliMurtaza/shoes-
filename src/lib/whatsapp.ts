import { CartItem } from './storage';
import { formatPKR } from './products';

export const WHATSAPP_NUMBER_INTL = '923282305470';
export const WHATSAPP_NUMBER_DISPLAY = '0328-2305470';

export interface OrderCustomerDetails {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  notes?: string;
}

export function calculateShipping(subtotal: number): number {
  if (subtotal <= 0) return 0;
  return subtotal >= 8000 ? 0 : 350;
}

export function buildWhatsAppOrderMessage(
  customer: OrderCustomerDetails,
  items: CartItem[],
  subtotal: number,
  shipping: number,
  total: number
): string {
  const lines: string[] = [
    '*NEW LUXURY ORDER — VELLMONT ATELIER*',
    '----------------------------------',
    `*Customer Name:* ${customer.fullName.trim()}`,
    `*Phone Number:* ${customer.phone.trim()}`,
    `*Delivery Address:* ${customer.address.trim()}${customer.city ? `, ${customer.city.trim()}` : ''}`,
  ];

  if (customer.notes?.trim()) {
    lines.push(`*Order Notes:* ${customer.notes.trim()}`);
  }

  lines.push('', '*ORDERED FOOTWEAR:*');

  items.forEach((item, index) => {
    const lineTotal = item.price * item.quantity;
    lines.push(
      `${index + 1}. *${item.name}*`,
      `   - Size: EU ${item.size} | Color: ${item.colorName}`,
      `   - Qty: ${item.quantity} × ${formatPKR(item.price)} = ${formatPKR(lineTotal)}`
    );
  });

  lines.push(
    '',
    '----------------------------------',
    `Subtotal: ${formatPKR(subtotal)}`,
    `Shipping: ${shipping === 0 ? 'Complimentary' : formatPKR(shipping)}`,
    `*TOTAL ORDER AMOUNT:* ${formatPKR(total)}`,
    '----------------------------------',
    'Please confirm availability and estimated dispatch time. Thank you!'
  );

  return lines.join('\n');
}

export function buildWhatsAppOrderUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER_INTL}?text=${encodeURIComponent(message)}`;
}

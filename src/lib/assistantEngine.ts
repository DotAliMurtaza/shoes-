import { PRODUCTS, ShoeProduct, formatPKR, getEffectivePrice } from './products';

export interface HistoryTurn {
  role: string;
  text: string;
}

export interface InstantMatchResult {
  matched: boolean;
  reply: string;
  recommendedIds: string[];
  category: 'greeting' | 'gratitude' | 'farewell' | 'help' | 'contact' | 'policy' | 'tracking' | 'sizing' | 'catalog';
}

export interface CatalogSearchResult {
  matchedProducts: ShoeProduct[];
  compactContext: string;
  contextSummary: string;
  canAnswerInstantly: boolean;
  instantReply?: string;
}

const STOP_WORDS = new Set([
  'i', 'me', 'my', 'we', 'you', 'your', 'the', 'a', 'an', 'and', 'or', 'for', 'to', 'of',
  'in', 'on', 'with', 'show', 'find', 'suggest', 'recommend', 'want', 'need', 'looking',
  'please', 'can', 'could', 'would', 'what', 'which', 'are', 'is', 'have', 'any', 'some',
  'shoes', 'shoe', 'pair', 'pairs', 'best', 'good', 'something', 'about', 'wear',
]);

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^\w\s.]/g, ' ').replace(/\s+/g, ' ').trim();
}

export function matchInstantResponse(
  rawMessage: string,
  history: HistoryTurn[] = []
): InstantMatchResult | null {
  const norm = normalize(rawMessage);
  if (!norm) return null;

  // 1. Simple Greetings (instant <50ms)
  if (
    /^(hi|hello|hey|helo|hlo|salam|assalam|assalamualaikum|asalam o alaikum|aoa|good morning|good afternoon|good evening|greetings)(\s+(there|vellmont|assistant|bro|sir|maam))?$/.test(
      norm
    )
  ) {
    return {
      matched: true,
      category: 'greeting',
      reply:
        'Assalamualaikum and welcome to VELLMONT Atelier! Tell me your occasion, style preference (formal, casual, sneakers, or runners), or budget—I will match you with the finest pair.',
      recommendedIds: [],
    };
  }

  // 2. Gratitude
  if (/^(thanks|thank you|thankyou|thx|ty|shukriya|jazakallah|much appreciated)(\s+\w+){0,2}$/.test(norm)) {
    return {
      matched: true,
      category: 'gratitude',
      reply:
        'You are most welcome! Let me know anytime if you need sizing guidance, styling advice, or help completing your WhatsApp order.',
      recommendedIds: [],
    };
  }

  // 3. Farewell
  if (/^(bye|goodbye|good bye|see you|allah hafiz|khuda hafiz|take care|cya)$/.test(norm)) {
    return {
      matched: true,
      category: 'farewell',
      reply:
        'Thank you for visiting VELLMONT Atelier. Wishing you timeless comfort—reach out anytime on WhatsApp at 0328-2305470.',
      recommendedIds: [],
    };
  }

  // 4. Help / Assistant capabilities
  if (
    norm === 'help' ||
    /^(help me|what can you do|how do you work|menu|options)$/.test(norm)
  ) {
    return {
      matched: true,
      category: 'help',
      reply:
        'I can help you discover shoes by occasion (wedding, office, daily, gym), filter under Rs. 5,000 or by color & EU size (36–45), check store policies, and guide you through WhatsApp checkout (0328-2305470). Try tapping a quick filter below!',
      recommendedIds: [],
    };
  }

  // 5. Contact Info / Store Location
  if (
    /\b(contact|phone|number|whatsapp|email|call|reach|address|studio|location|shop address|store info)\b/.test(
      norm
    ) &&
    !/\b(shoe|oxford|loafer|sneaker|runner|mule|slipper|under)\b/.test(norm)
  ) {
    return {
      matched: true,
      category: 'contact',
      reply:
        'You can reach VELLMONT Atelier directly on WhatsApp or phone at +92 328 2305470 (0328-2305470), Mon–Sat 10:00 AM–9:00 PM PKT. All checkout orders are confirmed personally with our concierge team via WhatsApp.',
      recommendedIds: [],
    };
  }

  // 6. Track Order Help
  if (
    /\b(track|tracking|order status|where is my order|dispatch|parcel)\b/.test(norm) ||
    norm === 'track order help'
  ) {
    return {
      matched: true,
      category: 'tracking',
      reply:
        'VELLMONT orders are confirmed and dispatched directly through our WhatsApp concierge (0328-2305470). Simply message your full name or order details to +92 328 2305470 on WhatsApp for live courier tracking and dispatch updates.',
      recommendedIds: [],
    };
  }

  // 7. Store Policy / Delivery & Returns
  if (
    /\b(shipping|delivery|deliver|return|exchange|refund|warranty|policy|charges|fee|cod|cash on delivery|payment)\b/.test(
      norm
    ) &&
    !/\b(recommend|suggest|show|find|which shoe)\b/.test(norm)
  ) {
    return {
      matched: true,
      category: 'policy',
      reply:
        'VELLMONT Store Policy: Complimentary delivery on orders Rs. 8,000 and above (flat Rs. 350 below Rs. 8,000), Cash on Delivery nationwide across Pakistan, and a 14-day unworn size exchange guarantee. Checkout connects straight to WhatsApp (0328-2305470).',
      recommendedIds: [],
    };
  }

  // 8. Pure Sizing Guide queries
  if (
    /\b(size chart|size guide|sizing|measure foot|foot length|which size|help me select my shoe size)\b/.test(
      norm
    ) &&
    !/\b(formal|casual|sneaker|sport|runner|oxford|loafer|under|black|brown)\b/.test(norm)
  ) {
    return {
      matched: true,
      category: 'sizing',
      reply:
        'VELLMONT uses true European sizing (EU 36–45). Measure heel-to-toe: 24.0 cm = EU 38, 24.8 cm = EU 39, 25.5 cm = EU 40, 26.2 cm = EU 41, 26.8 cm = EU 42, 27.5 cm = EU 43, 28.2 cm = EU 44, 29.0 cm = EU 45. For pointed dress lasts with a wide instep, go one size up.',
      recommendedIds: [],
    };
  }

  // 9. Exact Quick-Action Deterministic Catalog Hits (ultra-fast <50ms)
  if (norm === 'best sellers' || norm === 'show best sellers' || norm === 'popular shoes') {
    const best = PRODUCTS.filter((p) => p.isBestSeller).slice(0, 3);
    return {
      matched: true,
      category: 'catalog',
      reply:
        'Here are our top-rated VELLMONT best sellers—crafted for enduring elegance, daily comfort, and signature finish:',
      recommendedIds: best.map((p) => p.id),
    };
  }

  if (
    norm === 'shoes under rs. 5000' ||
    norm === 'shoes under rs 5000' ||
    norm === 'suggest shoes under rs. 5000' ||
    norm === 'find shoes under rs. 5000' ||
    norm === 'under 5000' ||
    norm === 'under rs 5000'
  ) {
    const under = PRODUCTS.filter((p) => getEffectivePrice(p) <= 5000).slice(0, 3);
    return {
      matched: true,
      category: 'catalog',
      reply:
        'Here are our handcrafted pairs priced under Rs. 5,000, spanning office formal, casual suede mules, and lightweight athletic trainers:',
      recommendedIds: under.map((p) => p.id),
    };
  }

  if (norm === 'find shoes') {
    const curated = [
      PRODUCTS.find((p) => p.id === 'vellmont-sovereign-brogue'),
      PRODUCTS.find((p) => p.id === 'vellmont-milano-espresso-sneaker'),
      PRODUCTS.find((p) => p.id === 'vellmont-everyday-taupe-mule'),
    ].filter((p): p is ShoeProduct => Boolean(p));

    return {
      matched: true,
      category: 'catalog',
      reply:
        'Tell me the occasion (wedding, office, casual, gym), color, or budget you have in mind—meanwhile, here are three signature favorites from across the atelier:',
      recommendedIds: curated.map((p) => p.id),
    };
  }

  // Keep lint happy if history is inspected for greeting-after-reset or future tuning
  void history;
  return null;
}

interface ParsedIntent {
  maxPrice?: number;
  minPrice?: number;
  categories: string[];
  shapes: string[];
  colors: string[];
  gender?: 'Men' | 'Women';
  size?: number;
  occasions: string[];
  bestSellerOnly?: boolean;
  newArrivalOnly?: boolean;
  keywords: string[];
}

function parseIntentFromText(text: string): ParsedIntent {
  const norm = normalize(text);
  const intent: ParsedIntent = {
    categories: [],
    shapes: [],
    colors: [],
    occasions: [],
    keywords: [],
  };

  // Price parsing: "under 5000", "below rs. 10,000", "max 15000"
  const cleanNum = norm.replace(/,/g, '');
  const underMatch = cleanNum.match(/(?:under|below|less than|within|max|upto|up to|budget)\s*(?:rs\.?|pkr)?\s*(\d{3,6})/);
  if (underMatch) {
    intent.maxPrice = Number(underMatch[1]);
  } else if (/\b(cheap|budget|affordable|economical|low price)\b/.test(norm)) {
    intent.maxPrice = 6000;
  }

  const aboveMatch = cleanNum.match(/(?:above|over|more than|min)\s*(?:rs\.?|pkr)?\s*(\d{3,6})/);
  if (aboveMatch) {
    intent.minPrice = Number(aboveMatch[1]);
  }

  // Category & shoe shape detection
  if (/\b(formal|dress|suit|tuxedo|oxford|brogue|derby|wedding|groom|barat|walima|ceremony)\b/.test(norm)) {
    intent.categories.push('Formal Shoes', 'Premium Collection', 'Leather Shoes');
  }
  if (/\b(casual|everyday|slipper|mule|sandal|lounge|relax|weekend|brunch)\b/.test(norm)) {
    intent.categories.push('Casual Shoes');
  }
  if (/\b(sneaker|sneakers|trainer|court|street)\b/.test(norm)) {
    intent.categories.push('Sneakers');
  }
  if (/\b(sport|sports|run|running|runner|gym|workout|jog|athletic|knit)\b/.test(norm)) {
    intent.categories.push('Sports Shoes');
  }
  if (/\b(leather|loafer|loafers|penny|moccasin)\b/.test(norm)) {
    intent.categories.push('Leather Shoes', 'Premium Collection');
  }
  if (/\b(premium|luxury|signature|collector|bespoke|flagship)\b/.test(norm)) {
    intent.categories.push('Premium Collection');
  }

  if (/\b(oxford|brogue|derby|captoe|cap toe)\b/.test(norm)) intent.shapes.push('oxford');
  if (/\bloafer\b/.test(norm)) intent.shapes.push('loafer');
  if (/\b(sneaker|court)\b/.test(norm)) intent.shapes.push('sneaker');
  if (/\b(runner|sport|gym|trainer)\b/.test(norm)) intent.shapes.push('runner');
  if (/\b(slipper|mule|sandal)\b/.test(norm)) intent.shapes.push('slipper');

  // Color detection
  if (/\b(black|obsidian|noir|jet|dark)\b/.test(norm)) intent.colors.push('black', 'obsidian', 'jet', 'charcoal');
  if (/\b(brown|cognac|chestnut|espresso|mahogany|tan|umber)\b/.test(norm)) {
    intent.colors.push('brown', 'cognac', 'chestnut', 'espresso', 'mahogany', 'tan', 'umber');
  }
  if (/\b(white|ivory|cream|alabaster|sand|taupe|beige)\b/.test(norm)) {
    intent.colors.push('ivory', 'cream', 'sand', 'taupe', 'sandstone');
  }
  if (/\b(bronze|gold|brass|slate|graphite|grey|gray)\b/.test(norm)) {
    intent.colors.push('bronze', 'graphite', 'slate', 'charcoal');
  }

  // Gender detection
  if (/\b(women|woman|ladies|lady|female|her|she|girl)\b/.test(norm)) {
    intent.gender = 'Women';
  } else if (/\b(men|man|gents|male|him|his|boy|groom)\b/.test(norm)) {
    intent.gender = 'Men';
  }

  // Size detection (EU 36-45)
  const sizeMatch = norm.match(/\b(?:size|eu)?\s*(3[6-9]|4[0-5])\b/);
  if (sizeMatch) {
    intent.size = Number(sizeMatch[1]);
  }

  // Occasions & flags
  if (/\b(wedding|groom|barat|walima|reception|gala)\b/.test(norm)) intent.occasions.push('wedding', 'ceremonies', 'gala');
  if (/\b(office|work|business|corporate|meeting|boardroom)\b/.test(norm)) intent.occasions.push('office', 'business');
  if (/\b(daily|everyday|walk|travel|commute|casual)\b/.test(norm)) intent.occasions.push('everyday', 'daily', 'travel');
  if (/\b(gym|run|running|training|workout)\b/.test(norm)) intent.occasions.push('gym', 'training', 'running');

  if (/\b(best seller|bestseller|best sellers|popular|top rated|most loved)\b/.test(norm)) {
    intent.bestSellerOnly = true;
  }
  if (/\b(new arrival|new arrivals|latest|newest)\b/.test(norm)) {
    intent.newArrivalOnly = true;
  }

  // Remaining meaningful keywords
  intent.keywords = norm
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  return intent;
}

function isShortFollowUp(text: string): boolean {
  const words = normalize(text).split(/\s+/).filter(Boolean);
  return words.length <= 4;
}

export function searchCatalogWithContext(
  rawMessage: string,
  history: HistoryTurn[] = []
): CatalogSearchResult {
  const currentIntent = parseIntentFromText(rawMessage);
  let mergedIntent = { ...currentIntent };

  // Carry forward recent user context on short follow-ups like "Black." or "Under 5000" or "Men's"
  if (isShortFollowUp(rawMessage) && history.length > 0) {
    const recentUserText = history
      .filter((h) => h.role === 'user')
      .slice(-2)
      .map((h) => h.text)
      .join(' ');
    const priorIntent = parseIntentFromText(recentUserText);

    mergedIntent = {
      maxPrice: currentIntent.maxPrice ?? priorIntent.maxPrice,
      minPrice: currentIntent.minPrice ?? priorIntent.minPrice,
      categories:
        currentIntent.categories.length > 0 ? currentIntent.categories : priorIntent.categories,
      shapes: currentIntent.shapes.length > 0 ? currentIntent.shapes : priorIntent.shapes,
      colors: currentIntent.colors.length > 0 ? currentIntent.colors : priorIntent.colors,
      gender: currentIntent.gender ?? priorIntent.gender,
      size: currentIntent.size ?? priorIntent.size,
      occasions: currentIntent.occasions.length > 0 ? currentIntent.occasions : priorIntent.occasions,
      bestSellerOnly: currentIntent.bestSellerOnly || priorIntent.bestSellerOnly,
      newArrivalOnly: currentIntent.newArrivalOnly || priorIntent.newArrivalOnly,
      keywords: Array.from(new Set([...currentIntent.keywords, ...priorIntent.keywords])),
    };
  }

  const hasExplicitFilter =
    mergedIntent.maxPrice !== undefined ||
    mergedIntent.minPrice !== undefined ||
    mergedIntent.categories.length > 0 ||
    mergedIntent.shapes.length > 0 ||
    mergedIntent.colors.length > 0 ||
    mergedIntent.gender !== undefined ||
    mergedIntent.size !== undefined ||
    mergedIntent.occasions.length > 0 ||
    mergedIntent.bestSellerOnly ||
    mergedIntent.newArrivalOnly;

  // Score every product deterministically in <1ms
  const scored = PRODUCTS.map((product) => {
    const effectivePrice = getEffectivePrice(product);
    let score = 0;

    if (mergedIntent.maxPrice !== undefined) {
      if (effectivePrice <= mergedIntent.maxPrice) score += 8;
      else score -= 12;
    }
    if (mergedIntent.minPrice !== undefined) {
      if (effectivePrice >= mergedIntent.minPrice) score += 4;
      else score -= 8;
    }

    if (mergedIntent.categories.length > 0) {
      if (mergedIntent.categories.includes(product.category)) score += 7;
    }

    if (mergedIntent.shapes.length > 0) {
      if (mergedIntent.shapes.includes(product.shoeShape)) score += 6;
    }

    if (mergedIntent.colors.length > 0) {
      const colorHaystack = product.colors.map((c) => c.name.toLowerCase()).join(' ');
      const matchesColor = mergedIntent.colors.some((c) => colorHaystack.includes(c));
      if (matchesColor) score += 7;
      else score -= 4;
    }

    if (mergedIntent.gender) {
      if (product.gender === mergedIntent.gender) score += 5;
      else if (product.gender === 'Unisex') score += 2;
      else score -= 6;
    }

    if (mergedIntent.size !== undefined) {
      if (product.sizes.includes(mergedIntent.size)) score += 4;
      else score -= 10;
    }

    if (mergedIntent.occasions.length > 0) {
      const occ = `${product.occasion} ${product.subtitle} ${product.description}`.toLowerCase();
      if (mergedIntent.occasions.some((o) => occ.includes(o))) score += 6;
    }

    if (mergedIntent.bestSellerOnly && product.isBestSeller) score += 5;
    if (mergedIntent.newArrivalOnly && product.isNewArrival) score += 4;

    // Keyword boost across searchable text
    const searchable = `${product.name} ${product.subtitle} ${product.category} ${product.occasion} ${product.materials} ${product.colors.map((c) => c.name).join(' ')}`.toLowerCase();
    for (const kw of mergedIntent.keywords) {
      if (searchable.includes(kw)) score += 2;
    }

    // Small tie-breaker for best sellers & high rating
    score += product.isBestSeller ? 0.5 : 0;
    score += product.rating * 0.05;

    return { product, score };
  });

  scored.sort((a, b) => b.score - a.score);

  let matchedProducts = scored
    .filter((item) => (hasExplicitFilter ? item.score > 1 : item.score > 1.5))
    .slice(0, 3)
    .map((item) => item.product);

  // If user asked for a budget ceiling and nothing positive matched, enforce strict price cap fallback
  if (matchedProducts.length === 0 && mergedIntent.maxPrice !== undefined) {
    matchedProducts = PRODUCTS.filter((p) => getEffectivePrice(p) <= mergedIntent.maxPrice!).slice(0, 3);
  }

  // Fallback top picks if no strong filter matched
  if (matchedProducts.length === 0) {
    matchedProducts = scored.slice(0, 3).map((item) => item.product);
  }

  // Compact context string (ONLY 1–3 matched items, never the full 12-item catalog)
  const compactContext = matchedProducts
    .map((p) => {
      const price = formatPKR(getEffectivePrice(p));
      return `• ${p.name} (${p.category}, ${p.gender}) — ${price} | Sizes: EU ${p.sizes[0]}–${p.sizes[p.sizes.length - 1]} | Colors: ${p.colors.map((c) => c.name).join('/')} | ${p.occasion} | ${p.materials}`;
    })
    .join('\n');

  const contextParts: string[] = [];
  if (mergedIntent.maxPrice) contextParts.push(`budget <= Rs. ${mergedIntent.maxPrice}`);
  if (mergedIntent.categories.length) contextParts.push(`style: ${mergedIntent.categories[0]}`);
  if (mergedIntent.colors.length) contextParts.push(`color: ${mergedIntent.colors[0]}`);
  if (mergedIntent.gender) contextParts.push(`gender: ${mergedIntent.gender}`);
  if (mergedIntent.size) contextParts.push(`size: EU ${mergedIntent.size}`);

  const contextSummary = contextParts.join(', ');

  // Simple deterministic filters like single category chips or short color-only follow-ups can also be answered cleanly
  const norm = normalize(rawMessage);
  const isPureCategoryChip =
    norm === 'formal shoes' ||
    norm === 'casual shoes' ||
    norm === 'sneakers' ||
    norm === 'sports shoes' ||
    norm === 'leather shoes';

  if (isPureCategoryChip) {
    const label = rawMessage.trim();
    return {
      matchedProducts,
      compactContext,
      contextSummary,
      canAnswerInstantly: true,
      instantReply: `Here are our signature ${label} picks—crafted for lasting comfort and refined silhouette. Tap any pair below to inspect sizes, view in 360° 3D, or add directly to your bag.`,
    };
  }

  return {
    matchedProducts,
    compactContext,
    contextSummary,
    canAnswerInstantly: false,
  };
}

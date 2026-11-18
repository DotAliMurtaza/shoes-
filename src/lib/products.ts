export type ShoeCategory =
  | 'Formal Shoes'
  | 'Casual Shoes'
  | 'Sneakers'
  | 'Sports Shoes'
  | 'Leather Shoes'
  | 'Premium Collection';

export type ShoeGender = 'Men' | 'Women' | 'Unisex';

export type ShoeShape = 'oxford' | 'sneaker' | 'loafer' | 'runner' | 'slipper';

export interface ShoeColorOption {
  name: string;
  hex: string;
  soleHex: string;
}

export interface ShoeProduct {
  id: string;
  name: string;
  subtitle: string;
  category: ShoeCategory;
  gender: ShoeGender;
  price: number;
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  sizes: number[];
  colors: ShoeColorOption[];
  image: string;
  gallery: string[];
  description: string;
  occasion: string;
  materials: string;
  construction: string;
  stockCount: number;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  shoeShape: ShoeShape;
}

export const SHOE_CATEGORIES: ShoeCategory[] = [
  'Formal Shoes',
  'Casual Shoes',
  'Sneakers',
  'Sports Shoes',
  'Leather Shoes',
  'Premium Collection',
];

export const PRODUCTS: ShoeProduct[] = [
  {
    id: 'vellmont-sovereign-brogue',
    name: 'Sovereign Cognac Brogue',
    subtitle: 'Hand-Burnished Full-Grain Oxford',
    category: 'Premium Collection',
    gender: 'Men',
    price: 22500,
    discountPrice: 18900,
    rating: 4.9,
    reviewCount: 142,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Burnished Cognac', hex: '#7A3E1D', soleHex: '#2B1B12' },
      { name: 'Obsidian Black', hex: '#181615', soleHex: '#12100E' },
      { name: 'Dark Espresso', hex: '#3B2314', soleHex: '#1C110B' },
    ],
    image: '/src/assets/images/hero_leather_oxford_1794984719868.jpg',
    gallery: [
      '/src/assets/images/hero_leather_oxford_1794984719868.jpg',
      '/src/assets/images/shoe_formal_obsidian_1794984721310.jpg',
      '/src/assets/images/shoe_loafer_cognac_1794984722286.jpg',
    ],
    description:
      'Sculpted on an elongated architectural last, the Sovereign Cognac Brogue showcases hand-perforated wingtip medallions, 360-degree Goodyear storm welting, and vegetable-tanned calfskin lining that molds effortlessly to your foot.',
    occasion: 'Weddings, Executive Galas, Black-Tie & Bespoke Tailoring',
    materials: 'Full-grain Italian calfskin upper, oak-bark leather sole, cork midsole',
    construction: 'Hand-stitched 360° Goodyear Welt',
    stockCount: 14,
    isBestSeller: true,
    isNewArrival: true,
    shoeShape: 'oxford',
  },
  {
    id: 'vellmont-noir-captoe',
    name: 'Noir Atelier Cap-Toe',
    subtitle: 'Mirror-Polished Formal Oxford',
    category: 'Formal Shoes',
    gender: 'Men',
    price: 16500,
    discountPrice: 13800,
    rating: 4.9,
    reviewCount: 118,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Obsidian Calf', hex: '#141312', soleHex: '#0F0D0C' },
      { name: 'Midnight Espresso', hex: '#2A1D16', soleHex: '#17110D' },
    ],
    image: '/src/assets/images/shoe_formal_obsidian_1794984721310.jpg',
    gallery: [
      '/src/assets/images/shoe_formal_obsidian_1794984721310.jpg',
      '/src/assets/images/hero_leather_oxford_1794984719868.jpg',
    ],
    description:
      'Clean closed-lacing quarters paired with a razor-crisp stitched cap toe. Built for all-day boardroom poise and formal evening ceremonies with shock-absorbing memory cork bedding.',
    occasion: 'Weddings, Daily Executive Office, Formal Ceremonies',
    materials: 'Aniline-dyed black calfskin, breathable lambskin lining',
    construction: 'Blake-Stitched Heritage Sole',
    stockCount: 22,
    isBestSeller: true,
    shoeShape: 'oxford',
  },
  {
    id: 'vellmont-milano-espresso-sneaker',
    name: 'Milano Espresso Low',
    subtitle: 'Dual-Tone Calfskin Court Sneaker',
    category: 'Sneakers',
    gender: 'Unisex',
    price: 11800,
    discountPrice: 9400,
    rating: 4.8,
    reviewCount: 96,
    sizes: [39, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Obsidian & Cognac', hex: '#1B1918', soleHex: '#EAE3D5' },
      { name: 'Warm Chestnut', hex: '#6E3F22', soleHex: '#F0EAE0' },
    ],
    image: '/src/assets/images/shoe_sneaker_espresso_1794984721146.jpg',
    gallery: [
      '/src/assets/images/shoe_sneaker_espresso_1794984721146.jpg',
      '/src/assets/images/shoe_sneaker_ivory_1794984721553.jpg',
    ],
    description:
      'Minimalist luxury architecture in matte black and rich cognac calfskin, anchored by a sculpted ivory Margom-style cupsole with reinforced heel stabilizer.',
    occasion: 'Smart-Casual Fridays, Travel, Gallery Evenings',
    materials: 'Nappa & burnished calfskin leather, lightweight EVA cupsole',
    construction: 'Side-wall stitched cupsole',
    stockCount: 19,
    isBestSeller: true,
    isNewArrival: true,
    shoeShape: 'sneaker',
  },
  {
    id: 'vellmont-ivory-suede-court',
    name: 'Alabaster Suede Court',
    subtitle: 'Ivory Nappa & Sand Suede Trainer',
    category: 'Sneakers',
    gender: 'Women',
    price: 10900,
    discountPrice: 8900,
    rating: 4.9,
    reviewCount: 84,
    sizes: [36, 37, 38, 39, 40, 41, 42],
    colors: [
      { name: 'Ivory & Sand Suede', hex: '#E8E0D2', soleHex: '#F3EEE4' },
      { name: 'Champagne Taupe', hex: '#C7B8A1', soleHex: '#EFE9DE' },
    ],
    image: '/src/assets/images/shoe_sneaker_ivory_1794984721553.jpg',
    gallery: [
      '/src/assets/images/shoe_sneaker_ivory_1794984721553.jpg',
      '/src/assets/images/shoe_sneaker_espresso_1794984721146.jpg',
    ],
    description:
      'Supple cream calfskin paired with water-repellent sand suede paneling and waxed tonal cotton laces. Engineered with an anatomical leather-lined footbed.',
    occasion: 'Weekend City Walks, Smart Casual, Resort Travel',
    materials: 'Cream nappa leather, brushed split suede, natural crepe-tone rubber',
    construction: 'Strobel flexible stitched court sole',
    stockCount: 16,
    isNewArrival: true,
    shoeShape: 'sneaker',
  },
  {
    id: 'vellmont-aurelia-penny-loafer',
    name: 'Aurelia Brass Penny Loafer',
    subtitle: 'Hand-Sewn Apron Leather Loafer',
    category: 'Leather Shoes',
    gender: 'Men',
    price: 14500,
    discountPrice: 11900,
    rating: 4.8,
    reviewCount: 73,
    sizes: [39, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Chestnut Mahogany', hex: '#632F18', soleHex: '#261710' },
      { name: 'Obsidian Black', hex: '#171514', soleHex: '#100E0D' },
    ],
    image: '/src/assets/images/shoe_loafer_cognac_1794984722286.jpg',
    gallery: [
      '/src/assets/images/shoe_loafer_cognac_1794984722286.jpg',
      '/src/assets/images/hero_leather_oxford_1794984719868.jpg',
    ],
    description:
      'Featuring a signature antique bronze medallion detail tucked into a hand-sewn apron strap. Slip-on sophistication designed for effortless transition from office to dinner.',
    occasion: 'Business Casual, Weddings, Heritage Office Wear',
    materials: 'Chestnut burnished calfskin, stacked leather heel, brass crest',
    construction: 'Hand-sewn moccasin apron with Blake stitch',
    stockCount: 12,
    isBestSeller: true,
    shoeShape: 'loafer',
  },
  {
    id: 'vellmont-apex-bronze-runner',
    name: 'Apex Bronze Knit Runner',
    subtitle: 'Architectural Performance Trainer',
    category: 'Sports Shoes',
    gender: 'Unisex',
    price: 9800,
    discountPrice: 7900,
    rating: 4.7,
    reviewCount: 64,
    sizes: [38, 39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Charcoal & Bronze', hex: '#2B2B2C', soleHex: '#434345' },
      { name: 'Obsidian Slate', hex: '#1B1B1D', soleHex: '#2A2A2C' },
    ],
    image: '/src/assets/images/shoe_sport_obsidian_1794984721850.jpg',
    gallery: [
      '/src/assets/images/shoe_sport_obsidian_1794984721850.jpg',
      '/src/assets/images/shoe_sneaker_espresso_1794984721146.jpg',
    ],
    description:
      'Engineered mesh airflow meets matte suede mudguards and an anodized bronze heel counter for high-stability stride support and responsive dual-density cushioning.',
    occasion: 'Daily Training, Urban Running, Active Travel',
    materials: '3D ballistic knit, matte suede overlays, metallic TPU heel clip',
    construction: 'Dual-density nitrogen-infused midsole',
    stockCount: 25,
    isNewArrival: true,
    shoeShape: 'runner',
  },
  {
    id: 'vellmont-everyday-taupe-mule',
    name: 'Verona Buckled Suede Mule',
    subtitle: 'The Everyday Slipper Edition',
    category: 'Casual Shoes',
    gender: 'Women',
    price: 5900,
    discountPrice: 4650,
    rating: 4.9,
    reviewCount: 131,
    sizes: [36, 37, 38, 39, 40, 41, 42],
    colors: [
      { name: 'Taupe Suede', hex: '#574A3E', soleHex: '#231D18' },
      { name: 'Dark Espresso Leather', hex: '#382319', soleHex: '#1D120D' },
    ],
    image: '/src/assets/images/banner_everyday_slipper_1794984719657.jpg',
    gallery: [
      '/src/assets/images/banner_everyday_slipper_1794984719657.jpg',
      '/src/assets/images/shoe_slipper_suede_1794984722813.jpg',
    ],
    description:
      'Velvety taupe suede lined in breathable shearling-soft cushioning with an antique brushed-brass strap buckle. Effortless luxury engineered for indoor sanctuary and outdoor errands alike.',
    occasion: 'Everyday Casual, Lounge, Weekend Brunch',
    materials: 'Split suede upper, contoured leather footbed, brushed brass buckle',
    construction: 'Welted flexible rubber-leather outsole',
    stockCount: 28,
    isBestSeller: true,
    shoeShape: 'slipper',
  },
  {
    id: 'vellmont-espresso-atelier-slipper',
    name: 'Heritage Espresso Mule',
    subtitle: 'Full-Grain Buckled Slip-On',
    category: 'Casual Shoes',
    gender: 'Men',
    price: 5600,
    discountPrice: 4450,
    rating: 4.8,
    reviewCount: 89,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Espresso Grain', hex: '#3B241A', soleHex: '#22150F' },
      { name: 'Burnished Tan', hex: '#7D4927', soleHex: '#331E11' },
    ],
    image: '/src/assets/images/shoe_slipper_suede_1794984722813.jpg',
    gallery: [
      '/src/assets/images/shoe_slipper_suede_1794984722813.jpg',
      '/src/assets/images/banner_everyday_slipper_1794984719657.jpg',
    ],
    description:
      'Supple dark espresso full-grain leather with contrast welt stitching and a solid brass roller buckle. Designed for instant slip-on elegance and arch-contoured support.',
    occasion: 'Everyday Casual, Resort, Relaxed Evenings',
    materials: 'Full-grain cowhide leather, padded leather insole, stacked heel',
    construction: '360° stitched leather welt',
    stockCount: 31,
    shoeShape: 'slipper',
  },
  {
    id: 'vellmont-executive-derby-essential',
    name: 'Valence Office Derby',
    subtitle: 'Everyday Comfort Formal Shoe',
    category: 'Formal Shoes',
    gender: 'Men',
    price: 5800,
    discountPrice: 4850,
    rating: 4.7,
    reviewCount: 105,
    sizes: [39, 40, 41, 42, 43, 44],
    colors: [
      { name: 'Jet Black', hex: '#161515', soleHex: '#0E0D0D' },
      { name: 'Rich Chestnut', hex: '#5D311B', soleHex: '#26140B' },
    ],
    image: '/src/assets/images/shoe_formal_obsidian_1794984721310.jpg',
    gallery: [
      '/src/assets/images/shoe_formal_obsidian_1794984721310.jpg',
      '/src/assets/images/shoe_loafer_cognac_1794984722286.jpg',
    ],
    description:
      'Lightweight open-lacing formal derby built specifically for 10-hour office schedules. Combines polished full-grain leather appearance with ultra-soft Ortholite heel cushioning.',
    occasion: 'Daily Office Wear, Business Meetings, Presentations',
    materials: 'Polished cowhide leather, cushioned breathable textile collar',
    construction: 'Direct-injected shock-absorbing formal sole',
    stockCount: 34,
    shoeShape: 'oxford',
  },
  {
    id: 'vellmont-monarch-leather-oxford',
    name: 'Monarch Imperial Oxford',
    subtitle: 'Museum Calfskin Collector Edition',
    category: 'Leather Shoes',
    gender: 'Men',
    price: 24500,
    discountPrice: 21500,
    rating: 5.0,
    reviewCount: 52,
    sizes: [40, 41, 42, 43, 44],
    colors: [
      { name: 'Imperial Cognac', hex: '#84421C', soleHex: '#2B180D' },
      { name: 'Smoked Umber', hex: '#4B2B18', soleHex: '#1D120C' },
    ],
    image: '/src/assets/images/hero_leather_oxford_1794984719868.jpg',
    gallery: [
      '/src/assets/images/hero_leather_oxford_1794984719868.jpg',
      '/src/assets/images/shoe_loafer_cognac_1794984722286.jpg',
    ],
    description:
      'Our flagship collector masterpiece signed inside the waist by Ali Murtaza Atelier. Hand-painted patina over 14 hours, fiddleback beveled leather waist, and brass toe taps.',
    occasion: 'Collector Showcase, Groom & Wedding Ceremonies',
    materials: 'Museum calfskin, channeled oak-bark leather sole, brass toe plates',
    construction: 'Hand-welted bespoke fiddleback waist',
    stockCount: 7,
    isNewArrival: true,
    shoeShape: 'oxford',
  },
  {
    id: 'vellmont-stride-essential-runner',
    name: 'Stratos Essential Trainer',
    subtitle: 'Lightweight Everyday Sport Shoe',
    category: 'Sports Shoes',
    gender: 'Men',
    price: 5400,
    discountPrice: 4390,
    rating: 4.6,
    reviewCount: 77,
    sizes: [39, 40, 41, 42, 43, 44, 45],
    colors: [
      { name: 'Graphite Bronze', hex: '#303033', soleHex: '#464649' },
      { name: 'Sandstone Ivory', hex: '#DFD7C8', soleHex: '#EDE8DF' },
    ],
    image: '/src/assets/images/shoe_sport_obsidian_1794984721850.jpg',
    gallery: [
      '/src/assets/images/shoe_sport_obsidian_1794984721850.jpg',
      '/src/assets/images/shoe_sneaker_ivory_1794984721553.jpg',
    ],
    description:
      'Breathable engineered mesh trainer priced for everyday athletic versatility. Delivers high-rebound foam cushioning and slip-resistant multi-directional tread.',
    occasion: 'Gym, Morning Walks, Casual Commute',
    materials: 'Breathable knit mesh, synthetic nubuck cage, EVA rebound sole',
    construction: 'Bonded lightweight athletic chassis',
    stockCount: 40,
    shoeShape: 'runner',
  },
  {
    id: 'vellmont-celeste-women-loafer',
    name: 'Celeste Sculpted Loafer',
    subtitle: 'Women’s Heritage Leather Slip-On',
    category: 'Premium Collection',
    gender: 'Women',
    price: 13900,
    discountPrice: 11200,
    rating: 4.9,
    reviewCount: 68,
    sizes: [36, 37, 38, 39, 40, 41],
    colors: [
      { name: 'Chestnut Glaze', hex: '#6A3319', soleHex: '#2B160B' },
      { name: 'Ivory Cream', hex: '#E6DDD0', soleHex: '#D1C4B2' },
    ],
    image: '/src/assets/images/shoe_loafer_cognac_1794984722286.jpg',
    gallery: [
      '/src/assets/images/shoe_loafer_cognac_1794984722286.jpg',
      '/src/assets/images/shoe_sneaker_ivory_1794984721553.jpg',
    ],
    description:
      'Tailored on a sleek feminine almond last with soft lambskin lining that requires zero break-in time. Finished with a signature antique gold crest.',
    occasion: 'Executive Office, Brunch, Cultural Evenings',
    materials: 'Glazed Italian calfskin, cushioned lambskin footbed',
    construction: 'Flexible Sacchetto leather construction',
    stockCount: 15,
    isNewArrival: true,
    shoeShape: 'loafer',
  },
];

export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString('en-PK')}`;
}

export function getEffectivePrice(product: ShoeProduct): number {
  return product.discountPrice ?? product.price;
}

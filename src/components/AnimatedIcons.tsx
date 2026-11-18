import { motion } from 'motion/react';
import {
  Headphones,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Truck,
  User,
} from 'lucide-react';

export function AnimatedHomeIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center"
      whileHover={{ y: -1.5, scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      <Home className={className} />
    </motion.span>
  );
}

export function AnimatedSearchIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center"
      whileHover={{ scale: 1.12, rotate: -10 }}
      transition={{ type: 'spring', stiffness: 400, damping: 18 }}
    >
      <Search className={className} />
    </motion.span>
  );
}

export function AnimatedBagIcon({
  bounceKey = 0,
  className = 'h-4 w-4',
}: {
  bounceKey?: number;
  className?: string;
}) {
  return (
    <motion.span
      key={bounceKey}
      className="inline-flex items-center justify-center"
      initial={bounceKey > 0 ? { scale: 1.35, y: -4 } : false}
      animate={{ scale: 1, y: 0 }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 420, damping: 14 }}
    >
      <ShoppingBag className={className} />
    </motion.span>
  );
}

export function AnimatedCartIcon({
  bounceKey = 0,
  className = 'h-4 w-4',
}: {
  bounceKey?: number;
  className?: string;
}) {
  return (
    <motion.span
      key={bounceKey}
      className="inline-flex items-center justify-center"
      initial={bounceKey > 0 ? { scale: 1.3, x: 3 } : false}
      animate={{ scale: 1, x: 0 }}
      whileHover={{ x: 2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 16 }}
    >
      <ShoppingCart className={className} />
    </motion.span>
  );
}

export function AnimatedWishlistHeart({
  active,
  className = 'h-4 w-4',
}: {
  active: boolean;
  className?: string;
}) {
  return (
    <motion.span
      className="inline-flex items-center justify-center"
      animate={active ? { scale: [1, 1.35, 1] } : { scale: 1 }}
      whileTap={{ scale: 0.85 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
    >
      <Heart
        className={`${className} transition-colors duration-200 ${
          active ? 'fill-[#C9A461] text-[#C9A461]' : ''
        }`}
      />
    </motion.span>
  );
}

export function AnimatedUserIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center"
      whileHover={{ rotate: 12, scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 360, damping: 18 }}
    >
      <User className={className} />
    </motion.span>
  );
}

export function AnimatedMenuToggle({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <motion.line
        x1="4"
        x2="20"
        animate={isOpen ? { y1: 12, y2: 12, rotate: 45 } : { y1: 6, y2: 6, rotate: 0 }}
        style={{ originX: '12px', originY: '12px' }}
        transition={{ duration: 0.22 }}
      />
      <motion.line
        x1="4"
        y1="12"
        x2="20"
        y2="12"
        animate={{ opacity: isOpen ? 0 : 1, scaleX: isOpen ? 0.2 : 1 }}
        transition={{ duration: 0.16 }}
      />
      <motion.line
        x1="4"
        x2="20"
        animate={isOpen ? { y1: 12, y2: 12, rotate: -45 } : { y1: 18, y2: 18, rotate: 0 }}
        style={{ originX: '12px', originY: '12px' }}
        transition={{ duration: 0.22 }}
      />
    </svg>
  );
}

export function AnimatedLocationIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center"
      whileHover={{ y: -2, scale: 1.1 }}
      transition={{ type: 'spring', stiffness: 360, damping: 18 }}
    >
      <MapPin className={className} />
    </motion.span>
  );
}

export function AnimatedDeliveryIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center"
      whileHover={{ x: 3 }}
      transition={{ type: 'spring', stiffness: 360, damping: 18 }}
    >
      <Truck className={className} />
    </motion.span>
  );
}

export function AnimatedSupportIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center"
      whileHover={{ rotate: [-6, 6, 0], scale: 1.08 }}
      transition={{ duration: 0.35 }}
    >
      <Headphones className={className} />
    </motion.span>
  );
}

export function AnimatedWhatsAppIcon({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center"
      animate={{ scale: [1, 1.09, 1] }}
      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      <MessageCircle className={className} />
    </motion.span>
  );
}

export function AnimatedAISparkleIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <motion.span
      className="inline-flex items-center justify-center"
      whileHover={{ rotate: 20, scale: 1.12 }}
      transition={{ type: 'spring', stiffness: 320, damping: 16 }}
    >
      <Sparkles className={className} />
    </motion.span>
  );
}

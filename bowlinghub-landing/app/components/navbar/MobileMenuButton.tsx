'use client';

import { cn } from '@/lib/utils';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  size?: 'normal' | 'compact';
}

export default function MobileMenuButton({ isOpen, onClick, size = 'normal' }: MobileMenuButtonProps) {
  const iconSize = size === 'compact' ? 'w-5 h-5' : 'w-6 h-6';

  return (
    <button
      onClick={onClick}
      className="lg:hidden text-white/90 hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] rounded p-1"
      aria-label="Menu"
      aria-expanded={isOpen}
    >
      {isOpen ? (
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className={iconSize} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      )}
    </button>
  );
}


'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import NavbarLogo from './NavbarLogo';
import DesktopNav from './DesktopNav';
import SocialIcons from './SocialIcons';
import MobileMenuButton from './MobileMenuButton';
import MobileMenu from './MobileMenu';

interface NavbarCompactProps {
  isVisible: boolean;
}

export default function NavbarCompact({ isVisible }: NavbarCompactProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 bg-[#1A1A2E]/98 backdrop-blur-lg border-b border-[#2D2D44]/50 shadow-xl transition-all duration-300',
      'rounded-b-2xl mx-auto',
      'border-x border-x-[#2D2D44]/30',
      'ring-1 ring-[#8B5CF6]/20 shadow-[0_4px_20px_rgba(139,92,246,0.3)]',
      'w-[95%] md:w-[98%] left-1/2 -translate-x-1/2',
      isVisible 
        ? 'translate-y-0 opacity-100 visible' 
        : 'translate-y-[-100%] opacity-0 invisible'
    )}>
      <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-14 md:h-16">
          <NavbarLogo size="compact" />

          <div className="flex-1 flex items-center justify-end gap-4 lg:gap-6">
            <DesktopNav size="compact" />

            <div className="flex items-center gap-2">
              <SocialIcons size="compact" />
              <MobileMenuButton 
                isOpen={isMobileMenuOpen} 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                size="compact"
              />
            </div>
          </div>
        </div>

        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)}
          size="compact"
        />
      </div>
    </header>
  );
}


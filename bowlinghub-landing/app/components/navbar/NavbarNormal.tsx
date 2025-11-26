'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import NavbarLogo from './NavbarLogo';
import DesktopNav from './DesktopNav';
import SocialIcons from './SocialIcons';
import MobileMenuButton from './MobileMenuButton';
import MobileMenu from './MobileMenu';

interface NavbarNormalProps {
  isHidden: boolean;
}

export default function NavbarNormal({ isHidden }: NavbarNormalProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className={cn(
      'relative z-40 w-full bg-[#1A1A2E]/95 backdrop-blur-md border-b border-[#2D2D44] border-x border-x-[#2D2D44]/30 shadow-lg transition-all duration-300',
      'ring-1 ring-[#8B5CF6]/20 shadow-[0_4px_20px_rgba(139,92,246,0.3)]',
      isHidden && 'hidden'
    )}>
      <div className="container mx-auto w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16 md:h-20">
          <NavbarLogo size="normal" />

          <div className="flex-1 flex items-center justify-end gap-6 lg:gap-8">
            <DesktopNav size="normal" />

            <div className="flex items-center gap-3">
              <SocialIcons size="normal" />
              <MobileMenuButton 
                isOpen={isMobileMenuOpen} 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                size="normal"
              />
            </div>
          </div>
        </div>

        <MobileMenu 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)}
          size="normal"
        />
      </div>
    </header>
  );
}


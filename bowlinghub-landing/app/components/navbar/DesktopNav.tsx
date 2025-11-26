'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import ActivitiesDropdown from './ActivitiesDropdown';

interface DesktopNavProps {
  size?: 'normal' | 'compact';
}

export default function DesktopNav({ size = 'normal' }: DesktopNavProps) {
  const pathname = usePathname();
  const isCompact = size === 'compact';

  const navItems = [
    { href: '/menu', label: 'Menu' },
    { href: '/promocje', label: 'Promocje' },
    { href: '/galeria', label: 'Galeria' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  return (
    <nav className={cn(
      'hidden lg:flex items-center',
      isCompact ? 'gap-4' : 'gap-6'
    )}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'relative px-2 py-2 font-medium transition-all duration-200 uppercase tracking-wider',
              'focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 focus:ring-offset-[#1A1A2E] rounded',
              isCompact ? 'text-xs' : 'text-sm',
              isActive
                ? 'text-white underline decoration-2 decoration-[#8B5CF6] underline-offset-4'
                : 'text-white/90 hover:text-white hover:underline decoration-2 decoration-white/50 hover:decoration-white underline-offset-4'
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <ActivitiesDropdown size={size} />
    </nav>
  );
}


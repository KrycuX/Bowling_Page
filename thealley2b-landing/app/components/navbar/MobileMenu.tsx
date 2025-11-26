'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'normal' | 'compact';
}

const activities = [
  { href: '/aktywnosci/kregle', label: 'Kregle' },
  { href: '/aktywnosci/bilard', label: 'Bilard' },
  { href: '/aktywnosci/quizy', label: 'Quizy' },
  { href: '/aktywnosci/karaoke', label: 'Karaoke' },
];

export default function MobileMenu({ isOpen, onClose, size = 'normal' }: MobileMenuProps) {
  const pathname = usePathname();
  const isCompact = size === 'compact';
  const [isActivitiesOpen, setIsActivitiesOpen] = useState(false);

  const navItems = [
    { href: '/menu', label: 'Menu' },
    { href: '/promocje', label: 'Promocje' },
    { href: '/galeria', label: 'Galeria' },
    { href: '/kontakt', label: 'Kontakt' },
  ];

  const isActivitiesActive = pathname.startsWith('/aktywnosci');

  return (
    <nav className={cn(
      'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
      isOpen ? (isCompact ? 'max-h-[600px] pb-3 pt-2' : 'max-h-[700px] pb-4 pt-2') : 'max-h-0 pb-0 pt-0'
    )}>
      <div className={cn('flex flex-col', isCompact ? 'gap-3' : 'gap-4')}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                'relative px-4 py-3 font-medium transition-all duration-200 uppercase tracking-wider',
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
        
        {/* Activities Dropdown */}
        <div>
          <button
            onClick={() => setIsActivitiesOpen(!isActivitiesOpen)}
            className={cn(
              'relative px-4 py-3 font-medium transition-all duration-200 uppercase tracking-wider w-full flex items-center justify-between',
              isCompact ? 'text-xs' : 'text-sm',
              isActivitiesActive
                ? 'text-white underline decoration-2 decoration-[#8B5CF6] underline-offset-4'
                : 'text-white/90 hover:text-white'
            )}
          >
            <span>Aktywności</span>
            <ChevronDown 
              className={cn(
                'transition-transform duration-200',
                isActivitiesOpen ? 'rotate-180' : '',
                isCompact ? 'w-3 h-3' : 'w-4 h-4'
              )} 
            />
          </button>
          
          <div className={cn(
            'overflow-hidden transition-all duration-300 ease-in-out',
            isActivitiesOpen ? 'max-h-[300px] opacity-100' : 'max-h-0 opacity-0'
          )}>
            <div className={cn('flex flex-col pl-8', isCompact ? 'gap-2 pt-2' : 'gap-3 pt-2')}>
              {activities.map((activity) => {
                const isActivityActive = pathname === activity.href;
                return (
                  <Link
                    key={activity.href}
                    href={activity.href}
                    onClick={onClose}
                    className={cn(
                      'px-4 py-2 text-sm font-medium transition-all duration-200',
                      isActivityActive
                        ? 'text-white border-l-4 border-[#8B5CF6] pl-4'
                        : 'text-white/70 hover:text-white hover:pl-6'
                    )}
                  >
                    {activity.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


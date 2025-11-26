'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface ActivitiesDropdownProps {
  size?: 'normal' | 'compact';
}

const activities = [
  { href: '/aktywnosci/kregle', label: 'Kregle' },
  { href: '/aktywnosci/bilard', label: 'Bilard' },
  { href: '/aktywnosci/quizy', label: 'Quizy' },
  { href: '/aktywnosci/karaoke', label: 'Karaoke' },
];

export default function ActivitiesDropdown({ size = 'normal' }: ActivitiesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isCompact = size === 'compact';
  
  const isActive = pathname.startsWith('/aktywnosci');

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        className={cn(
          'relative px-2 py-2 font-medium transition-all duration-200 uppercase tracking-wider flex items-center gap-1',
          'focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 focus:ring-offset-[#1A1A2E] rounded',
          isCompact ? 'text-xs' : 'text-sm',
          isActive || isOpen
            ? 'text-white underline decoration-2 decoration-[#8B5CF6] underline-offset-4'
            : 'text-white/90 hover:text-white hover:underline decoration-2 decoration-white/50 hover:decoration-white underline-offset-4'
        )}
      >
        Aktywności
        <ChevronDown 
          className={cn(
            'transition-transform duration-200',
            isOpen ? 'rotate-180' : '',
            isCompact ? 'w-3 h-3' : 'w-4 h-4'
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      <div
        className={cn(
          'absolute top-full left-0 mt-2 bg-[#1A1A2E]/98 backdrop-blur-lg border border-[#2D2D44] rounded-xl shadow-xl',
          'min-w-[200px] overflow-hidden transition-all duration-300',
          isOpen
            ? 'opacity-100 translate-y-0 visible'
            : 'opacity-0 -translate-y-2 invisible pointer-events-none'
        )}
        onMouseLeave={() => setIsOpen(false)}
      >
        <div className="py-2">
          {activities.map((activity, index) => {
            const isActivityActive = pathname === activity.href;
            return (
              <Link
                key={activity.href}
                href={activity.href}
                className={cn(
                  'block px-4 py-3 text-sm font-medium transition-all duration-200',
                  'hover:bg-[#2D2D44] hover:text-white',
                  isActivityActive
                    ? 'bg-[#2D2D44] text-white border-l-4 border-[#8B5CF6]'
                    : 'text-white/90',
                  'hover:translate-x-1 transition-transform'
                )}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
                onClick={() => setIsOpen(false)}
              >
                {activity.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}


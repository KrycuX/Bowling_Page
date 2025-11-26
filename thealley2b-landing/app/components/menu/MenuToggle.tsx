'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface MenuToggleProps {
  onToggle: (section: 'menu' | 'napoje') => void;
  activeSection: 'menu' | 'napoje';
}

export default function MenuToggle({ onToggle, activeSection }: MenuToggleProps) {
  return (
    <div className="flex gap-4 mb-8 justify-center">
      <button
        onClick={() => onToggle('menu')}
        className={cn(
          'px-6 py-2 rounded-lg font-semibold transition-all duration-200 uppercase tracking-wider',
          activeSection === 'menu'
            ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/50'
            : 'bg-[#1A1A2E] text-white/70 hover:bg-[#2D2D44] hover:text-white border border-[#2D2D44]'
        )}
      >
        Menu
      </button>
      <button
        onClick={() => onToggle('napoje')}
        className={cn(
          'px-6 py-2 rounded-lg font-semibold transition-all duration-200 uppercase tracking-wider',
          activeSection === 'napoje'
            ? 'bg-[#8B5CF6] text-white shadow-lg shadow-[#8B5CF6]/50'
            : 'bg-[#1A1A2E] text-white/70 hover:bg-[#2D2D44] hover:text-white border border-[#2D2D44]'
        )}
      >
        Napoje
      </button>
    </div>
  );
}


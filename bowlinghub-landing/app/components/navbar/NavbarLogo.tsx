import Link from 'next/link';
import { cn } from '@/lib/utils';

interface NavbarLogoProps {
  size?: 'normal' | 'compact';
  className?: string;
}

export default function NavbarLogo({ size = 'normal', className }: NavbarLogoProps) {
  const isCompact = size === 'compact';

  return (
    <Link 
      href="/" 
      className={cn(
        'flex items-center gap-2 group transition-all hover:scale-105',
        isCompact && 'gap-1.5',
        className
      )}
    >
      {/* Pulsujący akcent zamiast graficznego logo */}
      <span
        className={cn(
          'relative flex items-center justify-center rounded-full',
          isCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'
        )}
      >
        <span
          className={cn(
            'absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-40 animate-ping',
          )}
        />
        <span
          className={cn(
            'relative inline-flex rounded-full bg-sky-400',
            isCompact ? 'w-1.5 h-1.5' : 'w-2 h-2'
          )}
        />
      </span>
      <span className={cn(
        'text-white font-bold tracking-tight group-hover:text-sky-300 transition-colors duration-200',
        isCompact 
          ? 'text-base md:text-lg' 
          : 'text-xl md:text-2xl'
      )}>
        Demo Bowling
      </span>
    </Link>
  );
}


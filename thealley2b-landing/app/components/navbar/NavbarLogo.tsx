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
      <div className={cn('flex items-center', isCompact ? 'gap-0.5' : 'gap-1')}>
        <div className={cn('bg-[#8B5CF6] rounded-full animate-pulse', isCompact ? 'w-1.5 h-1.5' : 'w-2 h-2')}></div>
        <div className={cn('bg-[#A78BFA] rounded-full', isCompact ? 'w-1.5 h-1.5' : 'w-2 h-2')}></div>
        <div className={cn('bg-[#8B5CF6] rounded-full animate-pulse delay-75', isCompact ? 'w-2 h-2' : 'w-3 h-3')}></div>
        <div className={cn('bg-[#A78BFA] rounded-full', isCompact ? 'w-1.5 h-1.5' : 'w-2 h-2')}></div>
      </div>
      <span className={cn(
        'text-white font-bold group-hover:text-[#A78BFA] transition-colors duration-200',
        isCompact 
          ? 'text-base md:text-lg' 
          : 'text-xl md:text-2xl'
      )}>
        TheAlley2B
      </span>
    </Link>
  );
}


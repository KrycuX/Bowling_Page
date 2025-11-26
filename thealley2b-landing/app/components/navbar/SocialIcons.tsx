import { Instagram, Facebook } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SocialIconsProps {
  size?: 'normal' | 'compact';
  className?: string;
}

export default function SocialIcons({ size = 'normal', className }: SocialIconsProps) {
  const isCompact = size === 'compact';
  const iconSize = isCompact ? 'w-4 h-4' : 'w-5 h-5';
  const gap = isCompact ? 'gap-2' : 'gap-3';

  return (
    <div className={cn('flex items-center', gap, className)}>
      <a
        href="https://instagram.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/90 hover:text-[#A78BFA] transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] rounded-full p-1"
        aria-label="Instagram"
      >
        <Instagram className={iconSize} />
      </a>
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        className="text-white/90 hover:text-[#A78BFA] transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] rounded-full p-1"
        aria-label="Facebook"
      >
        <Facebook className={iconSize} />
      </a>
    </div>
  );
}


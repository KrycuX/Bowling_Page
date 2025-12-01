import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroSectionProps {
  title: string;
  subtitle?: string;
  description?: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconGradient?: {
    from: string;
    to: string;
  };
  variant?: 'simple' | 'with-icon';
  className?: string;
  animation?: string;
}

export default function HeroSection({
  title,
  subtitle,
  description,
  icon: Icon,
  iconColor,
  iconGradient,
  variant = 'simple',
  className,
  animation,
}: HeroSectionProps) {
  const defaultGradient = {
    from: '#8B5CF6',
    to: '#7C3AED',
  };
  
  const gradient = iconGradient || defaultGradient;

  if (variant === 'with-icon' && Icon) {
    return (
      <section
        className={cn(
          'mb-16 md:mb-24 max-w-5xl mx-auto px-4 md:px-8',
          animation || 'animate-slide-in-up',
          className
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <div className="relative">
            <div
              className="absolute inset-0 rounded-2xl blur-xl opacity-50"
              style={{
                background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`,
              }}
            />
            <div
              className="relative p-6 rounded-2xl"
              style={{
                background: `linear-gradient(to bottom right, ${gradient.from}, ${gradient.to})`,
                boxShadow: `0 25px 50px -12px ${gradient.from}4D`,
              }}
            >
              <Icon className="w-10 h-10 md:w-12 md:h-12 text-white" />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 md:mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {title}
            </h1>
            {(subtitle || description) && (
              <p className="text-xl md:text-2xl text-white/90 font-medium">
                {subtitle || description}
              </p>
            )}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={cn(
        'text-center mb-16 md:mb-24 max-w-5xl mx-auto px-4 md:px-8',
        animation || 'animate-fade-in',
        className
      )}
    >
      <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 md:mb-8">
        {title}
      </h1>
      {subtitle && (
        <p className="text-xl md:text-2xl text-white/90 mb-4 md:mb-6">
          {subtitle}
        </p>
      )}
      {description && (
        <p className={cn(
          'text-lg text-white/80',
          subtitle ? '' : 'text-lg md:text-xl'
        )}>
          {description}
        </p>
      )}
    </section>
  );
}


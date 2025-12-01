'use client';
import { useEffect, useRef } from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { gsap } from '@/lib/gsap-config';

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
  const heroRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const defaultGradient = {
    from: '#8B5CF6',
    to: '#7C3AED',
  };
  
  const gradient = iconGradient || defaultGradient;

  useEffect(() => {
    const tl = gsap.timeline();

    if (variant === 'with-icon' && Icon) {
      // Animacja dla wariantu z ikoną
      if (iconRef.current) {
        tl.from(iconRef.current, {
          opacity: 0,
          scale: 0.8,
          rotation: -10,
          duration: 0.8,
          ease: 'back.out(1.7)',
        });
      }
      if (titleRef.current) {
        tl.from(
          titleRef.current,
          {
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: 'power3.out',
          },
          '-=0.4'
        );
      }
      if (subtitleRef.current) {
        tl.from(
          subtitleRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.5'
        );
      }
    } else {
      // Animacja dla prostego wariantu
      if (titleRef.current) {
        tl.from(titleRef.current, {
          opacity: 0,
          y: 50,
          duration: 0.8,
          ease: 'power3.out',
        });
      }
      if (subtitleRef.current) {
        tl.from(
          subtitleRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.4'
        );
      }
      if (descRef.current) {
        tl.from(
          descRef.current,
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
            ease: 'power2.out',
          },
          '-=0.3'
        );
      }
    }

    return () => {
      tl.kill();
    };
  }, [variant, Icon]);

  if (variant === 'with-icon' && Icon) {
    return (
      <section
        ref={heroRef}
        className={cn(
          'mb-16 md:mb-24 max-w-5xl mx-auto px-4 md:px-8',
          className
        )}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
          <div className="relative" ref={iconRef}>
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
            <h1
              ref={titleRef}
              className="text-5xl md:text-7xl font-bold text-white mb-4 md:mb-6 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
            >
              {title}
            </h1>
            {(subtitle || description) && (
              <p ref={subtitleRef} className="text-xl md:text-2xl text-white/90 font-medium">
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
      ref={heroRef}
      className={cn(
        'text-center mb-16 md:mb-24 max-w-5xl mx-auto px-4 md:px-8',
        className
      )}
    >
      <h1
        ref={titleRef}
        className="text-4xl md:text-6xl font-bold text-white mb-6 md:mb-8"
      >
        {title}
      </h1>
      {subtitle && (
        <p
          ref={subtitleRef}
          className="text-xl md:text-2xl text-white/90 mb-4 md:mb-6"
        >
          {subtitle}
        </p>
      )}
      {description && (
        <p
          ref={descRef}
          className={cn(
            'text-lg text-white/80',
            subtitle ? '' : 'text-lg md:text-xl'
          )}
        >
          {description}
        </p>
      )}
    </section>
  );
}


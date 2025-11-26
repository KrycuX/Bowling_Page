import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';

/**
 * Button variants using Tailwind and CVA - kolory z next-booking
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-[#8B5CF6] focus:ring-offset-2 focus:ring-offset-[#0F0F23] disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] text-white hover:from-[#7C3AED] hover:to-[#2563EB] shadow-lg shadow-[#8B5CF6]/40 hover:shadow-[#8B5CF6]/60',
        secondary: 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED]',
        outline: 'border border-[#2D2D44] bg-[#1A1A2E] text-white hover:bg-[#2D2D44] hover:border-[#3A3A5C]',
        ghost: 'text-white hover:bg-[#2D2D44] hover:text-white',
        link: 'text-[#A78BFA] hover:text-[#8B5CF6] underline-offset-4 hover:underline',
      },
      size: {
        default: 'h-10 px-6 py-2',
        sm: 'h-8 px-4 text-sm',
        lg: 'h-12 px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export type ButtonProps = VariantProps<typeof buttonVariants>;

/**
 * Card variants - kolory z next-booking
 */
export const cardVariants = cva(
  'rounded-2xl border transition-all ring-1 ring-[#8B5CF6]/20 shadow-[0_4px_20px_rgba(139,92,246,0.15)]',
  {
    variants: {
      variant: {
        default: 'bg-[#1A1A2E] border-[#2D2D44] backdrop-blur-sm hover:ring-[#8B5CF6]/30 hover:shadow-[0_4px_20px_rgba(139,92,246,0.25)]',
        hover: 'bg-[#1A1A2E] border-[#2D2D44] backdrop-blur-sm hover:bg-[#2D2D44] hover:border-[#3A3A5C] hover:ring-[#8B5CF6]/30 hover:shadow-[0_4px_20px_rgba(139,92,246,0.25)]',
        gradient: 'bg-gradient-to-br from-[#1A1A2E] to-[#2D2D44] border-[#2D2D44] backdrop-blur-sm hover:ring-[#8B5CF6]/30 hover:shadow-[0_4px_20px_rgba(139,92,246,0.25)]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type CardProps = VariantProps<typeof cardVariants>;


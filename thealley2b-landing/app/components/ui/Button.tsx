import { ButtonHTMLAttributes, forwardRef } from 'react';
import { buttonVariants } from '@/lib/variants';
import { cn } from '@/lib/utils';
import type { ButtonProps as VariantProps } from '@/lib/variants';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export default Button;


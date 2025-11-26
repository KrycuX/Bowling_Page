'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyLoadWrapperProps {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
}

export default function LazyLoadWrapper({ 
  children, 
  className = '',
  rootMargin = '100px'
}: LazyLoadWrapperProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isVisible && children}
    </div>
  );
}





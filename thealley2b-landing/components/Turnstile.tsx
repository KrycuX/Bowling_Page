'use client';

import { useEffect, useRef, useState } from 'react';

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  mode?: 'managed' | 'invisible';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export function Turnstile({
  siteKey,
  onSuccess,
  onError,
  mode = 'managed',
  theme = 'auto',
  className = '',
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey || loaded) return;

    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      setLoaded(true);
    };
    script.onerror = () => {
      console.error('[Turnstile] Failed to load script');
      onError?.();
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src*="turnstile"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      // Reset Turnstile
      if (typeof window !== 'undefined' && (window as any).turnstile) {
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, loaded, onError]);

  useEffect(() => {
    if (!loaded || !containerRef.current || widgetIdRef.current) return;

    const turnstile = (window as any).turnstile;
    if (!turnstile) return;

    try {
      const widgetId = turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => {
          onSuccess(token);
        },
        'error-callback': () => {
          console.error('[Turnstile] Verification failed');
          onError?.();
        },
        theme: theme,
        size: mode === 'invisible' ? 'invisible' : 'normal',
      });

      widgetIdRef.current = widgetId;
    } catch (error) {
      console.error('[Turnstile] Render error:', error);
      onError?.();
    }

    return () => {
      if (widgetIdRef.current && turnstile) {
        try {
          turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('[Turnstile] Remove error:', error);
        }
      }
      widgetIdRef.current = null;
    };
  }, [loaded, siteKey, onSuccess, onError, mode, theme]);

  const reset = () => {
    if (widgetIdRef.current && (window as any).turnstile) {
      (window as any).turnstile.reset(widgetIdRef.current);
    }
  };

  // Expose reset method via ref (if needed)
  if (containerRef.current) {
    (containerRef.current as any).reset = reset;
  }

  return <div ref={containerRef} className={className} />;
}


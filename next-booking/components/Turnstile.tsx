'use client';

import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface TurnstileProps {
  siteKey: string;
  onSuccess: (token: string) => void;
  onError?: () => void;
  mode?: 'managed' | 'invisible';
  theme?: 'light' | 'dark' | 'auto';
  className?: string;
}

export interface TurnstileRef {
  reset: () => void;
}

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback': () => void;
  theme: 'light' | 'dark' | 'auto';
  size: 'invisible' | 'normal';
}

interface TurnstileAPI {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
}

interface WindowWithTurnstile extends Window {
  turnstile?: TurnstileAPI;
}

export const Turnstile = forwardRef<TurnstileRef, TurnstileProps>(({
  siteKey,
  onSuccess,
  onError,
  mode = 'managed',
  theme = 'auto',
  className = '',
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!siteKey) {
      console.error('[Turnstile] Missing siteKey. Check NEXT_PUBLIC_TURNSTILE_SITE_KEY environment variable.');
      return;
    }

    if (loaded) return;

    // Load Turnstile script
    let script = document.querySelector<HTMLScriptElement>('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
    let handleLoad: (() => void) | undefined;
    if (!script) {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        script?.setAttribute('data-turnstile-loaded', 'true');
        setLoaded(true);
      };
      script.onerror = () => {
        console.error('[Turnstile] Failed to load script');
        onError?.();
      };

      document.body.appendChild(script);
      console.log('[Turnstile] Injected Turnstile script tag');
    } else {
      if (script.getAttribute('data-turnstile-loaded') === 'true') {
        setLoaded(true);
      } else {
        handleLoad = () => {
          script?.setAttribute('data-turnstile-loaded', 'true');
          setLoaded(true);
        };
        script.addEventListener('load', handleLoad, { once: true });
      }
      console.log('[Turnstile] Reusing existing Turnstile script tag');
    }

    const scriptElement = script;

    return () => {
      if (handleLoad && scriptElement) {
        scriptElement.removeEventListener('load', handleLoad);
      }
      // Reset Turnstile
      if (typeof window !== 'undefined') {
        const windowWithTurnstile = window as WindowWithTurnstile;
        if (windowWithTurnstile.turnstile) {
          widgetIdRef.current = null;
        }
      }
    };
  }, [siteKey, loaded, onError]);

  useEffect(() => {
    if (!loaded || !containerRef.current || widgetIdRef.current) return;

    const windowWithTurnstile = window as WindowWithTurnstile;
    const turnstile = windowWithTurnstile.turnstile;
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
    if (widgetIdRef.current) {
      const windowWithTurnstile = window as WindowWithTurnstile;
      if (windowWithTurnstile.turnstile) {
        windowWithTurnstile.turnstile.reset(widgetIdRef.current);
      }
    }
  };

  useImperativeHandle(ref, () => ({
    reset,
  }));

  return <div ref={containerRef} className={className} />;
});

Turnstile.displayName = 'Turnstile';


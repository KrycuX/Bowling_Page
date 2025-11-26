'use client';

import { useEffect } from 'react';

interface ConsentPreferences {
  analytics?: boolean;
  marketing?: boolean;
  necessary?: boolean;
  functional?: boolean;
  [key: string]: boolean | undefined;
}

interface CookieYesAPI {
  set: (callback: (consent: ConsentPreferences) => void) => void;
}

type GtagCommand = 'consent' | 'config' | 'event' | 'set' | 'js';
type GtagConsentParams = {
  analytics_storage?: 'granted' | 'denied';
  ad_storage?: 'granted' | 'denied';
  ad_user_data?: 'granted' | 'denied';
  ad_personalization?: 'granted' | 'denied';
  [key: string]: string | undefined;
};

type GtagFunction = (
  command: GtagCommand,
  targetId: string,
  params?: GtagConsentParams | Record<string, unknown>
) => void;

type CookieYesAcceptCallback = (consent: ConsentPreferences) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: GtagFunction;
    CookieYes?: CookieYesAPI;
    cookieyesAccept?: CookieYesAcceptCallback;
  }
}

export function CMPConsentBridge() {
  useEffect(() => {
    // Wait for gtag to be available
    if (typeof window === 'undefined' || !window.gtag) {
      return;
    }

    // Listen for CookieYes consent events
    const handleCookieYesConsent = (consent: ConsentPreferences) => {
      try {
        const analyticsGranted = consent?.analytics === true;
        const marketingGranted = consent?.marketing === true;

        // Map CookieYes consent to Google Consent Mode v2
        window.gtag?.('consent', 'update', {
          analytics_storage: analyticsGranted ? 'granted' : 'denied',
          ad_storage: marketingGranted ? 'granted' : 'denied',
          ad_user_data: marketingGranted ? 'granted' : 'denied',
          ad_personalization: marketingGranted ? 'granted' : 'denied',
        });

        // eslint-disable-next-line no-console
        console.log('[CMPConsentBridge] Consent updated:', {
          analytics: analyticsGranted,
          marketing: marketingGranted,
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[CMPConsentBridge] Error updating consent:', error);
      }
    };

    // Try to set up CookieYes listener
    // CookieYes provides different methods depending on version
    if (window.CookieYes?.set) {
      window.CookieYes.set(handleCookieYesConsent);
    } else {
      // Alternative: listen for CookieYes events via custom events
      const handleCookieYesEvent = (event: CustomEvent) => {
        if (event.detail) {
          handleCookieYesConsent(event.detail);
        }
      };

      window.addEventListener('CookieYes', handleCookieYesEvent as EventListener);

      // Also listen for common CookieYes callback patterns
      const checkCookieYes = () => {
        // CookieYes sometimes sets a global callback
        const cookieYesCallback = window.cookieyesAccept;
        if (cookieYesCallback) {
          window.cookieyesAccept = (consent: ConsentPreferences) => {
            handleCookieYesConsent(consent);
            cookieYesCallback(consent);
          };
        }
      };

      // Check immediately and after a delay
      checkCookieYes();
      setTimeout(checkCookieYes, 1000);
      setTimeout(checkCookieYes, 3000);

      return () => {
        window.removeEventListener('CookieYes', handleCookieYesEvent as EventListener);
      };
    }
  }, []);

  return null;
}


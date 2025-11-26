'use client';

import { useMutation } from '@tanstack/react-query';
import { enqueueSnackbar } from 'notistack';

import { apiClient } from '../lib/apiClient';
import {
  checkoutResponseSchema,
  holdResponseSchema,
  type CheckoutResponse,
  type HoldResponse,
  type PricingMode
} from '../lib/types';

export type PaymentMethod = 'ONLINE' | 'ON_SITE_CASH';

type HoldItemPayload = {
  resourceId: number;
  date: string;
  start: string;
  duration: number;
  peopleCount?: number | null;
  pricingMode: PricingMode;
};

type HoldPayload = {
  items: HoldItemPayload[];
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  couponCode?: string;
  paymentMethod?: PaymentMethod;
  marketingConsent?: boolean;
  turnstileToken?: string;
  getFreshTurnstileToken?: () => Promise<string>;
};

type HoldAndCheckoutResult = {
  hold: HoldResponse;
  checkout?: CheckoutResponse;
};

async function createHold(payload: HoldPayload): Promise<HoldResponse> {
  const { turnstileToken, ...restPayload } = payload;
  const headers: Record<string, string> = {};
  if (turnstileToken) {
    headers['CF-Turnstile-Response'] = turnstileToken;
  }
  const { data } = await apiClient.post('/hold', restPayload, { headers });
  return holdResponseSchema.parse(data);
}

async function checkout(orderId: string, turnstileToken?: string): Promise<CheckoutResponse> {
  const headers: Record<string, string> = {};
  if (turnstileToken) {
    headers['CF-Turnstile-Response'] = turnstileToken;
  }
  const { data } = await apiClient.post('/checkout', { orderId }, { headers });
  return checkoutResponseSchema.parse(data);
}

export function useHoldAndCheckout() {
  return useMutation<HoldAndCheckoutResult, Error, HoldPayload>({
    mutationFn: async (payload) => {
      const hold = await createHold(payload);

      if (!hold.requiresOnlinePayment) {
        return { hold };
      }

      // Get a fresh Turnstile token for checkout since tokens are single-use
      let checkoutToken: string | undefined;
      if (payload.getFreshTurnstileToken) {
        try {
          checkoutToken = await payload.getFreshTurnstileToken();
        } catch (error) {
          console.error('Failed to get fresh Turnstile token for checkout:', error);
          throw new Error('Failed to verify identity for checkout. Please try again.');
        }
      } else {
        // Fallback: if no callback provided, don't send token (may fail if backend requires it)
        checkoutToken = undefined;
      }

      const checkoutResult = await checkout(hold.orderId, checkoutToken);

      return {
        hold,
        checkout: checkoutResult
      };
    },
    onError: (error) => {
      console.error('Reservation failed', error);
      enqueueSnackbar(error.message, { variant: 'error' });
    },
    onSuccess: (result) => {
      if (!result.hold.requiresOnlinePayment) {
        enqueueSnackbar('Rezerwacja potwierdzona. Platnosc na miejscu.', {
          variant: 'success'
        });
        // Przekieruj po udanej rezerwacji z płatnością na miejscu
        if (typeof window !== 'undefined') {
          // Użyj setTimeout, żeby snackbar zdążył się pokazać przed przekierowaniem
          setTimeout(() => {
            window.location.href = `/rezerwacje/powrot?status=success&orderId=${result.hold.orderId}&paymentMethod=ON_SITE_CASH`;
          }, 1500);
        }
        return;
      }

      enqueueSnackbar('Rezerwacja zablokowana. Przechodzimy do platnosci.', {
        variant: 'success'
      });
      if (typeof window !== 'undefined' && result.checkout) {
        // Zapisz sessionId w localStorage przed redirectem
        // To pozwoli sprawdzić status płatności gdy Przelewy24 nie przekazuje parametrów w URL
        localStorage.setItem('p24_sessionId', result.checkout.sessionId);
        localStorage.setItem('p24_orderId', result.checkout.orderId);
        window.location.href = result.checkout.redirectUrl;
      }
    }
  });
}

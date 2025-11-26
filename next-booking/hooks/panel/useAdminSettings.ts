import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/panel/api';

type EffectiveSettings = {
  TIMEZONE: string;
  OPEN_HOUR: number;
  CLOSE_HOUR: number;
  SLOT_INTERVAL_MINUTES: number;
  HOLD_DURATION_MINUTES: number;
  PRICE_BOWLING_PER_HOUR: number;
  PRICE_BILLIARDS_PER_HOUR: number;
  PRICE_KARAOKE_PER_PERSON_PER_HOUR: number;
  PRICE_QUIZ_PER_PERSON_PER_SESSION: number;
  BILLIARDS_TABLES_COUNT: number;
  BOWLING_MIN_DURATION_HOURS: number;
  BOWLING_MAX_DURATION_HOURS: number;
  QUIZ_DURATION_HOURS: number;
  QUIZ_MAX_PEOPLE: number;
  KARAOKE_MIN_DURATION_HOURS: number;
  KARAOKE_MAX_DURATION_HOURS: number;
  KARAOKE_MAX_PEOPLE: number;
  P24_MERCHANT_ID?: string;
  P24_POS_ID?: string;
  P24_CRC?: string;
  P24_API_KEY?: string;
  P24_MODE: 'mock' | 'sandbox' | 'production';
  P24_RETURN_URL: string;
  P24_STATUS_URL: string;
  DEMO_MODE: boolean;
  SENDER_EMAIL?: string;
  SENDER_NAME?: string;
  SMTP_HOST?: string;
  SMTP_PORT?: number | null;
  SMTP_USER?: string;
  SMTP_PASSWORD?: string;
  SMTP_SECURE?: boolean;
  CONTACT_FORM_EMAIL_TEMPLATE?: string | null;
  WEEKLY_HOURS?: {
    monday: { openHour: number; closeHour: number; closed: boolean };
    tuesday: { openHour: number; closeHour: number; closed: boolean };
    wednesday: { openHour: number; closeHour: number; closed: boolean };
    thursday: { openHour: number; closeHour: number; closed: boolean };
    friday: { openHour: number; closeHour: number; closed: boolean };
    saturday: { openHour: number; closeHour: number; closed: boolean };
    sunday: { openHour: number; closeHour: number; closed: boolean };
  } | null;
};

export function useAdminSettings() {
  const queryClient = useQueryClient();

  const fetcher = useCallback(async (): Promise<EffectiveSettings> => {
    const json = await apiFetch<{ settings: EffectiveSettings }>(`/admin/settings`);
    return json.settings as EffectiveSettings;
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetcher
  });

  const mutation = useMutation({
    mutationFn: async (input: Partial<EffectiveSettings>) => {
      return apiFetch(`/admin/settings`, {
        method: 'PUT',
        body: JSON.stringify(input)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    }
  });

  return {
    settings: data,
    loading: isLoading,
    error: error as Error | null,
    update: mutation.mutateAsync
  };
}



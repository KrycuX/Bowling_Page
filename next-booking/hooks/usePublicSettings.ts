import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../lib/apiClient';

type PublicSettings = {
  demoMode: boolean;
  p24Mode: 'mock' | 'sandbox' | 'production';
};

type SettingsResponse = {
  settings: PublicSettings & {
    // Add any other public settings fields here if needed
    timezone: string;
    openHour: number;
    closeHour: number;
    slotIntervalMinutes: number;
    holdDurationMinutes: number;
    priceBowlingPerHour: number;
    priceBilliardsPerHour: number;
    priceKaraokePerPersonPerHour: number;
    priceQuizPerPersonPerSession: number;
    billiardsTablesCount: number;
    bowlingMinDurationHours: number;
    bowlingMaxDurationHours: number;
    quizDurationHours: number;
    quizMaxPeople: number;
    karaokeMinDurationHours: number;
    karaokeMaxDurationHours: number;
    karaokeMaxPeople: number;
    p24MerchantId: string;
    p24PosId: string;
    p24Crc: string;
    p24ApiKey: string;
    p24Mode: string;
    p24ReturnUrl: string;
    p24StatusUrl: string;
  };
};

export function usePublicSettings() {
  return useQuery({
    queryKey: ['public-settings'],
    queryFn: async (): Promise<SettingsResponse['settings']> => {
      const response = await apiFetch<SettingsResponse>('/global-settings');
      return response.settings;
    },
    staleTime: 5 * 60 * 1000, // 5 minut cache
    refetchOnWindowFocus: false
  });
}


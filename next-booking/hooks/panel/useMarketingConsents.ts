import { useMutation, useQuery } from '@tanstack/react-query';
import { 
  fetchMarketingConsents, 
  exportMarketingConsentsCsv
} from '../../lib/panel/marketingConsents';
import type { MarketingConsentsFilters } from '../../lib/panel/marketingConsents';
import { enqueueSnackbar } from 'notistack';

export function useMarketingConsents(filters: MarketingConsentsFilters = {}) {
  return useQuery({
    queryKey: ['admin-marketing-consents', filters],
    queryFn: () => fetchMarketingConsents(filters),
  });
}

export function useMarketingConsentsExport() {
  return useMutation({
    mutationFn: async () => {
      await exportMarketingConsentsCsv();
    },
    onSuccess: () => {
      enqueueSnackbar('Eksport CSV zakończony pomyślnie', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar('Błąd podczas eksportu CSV', { variant: 'error' });
      console.error('Export failed:', error);
    }
  });
}


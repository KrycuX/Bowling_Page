import { apiFetch } from './api';
import { getCsrfToken } from './session';

export type MarketingConsent = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  consentGiven: boolean;
  consentedAt: string;
  source: string;
  orderId: string | null;
  clientIp: string | null;
  userAgent: string | null;
  createdAt: string;
};

export type MarketingConsentsResponse = {
  data: MarketingConsent[];
  meta: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type MarketingConsentsFilters = {
  search?: string;
  page?: number;
  pageSize?: number;
};

export async function fetchMarketingConsents(filters: MarketingConsentsFilters = {}): Promise<MarketingConsentsResponse> {
  const params = new URLSearchParams();
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.pageSize) {
    params.append('pageSize', filters.pageSize.toString());
  }
  
  const queryString = params.toString();
  const url = `/admin/marketing-consents${queryString ? `?${queryString}` : ''}`;
  
  const data = await apiFetch<MarketingConsentsResponse>(url);
  return data;
}

export async function exportMarketingConsentsCsv(): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'https://api.thealley2b.pl'}/admin/marketing-consents/export`, {
    credentials: 'include',
    headers: {
      'X-CSRF-Token': getCsrfToken() || '',
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to export CSV');
  }
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  a.href = url;
  a.download = `zgody-marketingowe-${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}


import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '../../lib/panel/api';

export type ContactSubmission = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  rodoConsent: boolean;
  marketingConsent: boolean;
  clientIp: string;
  userAgent: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactSubmissionListQuery = {
  page?: number;
  pageSize?: number;
  email?: string;
};

export type ContactSubmissionListResult = {
  data: ContactSubmission[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
};

export function useContactSubmissions(query?: ContactSubmissionListQuery) {
  const params = new URLSearchParams();
  if (query?.page) params.set('page', query.page.toString());
  if (query?.pageSize) params.set('pageSize', query.pageSize.toString());
  if (query?.email) params.set('email', query.email);

  return useQuery({
    queryKey: ['admin-contact-submissions', query],
    queryFn: async () => {
      const url = `/admin/contact/submissions${params.toString() ? `?${params.toString()}` : ''}`;
      return apiFetch<ContactSubmissionListResult>(url);
    },
  });
}

export function useContactSubmission(id: number) {
  return useQuery({
    queryKey: ['admin-contact-submission', id],
    queryFn: async () => {
      return apiFetch<ContactSubmission>(`/admin/contact/submissions/${id}`);
    },
    enabled: !!id,
  });
}


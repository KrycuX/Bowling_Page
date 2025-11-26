import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/panel/api';

export type Coupon = {
  id: number;
  code: string;
  type: 'PERCENT' | 'FIXED';
  value: number;
  validFrom: string | null;
  validTo: string | null;
  appliesToAll: boolean;
  isActive: boolean;
  minTotal: number | null;
  maxUsesTotal: number | null;
  usePerEmail: boolean;
  showOnLandingPage: boolean;
  createdAt: string;
  updatedAt: string;
  allowedTypes: Array<{
    id: number;
    couponId: number;
    resourceType: string;
  }>;
};

export function useCoupons() {
  return useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const data = await apiFetch<Coupon[]>('/admin/coupons');
      return data;
    }
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { code: string; type: string; value: number; appliesToAll: boolean; usePerEmail: boolean; minTotal?: number | null; showOnLandingPage?: boolean }) => {
      const data = await apiFetch<Coupon>('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] })
  });
}

export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: number; code: string; type: string; value: number; appliesToAll: boolean; usePerEmail: boolean; minTotal?: number | null; showOnLandingPage?: boolean }) => {
      const data = await apiFetch<Coupon>(`/admin/coupons/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] })
  });
}

export function useImportAssignments() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, csv }: { id: number; csv: string }) => {
      const data = await apiFetch(`/admin/coupons/${id}/assignments/import`, {
        method: 'POST',
        body: JSON.stringify({ csv })
      });
      return data as { created: number };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] })
  });
}

export type CouponAssignment = {
  id: number;
  email: string;
  usedAt: string | null;
  createdAt: string;
};

export function useCouponAssignments(couponId: number) {
  return useQuery({
    queryKey: ['admin-coupon-assignments', couponId],
    queryFn: async () => {
      const data = await apiFetch<CouponAssignment[]>(`/admin/coupons/${couponId}/assignments`);
      return data;
    },
    enabled: !!couponId
  });
}

export function useDeleteAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ couponId, assignmentId }: { couponId: number; assignmentId: number }) => {
      const data = await apiFetch(`/admin/coupons/${couponId}/assignments/${assignmentId}`, {
        method: 'DELETE'
      });
      return data as { success: boolean };
    },
    onSuccess: (_, { couponId }) => {
      qc.invalidateQueries({ queryKey: ['admin-coupon-assignments', couponId] });
    }
  });
}



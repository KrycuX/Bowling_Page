import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '../../lib/panel/api';

type DayOff = {
  id: number;
  date: string;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
};

export function useDayOffs() {
  const queryClient = useQueryClient();

  const fetcher = useCallback(async (): Promise<DayOff[]> => {
    const json = await apiFetch<{ dayOffs: DayOff[] }>(`/admin/day-off`);
    return json.dayOffs;
  }, []);

  const { data, isLoading, error } = useQuery({
    queryKey: ['day-offs'],
    queryFn: fetcher
  });

  const createMutation = useMutation({
    mutationFn: async (input: { date: string; reason?: string | null }) => {
      return apiFetch(`/admin/day-off`, {
        method: 'POST',
        body: JSON.stringify(input)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day-offs'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (date: string) => {
      return apiFetch(`/admin/day-off/${date}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['day-offs'] });
    }
  });

  return {
    dayOffs: data || [],
    loading: isLoading,
    error: error as Error | null,
    create: createMutation.mutateAsync,
    delete: deleteMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useSnackbar } from 'notistack';

import { ConfirmDialog } from '../../../components/panel/ConfirmDialog';
import { FiltersBar, type FiltersState } from '../../../components/panel/FiltersBar';
import { OrdersTable } from '../../../components/panel/OrdersTable';
import { useCancelOrder } from '../../../hooks/panel/useOrderMutations';
import { useOrdersQuery, type OrdersFilters } from '../../../hooks/panel/useOrdersQuery';

// Map quick filter to API parameters
function mapQuickFilterToParams(quickFilter?: string): Partial<OrdersFilters> {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  
  switch (quickFilter) {
    case 'created_today':
      return { dateFrom: today, dateTo: today };
    case 'slot_today':
      return { slotDateFrom: today, slotDateTo: today };
    case 'slot_tomorrow':
      return { slotDateFrom: tomorrow, slotDateTo: tomorrow };
    default:
      return {};
  }
}

export default function OrdersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { enqueueSnackbar } = useSnackbar();

  // Initialize filters from URL params
  const initialFilters = useMemo<FiltersState>(() => {
    const status = searchParams.get('status') || undefined;
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const resourceType = searchParams.get('resourceType') || undefined;
    const q = searchParams.get('q') || '';
    
    // Check if dateFrom and dateTo match today (for "created_today" quick filter)
    const today = new Date().toISOString().slice(0, 10);
    const quickFilter = dateFrom === today && dateTo === today ? 'created_today' : undefined;

    return {
      quickFilter,
      dateFrom,
      dateTo,
      status: status as FiltersState['status'],
      resourceType: resourceType as FiltersState['resourceType'],
      q,
    };
  }, [searchParams]);

  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [cancelTarget, setCancelTarget] = useState<string | null>(null);

  // Update filters when URL params change
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const cancelOrderMutation = useCancelOrder(cancelTarget ?? '');

  // Map filters to API parameters, handling quickFilter
  // If quickFilter is active, use its params and ignore manual date filters
  const quickFilterParams = filters.quickFilter ? mapQuickFilterToParams(filters.quickFilter) : {};
  
  const apiFilters: OrdersFilters = {
    ...filters,
    // When quickFilter is active, override date filters with quickFilter params
    ...(filters.quickFilter ? {
      ...quickFilterParams,
      // Clear opposite date filters when quickFilter is active
      ...(filters.quickFilter === 'created_today' 
        ? { slotDateFrom: undefined, slotDateTo: undefined }
        : { dateFrom: undefined, dateTo: undefined }),
    } : {}),
    pageSize: 50,
  };

  const { data, isLoading } = useOrdersQuery(apiFilters);

  return (
    <Stack spacing={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Rezerwacje</Typography>
        <Button variant="contained" component={Link} href="/panel/rezerwacje/nowa">
          Nowa rezerwacja
        </Button>
      </Stack>

      <FiltersBar
        filters={filters}
        onChange={(next) => {
          // If quickFilter is set, clear manual date filters
          if (next.quickFilter) {
            setFilters((prev) => ({
              ...prev,
              ...next,
              dateFrom: '',
              dateTo: '',
            }));
          } else {
            setFilters((prev) => ({ ...prev, ...next }));
          }
        }}
        onReset={() =>
          setFilters({
            quickFilter: undefined,
            dateFrom: '',
            dateTo: '',
            status: undefined,
            resourceType: undefined,
            q: '',
          })
        }
      />

      <OrdersTable
        orders={data?.data ?? []}
        loading={isLoading}
        onSelect={(orderId) => router.push(`/panel/rezerwacje/${orderId}`)}
        onCancel={(orderId) => setCancelTarget(orderId)}
      />

      <ConfirmDialog
        open={Boolean(cancelTarget)}
        title="Anulowac rezerwacje?"
        description="Anulowana rezerwacja zostanie natychmiast zwolniona."
        confirmText="Anuluj rezerwacje"
        onCancel={() => {
          if (!cancelOrderMutation.isPending) {
            setCancelTarget(null);
          }
        }}
        onConfirm={() => {
          if (!cancelTarget || cancelOrderMutation.isPending) {
            return;
          }
          cancelOrderMutation.mutate(
            { reason: 'Anulowane z listy rezerwacji' },
            {
              onSuccess: () => {
                enqueueSnackbar('Rezerwacja anulowana', { variant: 'success' });
                setCancelTarget(null);
              },
              onError: () => {
                enqueueSnackbar('Nie udalo sie anulowac rezerwacji', { variant: 'error' });
              }
            }
          );
        }}
      />
    </Stack>
  );
}






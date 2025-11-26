'use client';

import { useMemo } from 'react';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import type { PaymentMethod } from '../../lib/types';

export const ORDER_STATUSES = ['HOLD', 'PENDING_PAYMENT', 'PENDING_ONSITE', 'PAID', 'EXPIRED', 'CANCELLED'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const statusColor: Record<OrderStatus, 'default' | 'success' | 'warning' | 'error'> = {
  HOLD: 'warning',
  PENDING_PAYMENT: 'warning',
  PENDING_ONSITE: 'warning',
  PAID: 'success',
  EXPIRED: 'default',
  CANCELLED: 'error'
};

const paymentMethodLabel: Record<PaymentMethod, string> = {
  ONLINE: 'Online',
  ON_SITE_CASH: 'Gotówka',
  ON_SITE_CARD: 'Karta'
};

type OrderRow = {
  id: string;
  orderNumber?: string | null;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  startTime?: string;
  resourceTypes?: string;
};

type ApiReservedSlot = { startTime: string };

type ApiOrder = {
  id: string;
  orderNumber?: string | null;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  reservedSlots?: ApiReservedSlot[];
  items?: Array<{
    resource: {
      type: string;
    };
  }>;
};

type Props = {
  orders: ApiOrder[];
  loading: boolean;
  onSelect?: (orderId: string) => void;
  onCancel?: (orderId: string) => void;
};

export function OrdersTable({ orders, loading, onSelect, onCancel }: Props) {
  const rows: OrderRow[] = orders.map((order) => {
    const sortedSlots = [...(order.reservedSlots ?? [])].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    // Extract unique resource types
    const resourceTypes = order.items?.map(item => {
      switch (item.resource.type) {
        case 'BOWLING_LANE': return 'Kręgle';
        case 'BILLIARDS_TABLE': return 'Bilard';
        case 'QUIZ_ROOM': return 'Quiz';
        case 'KARAOKE_ROOM': return 'Karaoke';
        default: return item.resource.type;
      }
    }) || [];
    
    const uniqueTypes = Array.from(new Set(resourceTypes)).join(', ');

    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      status: order.status,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      startTime: sortedSlots[0]?.startTime,
      resourceTypes: uniqueTypes
    };
  });

  const columns: GridColDef<OrderRow>[] = useMemo(
    () => [
      { 
        field: 'orderNumber', 
        headerName: 'Numer zamówienia', 
        type: 'string',
        flex: 1, 
        minWidth: 150,
        valueGetter: (params) => params.row.orderNumber || params.row.id,
        renderCell: (params) => params.value || params.row.id
      },
      { field: 'customerName', headerName: 'Klient', flex: 1, minWidth: 160 },
      { field: 'customerEmail', headerName: 'Email', flex: 1, minWidth: 200 },
      { field: 'resourceTypes', headerName: 'Typ zasobu', flex: 0.8, minWidth: 120 },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.6,
        renderCell: (params: GridRenderCellParams<OrderRow, OrderRow['status']>) => (
          <Chip label={params.value} color={statusColor[params.value!]} size="small" />
        )
      },
      {
        field: 'paymentMethod',
        headerName: 'Płatność',
        flex: 0.6,
        valueFormatter: (params) =>
          paymentMethodLabel[(params.value as PaymentMethod) ?? 'ONLINE']
      },
      {
        field: 'startTime',
        headerName: 'Start',
        flex: 0.8,
        valueFormatter: (params) =>
          params.value ? new Date(params.value as string).toLocaleString() : '-'
      },
      {
        field: 'totalAmount',
        headerName: 'Kwota',
        flex: 0.6,
        valueFormatter: (params) => `${((params.value as number) / 100).toFixed(2)} PLN`
      },
      {
        field: 'actions',
        headerName: 'Akcje',
        flex: 1,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Button size="small" variant="outlined" onClick={() => onSelect?.(params.row.id)}>
              Szczegoly
            </Button>
            <Button
              size="small"
              color="error"
              variant="text"
              onClick={() => onCancel?.(params.row.id)}
              disabled={
                !onCancel ||
                params.row.status === 'CANCELLED' ||
                params.row.status === 'EXPIRED'
              }
            >
              Anuluj
            </Button>
          </Stack>
        )
      }
    ],
    [onSelect, onCancel]
  );

  return (
    <Box sx={{ height: 520, width: '100%', overflow: 'auto' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        loading={loading}
        disableRowSelectionOnClick
        pageSizeOptions={[10, 20, 50]}
        initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
        sx={{
          '& .MuiDataGrid-root': {
            border: 'none',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #f0f0f0',
          },
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#1e1e2e',
            borderBottom: '2px solid #3b3b5c',
            '& .MuiDataGrid-columnHeaderTitle': {
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '0.875rem',
            },
            '& .MuiDataGrid-columnHeaderTitleContainer': {
              color: '#ffffff',
            },
            '& .MuiDataGrid-sortIcon': {
              color: '#ffffff',
            },
            '& .MuiDataGrid-filterIcon': {
              color: '#ffffff',
            },
          },
          '& .MuiDataGrid-columnHeader': {
            '&:hover': {
              backgroundColor: '#2a2a3e',
            },
            '&.MuiDataGrid-columnHeader--sorted': {
              backgroundColor: '#2a2a3e',
            },
          },
        }}
      />
    </Box>
  );
}

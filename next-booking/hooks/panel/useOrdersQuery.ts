"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { apiFetch } from "../../lib/panel/api";
import type { PaymentMethod } from "../../lib/types";

export const ORDER_STATUSES = [
  "HOLD",
  "PENDING_PAYMENT",
  "PENDING_ONSITE",
  "PAID",
  "EXPIRED",
  "CANCELLED"
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrdersFilters = {
  dateFrom?: string;
  dateTo?: string;
  slotDateFrom?: string;
  slotDateTo?: string;
  resourceId?: number;
  resourceType?: string;
  status?: OrderStatus;
  q?: string;
  page?: number;
  pageSize?: number;
};

export type OrderListItem = {
  id: string;
  orderNumber?: string | null;
  customerName: string;
  customerEmail: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  reservedSlots?: { startTime: string }[];
  items?: {
    id: number;
    resourceId: number;
    resource: {
      id: number;
      name: string;
      type: 'BOWLING_LANE' | 'BILLIARDS_TABLE' | 'QUIZ_ROOM' | 'KARAOKE_ROOM';
    };
    description: string;
  }[];
};

export type PageMeta = {
  page: number;
  pageSize: number;
  total: number;
};

export type OrdersResponse = {
  data: OrderListItem[];
  meta: PageMeta;
};

export function useOrdersQuery(filters: OrdersFilters) {
  return useQuery<OrdersResponse>({
    queryKey: ["admin", "orders", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      (Object.entries(filters) as [keyof OrdersFilters, OrdersFilters[keyof OrdersFilters]][]).forEach(
        ([key, value]) => {
          if (value !== undefined && value !== null && value !== "") {
            params.set(String(key), String(value));
          }
        }
      );
      const query = params.toString();
      const path = query ? `/admin/orders?${query}` : "/admin/orders";
      return apiFetch<OrdersResponse>(path);
    },
    placeholderData: keepPreviousData
  });
}

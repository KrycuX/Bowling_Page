
"use client";

import { useQuery } from "@tanstack/react-query";

import { apiFetch } from "../../lib/panel/api";
import type { OrderRow, PricingMode } from "../../lib/types";

export const ORDER_STATUSES = [
  "HOLD",
  "PENDING_PAYMENT",
  "PENDING_ONSITE",
  "PAID",
  "EXPIRED",
  "CANCELLED"
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export type OrderDetails = OrderRow & {
  reservedSlots: { resourceId: number; startTime: string; endTime: string }[];
  items: {
    id: number;
    resourceId: number;
    peopleCount?: number | null;
    pricingMode: PricingMode;
    quantity: number;
    unitAmount: number;
    totalAmount: number;
    description?: string | null;
    resource: {
      id: number;
      name: string;
      type: 'BOWLING_LANE' | 'BILLIARDS_TABLE' | 'QUIZ_ROOM' | 'KARAOKE_ROOM';
    };
  }[];
};

export function useOrderDetails(orderId: string) {
  return useQuery<OrderDetails>({
    queryKey: ["admin", "orders", orderId],
    queryFn: async () => apiFetch<OrderDetails>(`/admin/orders/${orderId}`),
    enabled: Boolean(orderId)
  });
}

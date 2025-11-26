import { z } from 'zod';

export const availabilitySlotSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  status: z.enum(['AVAILABLE', 'HOLD', 'BOOKED'])
});

export const resourceTypeSchema = z.enum([
  'BOWLING_LANE',
  'BILLIARDS_TABLE',
  'QUIZ_ROOM',
  'KARAOKE_ROOM'
]);
export const pricingModeSchema = z.enum([
  'PER_RESOURCE_PER_HOUR',
  'PER_PERSON_PER_HOUR',
  'PER_PERSON_PER_SESSION'
]);

export const paymentMethodSchema = z.enum(['ONLINE', 'ON_SITE_CASH', 'ON_SITE_CARD']);

export const orderStatusSchema = z.enum([
  'HOLD',
  'PENDING_PAYMENT',
  'PENDING_ONSITE',
  'PAID',
  'EXPIRED',
  'CANCELLED'
]);

export const resourceSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: resourceTypeSchema,
  pricePerHour: z.number().nullable(),
  priceFlat: z.number().nullable(),
  slots: z.array(availabilitySlotSchema)
});

const availabilityFiltersSchema = z
  .object({
    resourceType: resourceTypeSchema.optional(),
    resourceId: z.number().optional()
  })
  .partial();

export const availabilityResponseSchema = z.object({
  date: z.string(),
  timezone: z.string(),
  openHour: z.number(),
  closeHour: z.number(),
  slotIntervalMinutes: z.number(),
  resources: z.array(resourceSchema),
  groupedByType: z.object({
    bowlingLanes: z.array(resourceSchema),
    billiardsTables: z.array(resourceSchema),
    quizRooms: z.array(resourceSchema),
    karaokeRooms: z.array(resourceSchema)
  }),
  filters: availabilityFiltersSchema.optional()
});

export const reservedSlotSchema = z.object({
  id: z.number(),
  resourceId: z.number(),
  startTime: z.string(),
  endTime: z.string(),
  status: z.string(),
  expiresAt: z.string().nullable().optional()
});

export const holdResponseSchema = z.object({
  orderId: z.string(),
  holdExpiresAt: z.string(),
  totalAmount: z.number(),
  currency: z.string(),
  reservedSlots: z.array(reservedSlotSchema),
  requiresOnlinePayment: z.boolean(),
  status: orderStatusSchema,
  paymentMethod: paymentMethodSchema
});

export const checkoutResponseSchema = z.object({
  orderId: z.string(),
  redirectUrl: z.string().url(),
  sessionId: z.string()
});

export const dayScheduleBookingSchema = z.object({
  from: z.string(),
  to: z.string(),
  status: z.enum(['BOOKED', 'HOLD']),
  peopleCount: z.number().nullable(),
  orderId: z.string().nullable()
});

export const dayScheduleResourceSchema = z.object({
  resourceId: z.number(),
  resourceName: z.string(),
  bookings: z.array(dayScheduleBookingSchema)
});

export const dayScheduleSchema = z.object({
  date: z.string(),
  openHour: z.number(),
  closeHour: z.number(),
  resources: z.array(dayScheduleResourceSchema)
});

export type AvailabilityResponse = z.infer<typeof availabilityResponseSchema>;
export type Resource = z.infer<typeof resourceSchema>;
export type AvailabilitySlot = z.infer<typeof availabilitySlotSchema>;
export type HoldResponse = z.infer<typeof holdResponseSchema>;
export type CheckoutResponse = z.infer<typeof checkoutResponseSchema>;
export type DaySchedule = z.infer<typeof dayScheduleSchema>;
export type DayScheduleResource = z.infer<typeof dayScheduleResourceSchema>;
export type DayScheduleBooking = z.infer<typeof dayScheduleBookingSchema>;
export type ResourceType = z.infer<typeof resourceTypeSchema>;
export type PricingMode = z.infer<typeof pricingModeSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type ReservedSlot = z.infer<typeof reservedSlotSchema>;
export type UserRole = 'EMPLOYEE' | 'ADMIN';

export interface UserRow {
  id: number;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string; // ISO
  lastLoginAt?: string | null;
}
export interface OrderRow {
  id: string;
  orderNumber?: string | null;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  customerName: string;
  customerEmail: string;
  customerPhone?: string | null;
  totalAmount: number;
  currency: string; // "PLN"
  createdAt: string; // ISO
  paidAt?: string | null;
}

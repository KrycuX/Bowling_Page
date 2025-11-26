import { z } from 'zod';

// Typy enum
export type OrderStatus = 'HOLD' | 'PENDING_PAYMENT' | 'PENDING_ONSITE' | 'PAID' | 'EXPIRED' | 'CANCELLED';
export type PricingMode = 'PER_RESOURCE_PER_HOUR' | 'PER_PERSON_PER_HOUR' | 'PER_PERSON_PER_SESSION';
export type ResourceType = 'BOWLING_LANE' | 'QUIZ_ROOM' | 'KARAOKE_ROOM' | 'BILLIARDS_TABLE';

const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
const pricingModeSchema = z.enum(['PER_RESOURCE_PER_HOUR', 'PER_PERSON_PER_HOUR', 'PER_PERSON_PER_SESSION']);
// Default values for static schema (will be overridden by dynamic validation in services)
const maxDuration = parseInt(process.env.KARAOKE_MAX_DURATION_HOURS || '4', 10);
const maxPeople = Math.max(
  parseInt(process.env.KARAOKE_MAX_PEOPLE || '10', 10),
  parseInt(process.env.QUIZ_MAX_PEOPLE || '8', 10)
);

export const orderListQuerySchema = z.object({
  dateFrom: z.string().regex(isoDateRegex, 'Invalid date').optional(),
  dateTo: z.string().regex(isoDateRegex, 'Invalid date').optional(),
  slotDateFrom: z.string().regex(isoDateRegex, 'Invalid date').optional(),
  slotDateTo: z.string().regex(isoDateRegex, 'Invalid date').optional(),
  resourceId: z.coerce.number().int().positive().optional(),
  resourceType: z.enum(['BOWLING_LANE', 'QUIZ_ROOM', 'KARAOKE_ROOM', 'BILLIARDS_TABLE']).optional(),
  status: z.enum(['HOLD', 'PENDING_PAYMENT', 'PENDING_ONSITE', 'PAID', 'EXPIRED', 'CANCELLED']).optional(),
  q: z.string().max(255).optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(100).optional()
});

const orderItemSchema = z.object({
  resourceId: z.coerce.number().int().positive(),
  date: z.string().regex(isoDateRegex, 'Invalid date'),
  start: z.string().regex(timeRegex, 'Invalid time'),
  duration: z.coerce.number().int().min(1).max(maxDuration),
  peopleCount: z.coerce.number().int().min(1).max(maxPeople).nullable().optional(),
  pricingMode: pricingModeSchema
});

const customerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  phone: z.string().optional()
});

export const createOrderSchema = z.object({
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1),
  payment: z.object({
    method: z.enum(['ON_SITE_CASH', 'ON_SITE_CARD'])
  })
});

export const updateOrderSchema = z
  .object({
    customer: customerSchema.partial().optional(),
    items: z.array(orderItemSchema).min(1).optional()
  })
  .refine((data) => data.customer || data.items, {
    message: 'Provide customer data or items to update',
    path: ['customer']
  });

export const cancelOrderSchema = z.object({
  reason: z.string().max(500).optional()
});

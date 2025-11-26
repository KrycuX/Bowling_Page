import { z } from 'zod';

// Default values for static schema (will be overridden by dynamic validation in services)
const minuteStep = parseInt(process.env.SLOT_INTERVAL_MINUTES || '60', 10);
const pricingModeSchema = z.enum([
  'PER_RESOURCE_PER_HOUR',
  'PER_PERSON_PER_HOUR',
  'PER_PERSON_PER_SESSION'
]);
const paymentMethodSchema = z.enum(['ONLINE', 'ON_SITE_CASH']);
const maxPeople = Math.max(
  parseInt(process.env.KARAOKE_MAX_PEOPLE || '10', 10),
  parseInt(process.env.QUIZ_MAX_PEOPLE || '8', 10)
);

const reservationItemSchema = z.object({
  resourceId: z.coerce.number().int().positive(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD'),
  start: z
    .string()
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must be in format HH:mm')
    .refine((value) => {
      const minutes = Number.parseInt(value.split(':')[1] ?? '0', 10);
      return !Number.isNaN(minutes) && minutes % minuteStep === 0;
    }, `Start time must align with ${minuteStep}-minute increments`),
  duration: z.coerce.number().int().min(1).max(parseInt(process.env.KARAOKE_MAX_DURATION_HOURS || '4', 10)),
  peopleCount: z.coerce.number().int().min(1).max(maxPeople).optional(),
  pricingMode: pricingModeSchema
});

export const holdBodySchema = z.object({
  items: z
    .array(reservationItemSchema)
    .min(1, 'Select at least one resource')
    .max(8, 'Too many reservation items'),
  customer: z.object({
    email: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    phone: z.string().optional()
  }),
  couponCode: z.string().trim().min(1).optional(),
  paymentMethod: paymentMethodSchema.optional()
});

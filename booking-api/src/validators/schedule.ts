import { z } from 'zod';

// Typy enum
export type ResourceType = 'BOWLING_LANE' | 'QUIZ_ROOM' | 'KARAOKE_ROOM' | 'BILLIARDS_TABLE';

const resourceTypeParamValues = [
  'BOWLING_LANE',
  'BILLIARDS_TABLE',
  'QUIZ_ROOM',
  'KARAOKE_ROOM',
  'bowling_lane',
  'billiards_table',
  'quiz_room',
  'karaoke_room'
] as const;

const resourceTypeParamSchema = z
  .enum(resourceTypeParamValues)
  .transform<ResourceType>((value) => {
    if (
      value === 'bowling_lane' ||
      value === 'billiards_table' ||
      value === 'quiz_room' ||
      value === 'karaoke_room'
    ) {
      return value.toUpperCase() as ResourceType;
    }
    return value as ResourceType;
  });

export const dayScheduleQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  resourceType: resourceTypeParamSchema.optional(),
  resourceId: z.coerce.number().int().positive().optional()
});

export const scheduleBookingSchema = z.object({
  from: z.string().regex(/^\d{2}:\d{2}$/),
  to: z.string().regex(/^\d{2}:\d{2}$/),
  status: z.enum(['BOOKED', 'HOLD']),
  peopleCount: z.number().int().nullable(),
  orderId: z.string().nullable()
});

export const scheduleResourceSchema = z.object({
  resourceId: z.number().int(),
  resourceName: z.string(),
  bookings: z.array(scheduleBookingSchema)
});

export const dayScheduleResponseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  openHour: z.number().int(),
  closeHour: z.number().int(),
  resources: z.array(scheduleResourceSchema)
});

export type DayScheduleQuery = z.infer<typeof dayScheduleQuerySchema>;
export type DayScheduleResponse = z.infer<typeof dayScheduleResponseSchema>;

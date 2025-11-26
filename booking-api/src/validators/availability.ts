import { z } from 'zod';

const resourceTypeSchema = z.enum(['BOWLING_LANE', 'BILLIARDS_TABLE', 'QUIZ_ROOM', 'KARAOKE_ROOM']);

export const availabilityQuerySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in format YYYY-MM-DD'),
  resourceType: resourceTypeSchema.optional(),
  resourceId: z.coerce.number().int().positive().optional()
});

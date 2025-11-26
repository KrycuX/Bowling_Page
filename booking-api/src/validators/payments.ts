import { z } from 'zod';

export const p24WebhookSchema = z.object({
  merchantId: z.coerce.number().int(),
  posId: z.coerce.number().int(),
  sessionId: z.string().min(1),
  orderId: z.coerce.number().int(),
  amount: z.coerce.number().int(),
  currency: z.string().min(1),
  sign: z.string().min(1)
});

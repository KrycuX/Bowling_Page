import { z } from 'zod';

export const checkoutBodySchema = z.object({
  orderId: z.string().min(1)
});

import { z } from 'zod';

// Typy enum
export type UserRole = 'EMPLOYEE' | 'ADMIN';

export const createUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(['EMPLOYEE', 'ADMIN']),
  isActive: z.boolean().optional()
});

export const updateUserSchema = z
  .object({
    role: z.enum(['EMPLOYEE', 'ADMIN']).optional(),
    isActive: z.boolean().optional(),
    resetPassword: z.boolean().optional()
  })
  .refine((data) => data.role !== undefined || data.isActive !== undefined || data.resetPassword, {
    message: 'Provide at least one field to update'
  });

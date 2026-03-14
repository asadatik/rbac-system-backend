
import { z } from 'zod';

// Login validation
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// Create user validation
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'manager', 'agent', 'customer']),
  permissions: z.array(z.string()).optional(),
});

// Update user validation
export const updateUserSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  role: z.enum(['admin', 'manager', 'agent', 'customer']).optional(),
  permissions: z.array(z.string()).optional(),
});

// Update permissions validation
export const updatePermissionsSchema = z.object({
  permissions: z.array(z.string()).min(1, 'At least one permission required'),
});

//
export class ValidationError extends Error {
  public issues: z.ZodIssue[];

  constructor(error: z.ZodError) {
    super('Validation failed');
    this.name = 'ValidationError';
    this.issues = error.issues; 
  }
}
//

export function validateRequest<T>(schema: z.ZodSchema, data: unknown): T {
  const result = schema.safeParse(data);

  if (!result.success) {
    throw new ValidationError(result.error);
  }

  return result.data as T;
}
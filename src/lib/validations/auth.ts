import { z } from 'zod';

export const userRoleSchema = z.enum([
  'SUPER_ADMIN',
  'ADMIN',
  'HR',
  'MANAGER',
  'MEETING_ORGANIZER',
  'EMPLOYEE',
]);

export const userStatusSchema = z.enum([
  'ACTIVE',
  'INVITED',
  'SUSPENDED',
  'DEACTIVATED',
]);

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid enterprise email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please provide a valid enterprise email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  department: z.string().optional().default('Engineering'),
  title: z.string().optional().default('Team Member'),
});

export const inviteUserSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: userRoleSchema.default('EMPLOYEE'),
  department: z.string().min(1, 'Department is required'),
  title: z.string().min(1, 'Title is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  department: z.string().optional(),
  title: z.string().optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  projects: z.array(z.string()).optional(),
  topicsOfInterest: z.array(z.string()).optional(),
  peopleOfInterest: z.array(z.string()).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

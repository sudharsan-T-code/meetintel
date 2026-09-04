import { z } from 'zod';

export const planTierSchema = z.enum(['STARTER', 'PROFESSIONAL', 'ENTERPRISE']);

export const compensationBandSchema = z.object({
  role: z.string().min(1, 'Role name is required'),
  estimatedHourlyCostINR: z.number().positive('Hourly cost must be greater than 0'),
  currency: z.string().default('INR'),
});

export const organizationSettingsSchema = z.object({
  name: z.string().min(2, 'Organization name must be at least 2 characters').optional(),
  transcriptRetentionDays: z.number().int().min(1).max(3650).default(90),
  recordingRetentionDays: z.number().int().min(1).max(3650).default(30),
  aiProcessingEnabled: z.boolean().default(true),
  meetingConsentRequired: z.boolean().default(true),
  externalSharingEnabled: z.boolean().default(false),
  allowedExportFormats: z.array(z.enum(['pdf', 'markdown', 'csv', 'json'])).default(['pdf', 'markdown', 'csv', 'json']),
  compensationBands: z.array(compensationBandSchema).optional(),
});

export const createOrganizationSchema = z.object({
  name: z.string().min(2, 'Organization name is required'),
  domain: z.string().optional(),
  plan: planTierSchema.default('ENTERPRISE'),
});

export type CompensationBandInput = z.infer<typeof compensationBandSchema>;
export type OrganizationSettingsInput = z.infer<typeof organizationSettingsSchema>;
export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

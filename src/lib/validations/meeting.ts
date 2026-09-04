import { z } from 'zod';

export const meetingStatusSchema = z.enum([
  'DRAFT',
  'SCHEDULED',
  'UPLOADING',
  'UPLOADED',
  'EXTRACTING_AUDIO',
  'TRANSCRIBING',
  'DIARIZING',
  'ANALYZING',
  'GENERATING_INSIGHTS',
  'COMPLETED',
  'FAILED',
]);

export const meetingSourceSchema = z.enum([
  'UPLOAD',
  'GOOGLE_MEET',
  'ZOOM',
  'TEAMS',
]);

export const confidenceLevelSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

export const createMeetingSchema = z.object({
  title: z.string().min(2, 'Meeting title is required'),
  description: z.string().optional(),
  scheduledAt: z.string().datetime().or(z.date()).transform((val) => new Date(val)),
  durationSeconds: z.number().int().nonnegative().default(0),
  participantCount: z.number().int().positive().default(1),
  source: meetingSourceSchema.default('UPLOAD'),
  recordingUrl: z.string().url().optional(),
  tags: z.array(z.string()).default([]),
});

export const meetingFilterSchema = z.object({
  search: z.string().optional(),
  status: meetingStatusSchema.optional(),
  source: meetingSourceSchema.optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  tag: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(20),
});

export const updateMeetingStatusSchema = z.object({
  status: meetingStatusSchema,
  processedAt: z.string().datetime().optional(),
});

export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type MeetingFilterInput = z.infer<typeof meetingFilterSchema>;
export type UpdateMeetingStatusInput = z.infer<typeof updateMeetingStatusSchema>;

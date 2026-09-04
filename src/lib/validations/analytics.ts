import { z } from 'zod';

export const timeRangeSchema = z.enum([
  'today',
  '7d',
  '30d',
  '90d',
  '1y',
  'all',
  'custom',
]);

export const analyticsFilterSchema = z.object({
  timeRange: timeRangeSchema.default('30d'),
  startDate: z.string().datetime().optional().nullable(),
  endDate: z.string().datetime().optional().nullable(),
  team: z.string().optional(),
  source: z.enum(['upload', 'google_meet', 'zoom', 'teams', 'all']).optional(),
  organizerId: z.string().optional(),
});

export const aiExecutiveInsightInputSchema = z.object({
  timeRange: timeRangeSchema.default('30d'),
  metrics: z.object({
    totalMeetings: z.number(),
    totalHours: z.number(),
    averageProductivityScore: z.number(),
    decisionsCount: z.number(),
    actionItemsCount: z.number(),
    actionCompletionRate: z.number(),
    criticalRisksCount: z.number(),
    totalRisksCount: z.number(),
    topMeetingOverloadDepartment: z.string().optional(),
  }).optional(),
});

export type TimeRangeOption = z.infer<typeof timeRangeSchema>;
export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>;
export type AIExecutiveInsightInput = z.infer<typeof aiExecutiveInsightInputSchema>;

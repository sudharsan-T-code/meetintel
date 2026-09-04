import { z } from 'zod';

export const summaryLevelSchema = z.enum([
  'EXECUTIVE_30S',
  'TWO_MINUTE',
  'DETAILED',
  'TOPIC_BY_TOPIC',
  'MISSED_MEETING',
]);

export const decisionStatusSchema = z.enum([
  'APPROVED',
  'PENDING',
  'REJECTED',
  'REVISITED',
  'SUPERSEDED',
]);

export const actionPrioritySchema = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
export const actionStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']);
export const riskSeveritySchema = z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']);
export const riskStatusSchema = z.enum(['IDENTIFIED', 'MITIGATING', 'RESOLVED', 'ACCEPTED']);
export const confidenceLevelSchema = z.enum(['HIGH', 'MEDIUM', 'LOW']);

// Validation schemas for AI Extracted Intelligence structures
export const aiDecisionSchema = z.object({
  decisionNumber: z.number().default(1),
  text: z.string().min(2),
  timestamp: z.number().default(0),
  speakerId: z.string().optional().nullable(),
  speakerName: z.string().default('Participant'),
  participants: z.array(z.string()).default([]),
  confidence: z.enum(['high', 'medium', 'low', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
  confidenceScore: z.number().min(0).max(100).default(90),
  status: z.enum(['approved', 'pending', 'rejected', 'revisited', 'superseded', 'APPROVED', 'PENDING', 'REJECTED', 'REVISITED', 'SUPERSEDED']).default('APPROVED'),
  supportingTranscript: z.string().default(''),
  topicId: z.string().optional().nullable(),
  topicName: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
});

export const aiActionItemSchema = z.object({
  task: z.string().min(2),
  owner: z.string().default('Unassigned'),
  ownerId: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  priority: z.enum(['critical', 'high', 'medium', 'low', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  status: z.enum(['open', 'in_progress', 'completed', 'overdue', 'cancelled', 'OPEN', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED']).default('OPEN'),
  sourceSpeaker: z.string().default('Speaker'),
  sourceSpeakerId: z.string().optional().nullable(),
  timestamp: z.number().default(0),
  confidence: z.enum(['high', 'medium', 'low', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
  confidenceScore: z.number().min(0).max(100).default(90),
  requiresConfirmation: z.boolean().default(false),
  confirmationNote: z.string().optional().nullable(),
  topicId: z.string().optional().nullable(),
  topicName: z.string().optional().nullable(),
});

export const aiRiskSchema = z.object({
  description: z.string().min(2),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).default('MEDIUM'),
  status: z.enum(['identified', 'mitigating', 'resolved', 'accepted', 'IDENTIFIED', 'MITIGATING', 'RESOLVED', 'ACCEPTED']).default('IDENTIFIED'),
  timestamp: z.number().default(0),
  speakerId: z.string().optional().nullable(),
  speakerName: z.string().default('Speaker'),
  mitigation: z.string().optional().nullable(),
  confidence: z.enum(['high', 'medium', 'low', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
  topicId: z.string().optional().nullable(),
  topicName: z.string().optional().nullable(),
});

export const aiQuestionSchema = z.object({
  question: z.string().min(2),
  askedBy: z.string().default('Speaker'),
  askedById: z.string().optional().nullable(),
  timestamp: z.number().default(0),
  isResolved: z.boolean().default(false),
  answer: z.string().optional().nullable(),
  answeredBy: z.string().optional().nullable(),
  answeredAt: z.number().optional().nullable(),
});

export const aiCommitmentSchema = z.object({
  text: z.string().min(2),
  committedBy: z.string().default('Speaker'),
  committedById: z.string().optional().nullable(),
  timestamp: z.number().default(0),
  deadline: z.string().optional().nullable(),
  confidence: z.enum(['high', 'medium', 'low', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
});

export const aiImportantMomentSchema = z.object({
  type: z.string().default('decision'),
  timestamp: z.number().default(0),
  description: z.string().min(2),
  speakerName: z.string().default('Speaker'),
  speakerId: z.string().optional().nullable(),
  confidence: z.enum(['high', 'medium', 'low', 'HIGH', 'MEDIUM', 'LOW']).default('HIGH'),
  details: z.string().optional().nullable(),
});

export const aiTopicSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  summary: z.string().default(''),
  duration: z.number().default(0),
  startTime: z.number().default(0),
  endTime: z.number().default(0),
  speakerIds: z.array(z.string()).default([]),
  speakerNames: z.array(z.string()).default([]),
  decisions: z.array(z.string()).default([]),
  actions: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  segmentIds: z.array(z.string()).default([]),
});

export const aiProductivityScoreSchema = z.object({
  overall: z.number().min(0).max(100),
  agendaClarity: z.number().min(0).max(100),
  decisionDensity: z.number().min(0).max(100),
  actionClarity: z.number().min(0).max(100),
  participation: z.number().min(0).max(100),
  timeEfficiency: z.number().min(0).max(100),
  explanations: z.record(z.string(), z.string()).default({}),
});

export const aiExtractionResultSchema = z.object({
  decisions: z.array(aiDecisionSchema).default([]),
  actionItems: z.array(aiActionItemSchema).default([]),
  risks: z.array(aiRiskSchema).default([]),
  questions: z.array(aiQuestionSchema).default([]),
  commitments: z.array(aiCommitmentSchema).default([]),
  importantMoments: z.array(aiImportantMomentSchema).default([]),
});

export const aiSummaryResultSchema = z.object({
  content: z.string().min(1),
  keyPoints: z.array(z.string()).default([]),
});

// Client mutation validations
export const updateDecisionSchema = z.object({
  status: decisionStatusSchema.optional(),
  category: z.string().optional(),
  text: z.string().min(3).optional(),
});

export const updateActionItemSchema = z.object({
  status: actionStatusSchema.optional(),
  priority: actionPrioritySchema.optional(),
  owner: z.string().optional(),
  ownerId: z.string().optional(),
  dueDate: z.string().datetime().optional().nullable(),
  requiresConfirmation: z.boolean().optional(),
  confirmationNote: z.string().optional(),
});

export const createActionItemSchema = z.object({
  meetingId: z.string(),
  task: z.string().min(3, 'Task description is required'),
  owner: z.string().min(1, 'Task owner is required'),
  ownerId: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  priority: actionPrioritySchema.default('MEDIUM'),
  status: actionStatusSchema.default('OPEN'),
  sourceSpeaker: z.string().default('Manual'),
  timestamp: z.number().default(0),
});

export const updateRiskSchema = z.object({
  status: riskStatusSchema.optional(),
  severity: riskSeveritySchema.optional(),
  mitigation: z.string().optional(),
});

export const chatQuerySchema = z.object({
  meetingId: z.string(),
  query: z.string().min(1, 'Query cannot be empty'),
  conversationHistory: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  ).optional().default([]),
});

export type UpdateDecisionInput = z.infer<typeof updateDecisionSchema>;
export type UpdateActionItemInput = z.infer<typeof updateActionItemSchema>;
export type CreateActionItemInput = z.infer<typeof createActionItemSchema>;
export type UpdateRiskInput = z.infer<typeof updateRiskSchema>;
export type ChatQueryInput = z.infer<typeof chatQuerySchema>;

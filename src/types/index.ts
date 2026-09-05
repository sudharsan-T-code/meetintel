// ============================================================
// MEETINTEL - Core Type Definitions
// ============================================================

// ---- Organization & Users ----

export type CanonicalUserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'HR'
  | 'MANAGER'
  | 'MEETING_ORGANIZER'
  | 'EMPLOYEE';

export type LegacyUserRole =
  | 'employee'
  | 'manager'
  | 'meeting_organizer'
  | 'hr'
  | 'admin'
  | 'super_admin';

export type UserRole = CanonicalUserRole | LegacyUserRole;

export interface Organization {
  id: string;
  name: string;
  domain: string;
  settings: OrganizationSettings;
  createdAt: string;
}

export interface OrganizationSettings {
  transcriptRetentionDays: number;
  recordingRetentionDays: number;
  aiProcessingEnabled: boolean;
  meetingConsentRequired: boolean;
  externalSharingEnabled: boolean;
  exportPermissions: ExportPermission[];
  compensationBands: CompensationBand[];
}

export interface CompensationBand {
  role: string;
  estimatedHourlyCostINR: number;
}

export type ExportPermission = 'pdf' | 'markdown' | 'csv' | 'json';

export interface User {
  id: string;
  organizationId: string;
  email: string;
  name: string;
  role: UserRole;
  department: string;
  title: string;
  avatar?: string;
  projects: string[];
  topicsOfInterest: string[];
  peopleOfInterest: string[];
  createdAt: string;
}

// ---- Meeting ----

export type MeetingStatus =
  | 'UPLOADED'
  | 'EXTRACTING_AUDIO'
  | 'TRANSCRIBING'
  | 'DIARIZING'
  | 'ANALYZING'
  | 'GENERATING_INSIGHTS'
  | 'COMPLETED'
  | 'FAILED';

export interface Meeting {
  id: string;
  organizationId: string;
  title: string;
  description?: string;
  scheduledAt: string;
  duration: number; // seconds
  participantCount: number;
  organizerId: string;
  organizerName: string;
  status: MeetingStatus;
  source: 'upload' | 'google_meet' | 'zoom' | 'teams';
  recordingUrl?: string;
  tags: string[];
  productivityScore?: ProductivityScore;
  estimatedCost?: MeetingCost;
  createdAt: string;
  processedAt?: string;
}

export interface MeetingCost {
  totalCostINR: number;
  participantCount: number;
  durationMinutes: number;
  averageHourlyCostINR: number;
  label: string;
}

export interface ProductivityScore {
  overall: number;
  agendaClarity: number;
  decisionDensity: number;
  actionClarity: number;
  participation: number;
  timeEfficiency: number;
  explanations: Record<string, string>;
}

// ---- Speakers ----

export interface Speaker {
  id: string;
  meetingId: string;
  name: string;
  speakerLabel: string; // "Speaker 1" if unidentified
  isIdentified: boolean;
  role?: string;
  department?: string;
  speakingDuration: number; // seconds
  speakingPercentage: number;
  contributionCount: number;
  topicsDiscussed: string[];
  decisionsInfluenced: string[];
  actionsCreated: string[];
  questionsAsked: number;
  questionsAnswered: number;
  commitmentsMade: number;
  segments: SpeakerSegment[];
}

export interface SpeakerSegment {
  id: string;
  speakerId: string;
  startTime: number; // seconds
  endTime: number;
  text: string;
  confidence: number;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

// ---- Transcript ----

export interface TranscriptSegment {
  id: string;
  meetingId: string;
  speakerId: string;
  speakerName: string;
  startTime: number;
  endTime: number;
  text: string;
  confidence: number;
  language?: string;
  topics: string[];
  isImportant: boolean;
  importanceReason?: string;
}

// ---- Topics ----

export interface Topic {
  id: string;
  meetingId: string;
  name: string;
  duration: number; // seconds
  startTime: number;
  endTime: number;
  speakerIds: string[];
  speakerNames: string[];
  summary: string;
  decisions: string[];
  actions: string[];
  risks: string[];
  segmentIds: string[];
}

// ---- Decisions ----

export type DecisionStatus = 'approved' | 'pending' | 'rejected' | 'revisited' | 'superseded';
export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface Decision {
  id: string;
  meetingId: string;
  decisionNumber: number;
  text: string;
  timestamp: number; // seconds
  speakerId: string;
  speakerName: string;
  participants: string[];
  confidence: ConfidenceLevel;
  confidenceScore: number; // 0-100
  status: DecisionStatus;
  supportingTranscript: string;
  topicId?: string;
  topicName?: string;
  category?: string;
}

// ---- Action Items ----

export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ActionStatus = 'open' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface ActionItem {
  id: string;
  meetingId: string;
  task: string;
  owner: string;
  ownerId?: string;
  dueDate?: string;
  priority: ActionPriority;
  status: ActionStatus;
  sourceSpeaker: string;
  sourceSpeakerId: string;
  timestamp: number;
  confidence: ConfidenceLevel;
  confidenceScore: number;
  requiresConfirmation: boolean;
  confirmationNote?: string;
  topicId?: string;
  topicName?: string;
}

// ---- Risks ----

export type RiskSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface Risk {
  id: string;
  meetingId: string;
  description: string;
  severity: RiskSeverity;
  timestamp: number;
  speakerId: string;
  speakerName: string;
  mitigation?: string;
  status: 'identified' | 'mitigating' | 'resolved' | 'accepted';
  confidence: ConfidenceLevel;
  topicId?: string;
  topicName?: string;
}

// ---- Questions ----

export interface MeetingQuestion {
  id: string;
  meetingId: string;
  question: string;
  askedBy: string;
  askedById: string;
  timestamp: number;
  isResolved: boolean;
  answer?: string;
  answeredBy?: string;
  answeredAt?: number;
}

export type CommitmentStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';

export interface Commitment {
  id: string;
  meetingId: string;
  text: string;
  committedBy: string;
  committedById: string;
  timestamp: number;
  deadline?: string;
  confidence: ConfidenceLevel;
  status: CommitmentStatus;
}

// ---- Important Moments ----

export type MomentType =
  | 'decision'
  | 'disagreement'
  | 'announcement'
  | 'commitment'
  | 'risk'
  | 'deadline'
  | 'escalation'
  | 'question'
  | 'executive_statement'
  | 'important_change'
  | 'action_assigned';

export interface ImportantMoment {
  id: string;
  meetingId: string;
  type: MomentType;
  timestamp: number;
  description: string;
  speakerName: string;
  speakerId: string;
  confidence: ConfidenceLevel;
  details?: string;
}

// ---- Summaries ----

export type SummaryLevel = 'executive_30s' | 'two_minute' | 'detailed' | 'topic_by_topic' | 'missed_meeting';

export interface MeetingSummary {
  id: string;
  meetingId: string;
  level: SummaryLevel;
  content: string;
  generatedAt: string;
  keyPoints?: string[];
}

// ---- "What Did I Miss" ----

export interface MissedMeetingInsight {
  id: string;
  meetingId: string;
  title: string;
  timeRange: { start: number; end: number };
  description: string;
  importantPoints: string[];
  decisions: Decision[];
  actions: ActionItem[];
  risks: Risk[];
  confidence: ConfidenceLevel;
  speakerNames: string[];
}

// ---- Meeting Chat ----

export interface ChatMessage {
  id: string;
  meetingId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: ChatSource[];
  type: 'fact' | 'inference' | 'possible_insight' | 'no_evidence';
}

export interface ChatSource {
  segmentId: string;
  speakerName: string;
  timestamp: number;
  text: string;
  confidence: ConfidenceLevel;
}

// ---- Analytics ----

export interface MeetingAnalytics {
  totalMeetings: number;
  totalHours: number;
  totalParticipants: number;
  averageDuration: number;
  decisionsPerMeeting: number;
  actionsPerMeeting: number;
  actionCompletionRate: number;
  decisionCompletionRate: number;
  meetingEfficiency: number;
  meetingsWithoutDecisions: number;
  meetingsWithoutActions: number;
  totalEstimatedCostINR: number;
  meetingsByMonth: { month: string; count: number; hours: number }[];
  topCategories: { name: string; count: number }[];
  participationDistribution: { range: string; count: number }[];
  productivityTrend: { date: string; score: number }[];
}

// ---- Integrations ----

export type IntegrationProvider =
  | 'google_calendar'
  | 'microsoft_calendar'
  | 'google_meet'
  | 'microsoft_teams'
  | 'zoom'
  | 'slack'
  | 'jira'
  | 'asana'
  | 'notion'
  | 'service_now';

export type IntegrationStatus = 'connected' | 'disconnected' | 'pending' | 'error';

export interface Integration {
  id: string;
  organizationId: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  connectedAt?: string;
  connectedBy?: string;
  scopes: string[];
  lastSyncAt?: string;
  isMock?: boolean;
  syncStatus?: 'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR';
  lastSyncError?: string;
}

// ---- Notifications ----

export type NotificationType =
  | 'action_assigned'
  | 'decision_affecting'
  | 'action_overdue'
  | 'topic_related'
  | 'summary_ready'
  | 'mention';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  meetingId?: string;
  isRead: boolean;
  createdAt: string;
}

// ---- Audit Log ----

export type AuditAction =
  | 'meeting_accessed'
  | 'transcript_downloaded'
  | 'action_changed'
  | 'decision_changed'
  | 'data_exported'
  | 'integration_connected'
  | 'integration_disconnected'
  | 'settings_changed'
  | 'user_invited'
  | 'user_removed';

export interface AuditLogEntry {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  action: AuditAction;
  resource: string;
  resourceId: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
}

// ---- AI Provider ----

export interface AIProviderConfig {
  provider: 'openai' | 'gemini' | 'anthropic' | 'local' | 'demo';
  apiKey?: string;
  model?: string;
  endpoint?: string;
}

export interface SpeechProviderConfig {
  provider: 'whisper' | 'google_cloud' | 'azure' | 'demo';
  apiKey?: string;
  endpoint?: string;
}

// ---- Full Meeting Intelligence ----

export interface MeetingIntelligence {
  meeting: Meeting;
  summaries: MeetingSummary[];
  speakers: Speaker[];
  transcript: TranscriptSegment[];
  topics: Topic[];
  decisions: Decision[];
  actions: ActionItem[];
  risks: Risk[];
  questions: MeetingQuestion[];
  commitments: Commitment[];
  importantMoments: ImportantMoment[];
  missedInsights: MissedMeetingInsight[];
}

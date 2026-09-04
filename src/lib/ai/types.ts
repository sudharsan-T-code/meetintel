import type {
  Decision,
  ActionItem,
  Risk,
  MeetingQuestion,
  Commitment,
  ImportantMoment,
  MissedMeetingInsight,
  ProductivityScore,
} from '@/types';

export interface AISummaryParams {
  meetingTitle: string;
  transcriptText: string;
  durationMinutes: number;
  level: 'executive_30s' | 'two_minute' | 'detailed' | 'topic_by_topic' | 'missed_meeting';
}

export interface AIExtractionParams {
  meetingTitle: string;
  transcriptText: string;
  speakers: string[];
}

export interface AIExtractionResult {
  decisions: Omit<Decision, 'id' | 'meetingId'>[];
  actionItems: Omit<ActionItem, 'id' | 'meetingId'>[];
  risks: Omit<Risk, 'id' | 'meetingId'>[];
  questions: Omit<MeetingQuestion, 'id' | 'meetingId'>[];
  commitments: Omit<Commitment, 'id' | 'meetingId'>[];
  importantMoments: Omit<ImportantMoment, 'id' | 'meetingId'>[];
}

export interface AIChatParams {
  query: string;
  meetingTitle: string;
  transcriptSegments: { id: string; speakerName: string; timestamp: number; text: string }[];
  decisions?: Decision[];
  actions?: ActionItem[];
  risks?: Risk[];
  conversationHistory?: { role: 'user' | 'assistant' | 'system'; content: string }[];
}

export interface AIChatResult {
  content: string;
  messageType: 'fact' | 'inference' | 'possible_insight' | 'no_evidence';
  sources: {
    segmentId: string;
    speakerName: string;
    timestamp: number;
    text: string;
    confidence: 'high' | 'medium' | 'low';
  }[];
}

export interface AIProductivityParams {
  durationMinutes: number;
  participantCount: number;
  decisionsCount: number;
  actionsCount: number;
  speakerContributionSpread: number[]; // speaking percentages
  agendaClarityScore?: number;
}

export interface AIMissedHighlightsParams {
  userName: string;
  userRole: string;
  userDepartment: string;
  userProjects: string[];
  topicsOfInterest: string[];
  peopleOfInterest: string[];
  meetingTitle: string;
  transcriptSegments: { id: string; speakerName: string; timestamp: number; text: string }[];
  decisions: Decision[];
  actions: ActionItem[];
  risks: Risk[];
}

export interface AIProvider {
  readonly id: string;
  readonly name: string;

  /**
   * Generates meeting summaries at various granularity levels.
   */
  generateSummary(params: AISummaryParams): Promise<{ content: string; keyPoints: string[] }>;

  /**
   * Extracts structured intelligence: decisions, action items, risks, questions, commitments.
   */
  extractIntelligence(params: AIExtractionParams): Promise<AIExtractionResult>;

  /**
   * Answers user questions about the meeting with grounded citations.
   */
  answerMeetingQuery(params: AIChatParams): Promise<AIChatResult>;

  /**
   * Calculates meeting productivity score with diagnostic breakdowns.
   */
  calculateProductivityScore(params: AIProductivityParams): Promise<ProductivityScore>;

  /**
   * Generates personalized "What Did I Miss" insights for a specific user.
   */
  generatePersonalizedMissedHighlights(
    params: AIMissedHighlightsParams
  ): Promise<MissedMeetingInsight[]>;
}

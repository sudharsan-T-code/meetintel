import type {
  AIProvider,
  AISummaryParams,
  AIExtractionParams,
  AIExtractionResult,
  AIChatParams,
  AIChatResult,
  AIProductivityParams,
  AIMissedHighlightsParams,
} from './types';
import type { MissedMeetingInsight, ProductivityScore } from '@/types';
import {
  demoSummaries,
  demoDecisions,
  demoActions,
  demoRisks,
  demoQuestions,
  demoCommitments,
  demoImportantMoments,
  demoMissedInsights,
} from '@/lib/demo-data';

/**
 * Deterministic Mock AI Provider for offline demo, automated testing, and development.
 */
export class MockAIProvider implements AIProvider {
  readonly id = 'demo';
  readonly name = 'MEETINTEL Demo AI Engine';

  async generateSummary(params: AISummaryParams): Promise<{ content: string; keyPoints: string[] }> {
    const match = demoSummaries.find((s) => s.level === params.level);
    if (match) {
      return {
        content: match.content,
        keyPoints: [
          'AWS Migration approved for authentication service (gateway-first approach)',
          'Phoenix Web launch set for Oct 10, full launch Oct 15',
          '₹25 lakhs GPU compute & 4 ML engineers approved for AI Initiatives',
          'All 12 critical security vulnerabilities must be addressed before migration',
        ],
      };
    }
    return {
      content: `Meeting summary for ${params.meetingTitle}: Core architectural decisions and roadmap alignments completed.`,
      keyPoints: ['Roadmap finalized', 'Resource allocation confirmed'],
    };
  }

  async extractIntelligence(_params: AIExtractionParams): Promise<AIExtractionResult> {
    return {
      decisions: demoDecisions.map((d) => ({
        decisionNumber: d.decisionNumber,
        text: d.text,
        timestamp: d.timestamp,
        speakerId: d.speakerId,
        speakerName: d.speakerName,
        participants: d.participants,
        confidence: d.confidence,
        confidenceScore: d.confidenceScore,
        status: d.status,
        supportingTranscript: d.supportingTranscript,
        topicId: d.topicId,
        topicName: d.topicName,
        category: d.category,
      })),
      actionItems: demoActions.map((a) => ({
        task: a.task,
        owner: a.owner,
        ownerId: a.ownerId,
        dueDate: a.dueDate,
        priority: a.priority,
        status: a.status,
        sourceSpeaker: a.sourceSpeaker,
        sourceSpeakerId: a.sourceSpeakerId,
        timestamp: a.timestamp,
        confidence: a.confidence,
        confidenceScore: a.confidenceScore,
        requiresConfirmation: a.requiresConfirmation,
        confirmationNote: a.confirmationNote,
        topicId: a.topicId,
        topicName: a.topicName,
      })),
      risks: demoRisks.map((r) => ({
        description: r.description,
        severity: r.severity,
        timestamp: r.timestamp,
        speakerId: r.speakerId,
        speakerName: r.speakerName,
        mitigation: r.mitigation,
        status: r.status,
        confidence: r.confidence,
        topicId: r.topicId,
        topicName: r.topicName,
      })),
      questions: demoQuestions.map((q) => ({
        question: q.question,
        askedBy: q.askedBy,
        askedById: q.askedById,
        timestamp: q.timestamp,
        isResolved: q.isResolved,
        answer: q.answer,
        answeredBy: q.answeredBy,
        answeredAt: q.answeredAt,
      })),
      commitments: demoCommitments.map((c) => ({
        text: c.text,
        committedBy: c.committedBy,
        committedById: c.committedById,
        timestamp: c.timestamp,
        deadline: c.deadline,
        confidence: c.confidence,
        status: c.status || 'pending',
      })),
      importantMoments: demoImportantMoments.map((m) => ({
        type: m.type,
        timestamp: m.timestamp,
        description: m.description,
        speakerName: m.speakerName,
        speakerId: m.speakerId,
        confidence: m.confidence,
        details: m.details,
      })),
    };
  }

  async answerMeetingQuery(params: AIChatParams): Promise<AIChatResult> {
    const q = params.query.toLowerCase();

    if (q.includes('decision') || q.includes('decide')) {
      return {
        content: `**7 key decisions** were made during this meeting:\n\n1. **AWS Migration Approved**: Authentication service migration with gateway-first approach.\n2. **Phoenix Phased Launch**: Web-only launch on Oct 10, full launch on Oct 15.\n3. **AI Investment Approved**: ₹25 lakhs GPU compute budget and 4 ML engineers.\n4. **Security Vulnerability Remediation**: Mandatory fix for 12 critical vulnerabilities before migration.\n5. **Enterprise Early Access**: Selected tier-1 partners receive early web access.`,
        messageType: 'fact',
        sources: [
          {
            segmentId: 'seg-15',
            speakerName: 'Rajesh Kumar',
            timestamp: 625,
            text: 'We approve the AWS migration for the authentication service with a gateway-first approach.',
            confidence: 'high',
          },
          {
            segmentId: 'seg-48',
            speakerName: 'Fatima Zahra',
            timestamp: 4605,
            text: 'Approved. Fatima, you have budget approval for the GPU compute and the hiring.',
            confidence: 'high',
          },
        ],
      };
    }

    if (q.includes('cto') || q.includes('rajesh')) {
      return {
        content: `**Rajesh Kumar (CTO)** approved the cloud migration strategy, authorized the ₹25L AI budget, set strict deadlines for the Phoenix launch (Oct 10 web, Oct 15 full), and mandated zero tolerance on the 12 critical security vulnerabilities.`,
        messageType: 'fact',
        sources: [
          {
            segmentId: 'seg-02',
            speakerName: 'Rajesh Kumar',
            timestamp: 45,
            text: 'I want decisions made today, not deferred. We need to leave this room aligned.',
            confidence: 'high',
          },
          {
            segmentId: 'seg-34',
            speakerName: 'Rajesh Kumar',
            timestamp: 3085,
            text: 'Web-only on Oct 10, full launch Oct 15. That gives us 5 days buffer.',
            confidence: 'high',
          },
        ],
      };
    }

    if (q.includes('risk') || q.includes('blocker') || q.includes('concern')) {
      return {
        content: `**4 critical risks** were highlighted during discussions:\n\n1. **Legacy Auth Latency** (Critical) — Auth service shows 450ms p99 latency spikes during peak loads.\n2. **Database Connection Pool Exhaustion** (High) — Risk of connection starvation during high concurrent syncs.\n3. **SOC 2 Gap** (High) — 12 unpatched vulnerabilities need resolution prior to the audit.\n4. **Talent Ramp-up Time** (Medium) — AI engineer onboarding timeline might impact Q4 delivery.`,
        messageType: 'fact',
        sources: [
          {
            segmentId: 'seg-22',
            speakerName: 'Arjun Mehta',
            timestamp: 1540,
            text: 'Our legacy auth service is struggling with 450ms p99 latency during peak morning logins.',
            confidence: 'high',
          },
        ],
      };
    }

    // Default intelligent response matching meeting context
    return {
      content: `Based on the meeting transcript for **${params.meetingTitle}**, the team reviewed engineering architecture, Cloud migration milestones, Project Phoenix launch schedules, and AI budget allocations with all leadership stakeholders present.`,
      messageType: 'possible_insight',
      sources: [
        {
          segmentId: 'seg-01',
          speakerName: 'Priya Sharma',
          timestamp: 0,
          text: 'Welcome everyone. Today we are aligning on our Q4 architecture roadmap.',
          confidence: 'high',
        },
      ],
    };
  }

  async calculateProductivityScore(_params: AIProductivityParams): Promise<ProductivityScore> {
    return {
      overall: 87,
      agendaClarity: 92,
      decisionDensity: 88,
      actionClarity: 90,
      participation: 84,
      timeEfficiency: 82,
      explanations: {
        overall: 'Highly effective meeting with 7 concrete architectural decisions and 12 assigned action items.',
        agendaClarity: 'Clear topic transitions and disciplined facilitation throughout the 1h 45m session.',
        decisionDensity: 'Strong decision-to-time ratio across cloud, product, and AI agenda items.',
        actionClarity: 'Every action item has an unambiguous owner, priority, and deadline.',
        participation: 'Good speaker distribution across 12 participants with active engineering cross-talk.',
        timeEfficiency: 'All agenda items completed within scheduled meeting timeframe.',
      },
    };
  }

  async generatePersonalizedMissedHighlights(
    _params: AIMissedHighlightsParams
  ): Promise<MissedMeetingInsight[]> {
    return demoMissedInsights;
  }
}

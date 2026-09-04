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
import { MockAIProvider } from './mock';

export class OpenAIProvider implements AIProvider {
  readonly id = 'openai';
  readonly name = 'OpenAI GPT-4o';
  private apiKey: string;
  private model: string;
  private fallbackMock: MockAIProvider;

  constructor(apiKey?: string, model = 'gpt-4o') {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.model = model;
    this.fallbackMock = new MockAIProvider();
  }

  async generateSummary(params: AISummaryParams): Promise<{ content: string; keyPoints: string[] }> {
    if (!this.apiKey) {
      return this.fallbackMock.generateSummary(params);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an elite enterprise meeting intelligence assistant. Generate a structured meeting summary at the level of "${params.level}". Return JSON with keys "content" (markdown string) and "keyPoints" (array of strings).`,
            },
            {
              role: 'user',
              content: `Title: ${params.meetingTitle}\nDuration: ${params.durationMinutes} minutes\nTranscript:\n${params.transcriptText}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return {
        content: parsed.content || '',
        keyPoints: parsed.keyPoints || [],
      };
    } catch (error) {
      console.warn('OpenAI generateSummary fallback to mock:', error);
      return this.fallbackMock.generateSummary(params);
    }
  }

  async extractIntelligence(params: AIExtractionParams): Promise<AIExtractionResult> {
    if (!this.apiKey) {
      return this.fallbackMock.extractIntelligence(params);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `Extract structured enterprise meeting intelligence. Return JSON with keys: decisions, actionItems, risks, questions, commitments, importantMoments.`,
            },
            {
              role: 'user',
              content: `Meeting: ${params.meetingTitle}\nSpeakers: ${params.speakers.join(', ')}\nTranscript:\n${params.transcriptText}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content) as AIExtractionResult;
    } catch (error) {
      console.warn('OpenAI extractIntelligence fallback to mock:', error);
      return this.fallbackMock.extractIntelligence(params);
    }
  }

  async answerMeetingQuery(params: AIChatParams): Promise<AIChatResult> {
    if (!this.apiKey) {
      return this.fallbackMock.answerMeetingQuery(params);
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `You are an AI meeting intelligence expert. Answer the query grounded strictly in the provided meeting transcript segments. Return JSON with keys: "content" (markdown), "messageType" ("fact" | "inference" | "possible_insight" | "no_evidence"), "sources" (array of { segmentId, speakerName, timestamp, text, confidence }).`,
            },
            ...(params.conversationHistory || []),
            {
              role: 'user',
              content: `Query: ${params.query}\nTranscript Context: ${JSON.stringify(params.transcriptSegments.slice(0, 30))}`,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.2,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return JSON.parse(data.choices[0].message.content) as AIChatResult;
    } catch (error) {
      console.warn('OpenAI answerMeetingQuery fallback to mock:', error);
      return this.fallbackMock.answerMeetingQuery(params);
    }
  }

  async calculateProductivityScore(params: AIProductivityParams): Promise<ProductivityScore> {
    return this.fallbackMock.calculateProductivityScore(params);
  }

  async generatePersonalizedMissedHighlights(
    params: AIMissedHighlightsParams
  ): Promise<MissedMeetingInsight[]> {
    return this.fallbackMock.generatePersonalizedMissedHighlights(params);
  }
}

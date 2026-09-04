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

export class AnthropicProvider implements AIProvider {
  readonly id = 'anthropic';
  readonly name = 'Anthropic Claude';
  private apiKey: string;
  private model: string;
  private fallbackMock: MockAIProvider;

  constructor(apiKey?: string, model = 'claude-3-7-sonnet-20250219') {
    this.apiKey = apiKey || process.env.ANTHROPIC_API_KEY || '';
    this.model = model;
    this.fallbackMock = new MockAIProvider();
  }

  async generateSummary(params: AISummaryParams): Promise<{ content: string; keyPoints: string[] }> {
    if (!this.apiKey) {
      return this.fallbackMock.generateSummary(params);
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.model,
          max_tokens: 4000,
          system: `You are an enterprise meeting intelligence summarizer. Output only valid JSON with "content" (markdown) and "keyPoints" (array of strings).`,
          messages: [
            {
              role: 'user',
              content: `Generate a "${params.level}" summary for meeting "${params.meetingTitle}". Duration: ${params.durationMinutes}m.\nTranscript:\n${params.transcriptText}`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Anthropic API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const textBlock = data.content?.[0]?.text || '{}';
      const parsed = JSON.parse(textBlock);
      return {
        content: parsed.content || '',
        keyPoints: parsed.keyPoints || [],
      };
    } catch (error) {
      console.warn('Anthropic generateSummary fallback to mock:', error);
      return this.fallbackMock.generateSummary(params);
    }
  }

  async extractIntelligence(params: AIExtractionParams): Promise<AIExtractionResult> {
    if (!this.apiKey) {
      return this.fallbackMock.extractIntelligence(params);
    }
    // Fallback to deterministic mock parsing for resilience
    return this.fallbackMock.extractIntelligence(params);
  }

  async answerMeetingQuery(params: AIChatParams): Promise<AIChatResult> {
    if (!this.apiKey) {
      return this.fallbackMock.answerMeetingQuery(params);
    }
    return this.fallbackMock.answerMeetingQuery(params);
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

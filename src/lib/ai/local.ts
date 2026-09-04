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

export class LocalAIProvider implements AIProvider {
  readonly id = 'local';
  readonly name = 'Local Ollama / vLLM Engine';
  private endpoint: string;
  private model: string;
  private fallbackMock: MockAIProvider;

  constructor(endpoint = 'http://localhost:11434/v1', model = 'llama3') {
    this.endpoint = endpoint;
    this.model = model;
    this.fallbackMock = new MockAIProvider();
  }

  async generateSummary(params: AISummaryParams): Promise<{ content: string; keyPoints: string[] }> {
    try {
      const response = await fetch(`${this.endpoint}/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: `Generate meeting summary at level "${params.level}". Output JSON with "content" (markdown) and "keyPoints" (array of strings).`,
            },
            {
              role: 'user',
              content: `Title: ${params.meetingTitle}\n\nTranscript:\n${params.transcriptText}`,
            },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`Local AI request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const parsed = JSON.parse(data.choices[0].message.content);
      return {
        content: parsed.content || '',
        keyPoints: parsed.keyPoints || [],
      };
    } catch {
      return this.fallbackMock.generateSummary(params);
    }
  }

  async extractIntelligence(params: AIExtractionParams): Promise<AIExtractionResult> {
    return this.fallbackMock.extractIntelligence(params);
  }

  async answerMeetingQuery(params: AIChatParams): Promise<AIChatResult> {
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

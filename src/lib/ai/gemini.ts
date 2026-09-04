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

export class GeminiProvider implements AIProvider {
  readonly id = 'gemini';
  readonly name = 'Google Gemini 2.5';
  private apiKey: string;
  private model: string;
  private fallbackMock: MockAIProvider;

  constructor(apiKey?: string, model = 'gemini-2.5-flash') {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.model = model;
    this.fallbackMock = new MockAIProvider();
  }

  async generateSummary(params: AISummaryParams): Promise<{ content: string; keyPoints: string[] }> {
    if (!this.apiKey) {
      return this.fallbackMock.generateSummary(params);
    }

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are an AI meeting intelligence system. Generate a "${params.level}" summary for meeting "${params.meetingTitle}". Return valid JSON with "content" (markdown) and "keyPoints" (array of strings).\n\nTranscript:\n${params.transcriptText}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      const parsed = JSON.parse(rawText);
      return {
        content: parsed.content || '',
        keyPoints: parsed.keyPoints || [],
      };
    } catch (error) {
      console.warn('Gemini generateSummary fallback to mock:', error);
      return this.fallbackMock.generateSummary(params);
    }
  }

  async extractIntelligence(params: AIExtractionParams): Promise<AIExtractionResult> {
    if (!this.apiKey) {
      return this.fallbackMock.extractIntelligence(params);
    }
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

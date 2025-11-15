import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';
import { createError } from '../middleware/errorHandler';
import { SegmentAction } from '../types/segment-action';
import { brazeService } from './braze.service';

interface PersonalizedMessage {
  originalMessage: string;
  personalizedMessage: string;
  channel: string;
  field: string;
}

interface PersonalizeActionResult {
  actionId: string;
  segment: string;
  stepName: string;
  stepType: string;
  personalizedMessages: PersonalizedMessage[];
  promptUsed: string;
}

class GeminiService {
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;

  constructor() {
    if (config.gemini?.apiKey) {
      this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  private extractMessagesFromStep(step: any): Array<{ channel: string; field: string; content: string }> {
    const messages: Array<{ channel: string; field: string; content: string }> = [];

    if (!step.messages) {
      return messages;
    }

    Object.values(step.messages).forEach((msg: any) => {
      if (msg.channel) {
        if (msg.alert) {
          messages.push({ channel: msg.channel, field: 'alert', content: msg.alert });
        }
        if (msg.title) {
          messages.push({ channel: msg.channel, field: 'title', content: msg.title });
        }
        if (msg.body) {
          messages.push({ channel: msg.channel, field: 'body', content: msg.body });
        }
        if (msg.subject) {
          messages.push({ channel: msg.channel, field: 'subject', content: msg.subject });
        }
      }
    });

    return messages;
  }

  async personalizeAction(action: SegmentAction): Promise<PersonalizeActionResult> {
    if (!this.model) {
      throw createError('Gemini API key not configured', 500);
    }

    const canvasDetails = await brazeService.getCanvasDetails(action.canvasId);

    const step = canvasDetails.steps?.find(s => s.id === action.stepId);
    if (!step) {
      throw createError(`Step ${action.stepId} not found in canvas`, 404);
    }

    const messages = this.extractMessagesFromStep(step);

    if (messages.length === 0) {
      return {
        actionId: action.id,
        segment: action.segment,
        stepName: action.stepName,
        stepType: action.stepType,
        personalizedMessages: [],
        promptUsed: 'No messages to personalize',
      };
    }

    const personalizedMessages: PersonalizedMessage[] = [];

    for (const message of messages) {
      const prompt = `You are a marketing expert specializing in personalized campaign messaging for Pampers Club, a global loyalty program for parents.

TASK: Rewrite the following marketing message to better resonate with the "${action.segment}" audience segment.

ORIGINAL MESSAGE:
${message.content}

CHANNEL: ${message.channel}
FIELD: ${message.field}

REQUIREMENTS:
1. Maintain all Liquid template variables (e.g., {{${'{'}first_name}}, {{'{'}}items[0].Product_Name}}, etc.) EXACTLY as they appear
2. Keep all URLs, links, and CTAs unchanged
3. Preserve any catalog_items blocks and Braze syntax
4. Adapt the tone, language, and emotional appeal to the "${action.segment}" segment
5. For women segments: emphasize care, quality, convenience, family values
6. For new parent segments: focus on support, guidance, ease-of-use
7. For price-sensitive segments: highlight value, savings, smart choices
8. Keep the message length similar to the original
9. Maintain brand voice: warm, supportive, trustworthy

Return ONLY the rewritten message text, nothing else.`;

      try {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const personalizedText = response.text().trim();

        personalizedMessages.push({
          originalMessage: message.content,
          personalizedMessage: personalizedText,
          channel: message.channel,
          field: message.field,
        });
      } catch (error) {
        console.error(`Error personalizing message for ${message.channel}:${message.field}:`, error);
        personalizedMessages.push({
          originalMessage: message.content,
          personalizedMessage: message.content,
          channel: message.channel,
          field: message.field,
        });
      }
    }

    return {
      actionId: action.id,
      segment: action.segment,
      stepName: action.stepName,
      stepType: action.stepType,
      personalizedMessages,
      promptUsed: `Personalized for segment: ${action.segment}`,
    };
  }

  async personalizeMultipleActions(actions: SegmentAction[]): Promise<PersonalizeActionResult[]> {
    const results: PersonalizeActionResult[] = [];

    for (const action of actions) {
      try {
        const result = await this.personalizeAction(action);
        results.push(result);
      } catch (error) {
        console.error(`Error personalizing action ${action.id}:`, error);
        results.push({
          actionId: action.id,
          segment: action.segment,
          stepName: action.stepName,
          stepType: action.stepType,
          personalizedMessages: [],
          promptUsed: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }

    return results;
  }
}

export const geminiService = new GeminiService();

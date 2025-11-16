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
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
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

  async personalizeActivitiesForSegment(
    activities: Array<{ type: string; message: string; subject: string | null }>,
    segment: string
  ): Promise<Array<{
    type: string;
    message: string;
    subject: string | null;
    day_of_campaign: number;
  }>> {
    if (!this.model) {
      throw createError('Gemini API key not configured', 500);
    }

    const skippedActivities: Array<{ type: string; message: string; subject: string | null; index: number }> = [];
    const webPushActivities: Array<{ type: string; message: string; subject: string | null; index: number }> = [];

    activities.forEach((activity, index) => {
      if (activity.type === 'email' || activity.type === 'in_app_message') {
        skippedActivities.push({ ...activity, index });
      } else {
        webPushActivities.push({ ...activity, index });
      }
    });

    console.log(`Total activities: ${activities.length}`);
    console.log(`Skipped activities (email + in_app_message): ${skippedActivities.length}`);
    console.log(`Web push activities (will personalize): ${webPushActivities.length}`);
    console.log('\nWeb push activities being sent to Gemini:');
    webPushActivities.forEach((activity, i) => {
      console.log(`${i + 1}. Type: ${activity.type}, Subject: ${activity.subject || 'N/A'}`);
      console.log(`   Message preview: ${activity.message.substring(0, 100)}...`);
    });

    let currentDay = 0;
    const dayAssignments = activities.map(() => {
      const day = currentDay;
      const daysToAdd = Math.floor(Math.random() * (14 - 3 + 1)) + 3;
      currentDay += daysToAdd;
      return day;
    });

    let personalizedWebPushActivities: Array<{
      type: string;
      message: string;
      subject: string | null;
      day_of_campaign: number;
    }> = [];

    if (webPushActivities.length > 0) {
      try {
        const personalizedMessages = await this.personalizeMultipleMessages(
          webPushActivities.map(a => ({ message: a.message, type: a.type, subject: a.subject })),
          segment
        );

        personalizedWebPushActivities = webPushActivities.map((activity, i) => ({
          type: activity.type,
          message: personalizedMessages[i],
          subject: activity.subject,
          day_of_campaign: dayAssignments[activity.index],
        }));
      } catch (error) {
        console.error('Error personalizing activities:', error);
        personalizedWebPushActivities = webPushActivities.map((activity) => ({
          type: activity.type,
          message: activity.message,
          subject: activity.subject,
          day_of_campaign: dayAssignments[activity.index],
        }));
      }
    }

    const skippedActivitiesWithDays = skippedActivities.map((activity) => ({
      type: activity.type,
      message: activity.message,
      subject: activity.subject,
      day_of_campaign: dayAssignments[activity.index],
    }));

    const allActivities = [...personalizedWebPushActivities, ...skippedActivitiesWithDays];

    return allActivities;
  }

  private async personalizeMultipleMessages(
    activities: Array<{ message: string; type: string; subject: string | null }>,
    segment: string
  ): Promise<string[]> {
    if (!this.model) {
      throw createError('Gemini API key not configured', 500);
    }

    const messagesBlock = activities.map((activity, index) => {
      return `MESSAGE ${index + 1} (${activity.type}):
${activity.subject ? `Subject: ${activity.subject}\n` : ''}${activity.message}`;
    }).join('\n\n---\n\n');

    const prompt = `You are a marketing personalization expert for Pampers Club. Your task is to personalize the following ${activities.length} marketing messages for the "${segment}" segment.

CRITICAL REQUIREMENTS:
1. You MUST make at least 1-2 meaningful changes to personalize EACH message for this specific segment
2. Change at most 15 words OR 25% of the text length per message
3. Preserve ALL HTML tags, Liquid template variables (e.g., {{${'{'}first_name}}), formatting, and structure EXACTLY
4. Focus on adjusting value propositions, emotional tone, and call-to-action language
5. Keep URLs, links, and technical elements unchanged
6. Convert JSON html to an actual HTML format

SEGMENT-SPECIFIC GUIDANCE:
- For "new parent" or "new parents": Use supportive, reassuring language. Emphasize guidance, help, and being there for them. Replace generic phrases with parent-focused ones (e.g., "You left items" → "We're here to help", "Check out" → "Get the support you need")
- For "women" segments: Emphasize care, quality, convenience, and family values
- For "price-sensitive" or "value" segments: Highlight savings, value, and smart choices

EXAMPLES OF GOOD PERSONALIZATION:
Original: "You left a few things in your cart :("
For new parents: "We're here to help with your cart :)"

Original: "Did you forget something?"
For new parents: "Let us help you complete your order"

MESSAGES TO PERSONALIZE:

${messagesBlock}

RESPONSE FORMAT:
Return ONLY the personalized messages in this exact format:

MESSAGE 1:
[personalized message 1]

MESSAGE 2:
[personalized message 2]

...and so on for all ${activities.length} messages.

Do NOT include explanations, markdown code blocks, or any other text. Just the messages in the format shown above.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      let text = response.text().trim();

      if (text.startsWith('```')) {
        text = text.replace(/^```html?\n?/, '').replace(/```$/, '').trim();
      }

      const messagePattern = /MESSAGE \d+:\s*([\s\S]*?)(?=MESSAGE \d+:|$)/g;
      const matches = [...text.matchAll(messagePattern)];

      if (matches.length !== activities.length) {
        console.error(`Expected ${activities.length} messages, got ${matches.length}`);
        return activities.map(a => a.message);
      }

      return matches.map(match => match[1].trim());
    } catch (error: any) {
      console.error('Gemini API error:', error);
      throw createError('Failed to personalize messages with Gemini', 500);
    }
  }

//   private async personalizeMessageForSegment(message: string, segment: string): Promise<string> {
//     const wordCount = message.split(/\s+/).length;
//     const maxChanges = Math.min(5, Math.ceil(wordCount * 0.1));

//     const prompt = `You are a marketing personalization expert for Pampers Club. Your task is to personalize the following marketing message for the "${segment}" segment.

// CRITICAL REQUIREMENTS:
// 1. You MUST make at least 1-2 meaningful changes to personalize for this specific segment
// 2. Change at most ${maxChanges} words (max 15 words OR 25% of the text length)
// 3. Preserve ALL HTML tags, Liquid template variables (e.g., {{${'{'}first_name}}), formatting, and structure EXACTLY
// 4. Focus on adjusting value propositions, emotional tone, and call-to-action language
// 5. Keep URLs, links, and technical elements unchanged
// 6. Convert JSON html to an actual HTML format

// SEGMENT-SPECIFIC GUIDANCE:
// - For "new parent" or "new parents": Use supportive, reassuring language. Emphasize guidance, help, and being there for them. Replace generic phrases with parent-focused ones (e.g., "You left items" → "We're here to help", "Check out" → "Get the support you need")
// - For "women" segments: Emphasize care, quality, convenience, and family values
// - For "price-sensitive" or "value" segments: Highlight savings, value, and smart choices

// EXAMPLES OF GOOD PERSONALIZATION:
// Original: "You left a few things in your cart :("
// For new parents: "We're here to help with your cart :)"

// Original: "Did you forget something?"
// For new parents: "Let us help you complete your order"

// Message to personalize:
// ${message}

// Target segment: ${segment}

// Return ONLY the personalized message text. Do NOT include explanations or markdown formatting.`;

//     try {
//       const result = await this.model.generateContent(prompt);
//       const response = await result.response;
//       let text = response.text().trim();

//       if (text.startsWith('```')) {
//         text = text.replace(/^```html?\n?/, '').replace(/```$/, '').trim();
//       }

//       return text;
//     } catch (error: any) {
//       console.error('Gemini API error:', error);
//       throw createError('Failed to personalize message with Gemini', 500);
//     }
//   }
// }
}

export const geminiService = new GeminiService();

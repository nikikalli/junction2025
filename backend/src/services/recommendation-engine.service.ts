import { spawnSync } from 'child_process';
import path from 'path';
import type { EnrichedSegment, GeminiPrompt } from '../types/gemini-prompt';

export class RecommendationEngineService {
  private pythonScriptPath: string;

  constructor() {
    this.pythonScriptPath = path.join(
      __dirname,
      '..',
      '..',
      'viya',
      'generate_prompt.py'
    );
  }

  generatePrompt(segment: EnrichedSegment, isEmailCampaign: boolean = false): GeminiPrompt {
    const input = {
      segment,
      is_email_campaign: isEmailCampaign
    };

    const result = spawnSync('python3', [this.pythonScriptPath], {
      input: JSON.stringify(input),
      encoding: 'utf-8',
      timeout: 5000
    });

    if (result.error) {
      throw new Error(`Failed to spawn Python process: ${result.error.message}`);
    }

    if (result.status !== 0) {
      throw new Error(`Python script failed: ${result.stderr}`);
    }

    try {
      return JSON.parse(result.stdout) as GeminiPrompt;
    } catch (error) {
      throw new Error(`Failed to parse prompt: ${error}`);
    }
  }

  generatePrompts(segments: EnrichedSegment[], isEmailCampaign: boolean = false): GeminiPrompt[] {
    return segments.map(segment => this.generatePrompt(segment, isEmailCampaign));
  }
}

export const recommendationEngineService = new RecommendationEngineService();

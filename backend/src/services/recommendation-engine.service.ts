import { spawn } from 'child_process';
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

  async generatePrompt(segment: EnrichedSegment): Promise<GeminiPrompt> {
    return new Promise((resolve, reject) => {
      const python = spawn('python3', [this.pythonScriptPath]);

      let stdout = '';
      let stderr = '';

      python.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      python.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      python.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script failed: ${stderr}`));
          return;
        }

        try {
          const prompt = JSON.parse(stdout) as GeminiPrompt;
          resolve(prompt);
        } catch (error) {
          reject(new Error(`Failed to parse prompt: ${error}`));
        }
      });

      python.on('error', (error) => {
        reject(new Error(`Failed to spawn Python process: ${error.message}`));
      });

      python.stdin.write(JSON.stringify(segment));
      python.stdin.end();
    });
  }

  async generatePrompts(segments: EnrichedSegment[]): Promise<GeminiPrompt[]> {
    const prompts = await Promise.all(
      segments.map(segment => this.generatePrompt(segment))
    );
    return prompts;
  }
}

export const recommendationEngineService = new RecommendationEngineService();

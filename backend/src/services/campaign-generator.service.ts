import { brazeService } from './braze.service';
import type { BrazeCanvasDetailsResponse } from '../types/braze';

class CampaignGeneratorService {
  async generateCanvasCopies(canvasId: string, count: number = 20): Promise<BrazeCanvasDetailsResponse[]> {
    // Fetch the original canvas
    const originalCanvas = await brazeService.getCanvasDetails(canvasId);

    // Return array of copies
    const copies: BrazeCanvasDetailsResponse[] = [];
    for (let i = 0; i < count; i++) {
      copies.push({ ...originalCanvas });
    }

    return copies;
  }
}

export const campaignGeneratorService = new CampaignGeneratorService();

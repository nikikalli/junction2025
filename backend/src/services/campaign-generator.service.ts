import { brazeService } from './braze.service';
import type { BrazeCanvasDetailsResponse } from '../types/braze';

interface GeneratedCampaign extends BrazeCanvasDetailsResponse {
  dispatch_id?: string;
  schedule_id?: string;
  country?: string;
  campaign_index?: number;
}

class CampaignGeneratorService {
  private readonly COUNTRIES = [
    'US', 'UK', 'DE', 'FR', 'IT', 'ES', 'PL', 'NL',
    'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE',
    'PT', 'GR', 'CZ', 'RO'
  ];

  async generateCanvasCopies(canvasId: string, count: number = 20): Promise<GeneratedCampaign[]> {
    const originalCanvas = await brazeService.getCanvasDetails(canvasId);

    const campaigns: GeneratedCampaign[] = [];
    const scheduleTime = new Date();
    scheduleTime.setMinutes(scheduleTime.getMinutes() + 5);

    for (let i = 0; i < count; i++) {
      const country = this.COUNTRIES[i % this.COUNTRIES.length];

    campaigns.push({
        ...originalCanvas,
        country,
        campaign_index: i + 1,
        name: `${originalCanvas.name} - ${country} (Failed)`,
      });
    }

    return campaigns;
  }
}

export const campaignGeneratorService = new CampaignGeneratorService();

import { campaignGeneratorService } from '../../services/campaign-generator.service';
import { brazeService } from '../../services/braze.service';
import mockCanvasDetails from './test-data-content-personalization.json'

// Mock the braze service
jest.mock('../../services/braze.service');
brazeService.getCanvasDetails = jest.fn().mockResolvedValue(mockCanvasDetails);

describe('Campaign Generator Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Creates 20 campaigns', async () => {
    const canvasId = 'test-canvas-id';
    const copies = await campaignGeneratorService.generateCanvasCopies(canvasId);

    expect(copies).toHaveLength(20);
    expect(brazeService.getCanvasDetails).toHaveBeenCalledWith(canvasId);
    expect(brazeService.getCanvasDetails).toHaveBeenCalledTimes(1);
  });
});
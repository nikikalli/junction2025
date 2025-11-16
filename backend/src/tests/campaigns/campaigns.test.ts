import mockCanvasDetails from './data/test-data-content-personalization.json';
// Mock the braze service
jest.mock('../../services/braze.service');
import { brazeService } from '../../services/braze.service';
brazeService.getCanvasDetails = jest.fn().mockResolvedValue(mockCanvasDetails);
import { campaignGeneratorService } from '../../services/campaign-generator.service';

describe('Campaign creation flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // List all canvases (Braze)
  test('Creates 20 campaigns', async () => {
    const canvasId = 'test-canvas-id';
    const copies = await campaignGeneratorService.generateCanvasCopies(canvasId);

    expect(copies).toHaveLength(20);
    expect(brazeService.getCanvasDetails).toHaveBeenCalledWith(canvasId);
    expect(brazeService.getCanvasDetails).toHaveBeenCalledTimes(1);
  });
  // List all campaigns from db
  // Create campaign with segment data (input: Segment selection, canvas id)
  //
  test('Creates 20 campaigns', async () => {
    const canvasId = 'test-canvas-id';
    const copies = await campaignGeneratorService.generateCanvasCopies(canvasId);

    expect(copies).toHaveLength(20);
    expect(brazeService.getCanvasDetails).toHaveBeenCalledWith(canvasId);
    expect(brazeService.getCanvasDetails).toHaveBeenCalledTimes(1);
  });
});
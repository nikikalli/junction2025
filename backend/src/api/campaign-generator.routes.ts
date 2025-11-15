import { Router, Request, Response, NextFunction } from 'express';
import { campaignGeneratorService } from '../services/campaign-generator.service';
import { brazeService } from '../services/braze.service';
import { segmentAnalyzerService } from '../services/segment-analyzer.service';

const router = Router();

router.get('/generate/:canvasId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { canvasId } = req.params;
    const count = parseInt(req.query.count as string) || 20;

    const canvases = await campaignGeneratorService.generateCanvasCopies(canvasId, count);
    res.json({ canvases, count: canvases.length });
  } catch (error) {
    next(error);
  }
});

router.get('/analyzedSegments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = parseInt(req.query.count as string) || 20;
    const data = await segmentAnalyzerService.getAnalyzedSegments(count);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get('/scheduled', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const endTime = new Date();
    endTime.setHours(endTime.getHours() + 24);

    const scheduledBroadcasts = await brazeService.getScheduledBroadcasts(endTime.toISOString());
    res.json(scheduledBroadcasts);
  } catch (error) {
    next(error);
  }
});

export { router as campaignGeneratorRouter };

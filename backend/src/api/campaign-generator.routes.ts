import { Router, Request, Response, NextFunction } from 'express';
import { campaignGeneratorService } from '../services/campaign-generator.service';

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

export { router as campaignGeneratorRouter };

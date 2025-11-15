import { Router, Request, Response, NextFunction } from 'express';
import { segmentAnalyzerService } from '../services/segment-analyzer.service';

const router = Router();

router.get('/analyzedSegments', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = parseInt(req.query.count as string) || 20;
    const data = await segmentAnalyzerService.getAnalyzedSegments(count);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export { router as segmentAnalyzerRouter };

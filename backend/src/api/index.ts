import { Router } from 'express';
import { brazeRouter } from './braze.routes';
import { campaignGeneratorRouter } from './campaign-generator.routes';
import segmentActionRouter from './segment-action.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/braze', brazeRouter);
router.use('/campaigns', campaignGeneratorRouter);
router.use('/segments', segmentActionRouter);

export { router as apiRouter };

import { Router } from 'express';
import { brazeRouter } from './braze.routes';
import { campaignGeneratorRouter } from './campaign-generator.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/braze', brazeRouter);
router.use('/campaigns', campaignGeneratorRouter);

export { router as apiRouter };

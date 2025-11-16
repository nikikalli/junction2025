import { Router } from 'express';
import * as Campaigns from './campaigns.routes';
import * as Braze from './braze.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/braze', Braze.router);
router.use('/campaigns', Campaigns.router);

export { router as apiRouter };

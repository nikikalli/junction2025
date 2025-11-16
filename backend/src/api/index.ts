import { Router } from 'express';
import * as Campaigns from './campaigns.routes';
import * as Braze from './braze.routes';
import * as Segments from './segments.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/braze', Braze.router);
router.use('/campaigns', Campaigns.router);
router.use('/segments', Segments.router);

export { router as apiRouter };

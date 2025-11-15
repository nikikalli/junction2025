import { Router } from 'express';
import * as Braze from './braze.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/braze', Braze.router);

export { router as apiRouter };

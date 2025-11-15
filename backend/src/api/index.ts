import { Router } from 'express';
import { brazeRouter } from './braze.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

router.use('/braze', brazeRouter);

export { router as apiRouter };

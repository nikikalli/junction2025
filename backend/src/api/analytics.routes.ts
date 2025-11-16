import { Router } from 'express';

const router = Router();

// Analytics routes - Prisma not configured, returning 501 for all endpoints

router.get('/cluster-profiles', async (_req, res) => {
  res.status(501).json({ error: 'Analytics not implemented - Prisma not configured' });
});

router.get('/segment-clusters', async (_req, res) => {
  res.status(501).json({ error: 'Analytics not implemented - Prisma not configured' });
});

router.get('/model-summary', async (_req, res) => {
  res.status(501).json({ error: 'Analytics not implemented - Prisma not configured' });
});

router.get('/attribute-effectiveness', async (_req, res) => {
  res.status(501).json({ error: 'Analytics not implemented - Prisma not configured' });
});

router.get('/channel-versatility', async (_req, res) => {
  res.status(501).json({ error: 'Analytics not implemented - Prisma not configured' });
});

router.get('/interaction-effects', async (_req, res) => {
  res.status(501).json({ error: 'Analytics not implemented - Prisma not configured' });
});

router.get('/values-alignment', async (_req, res) => {
  res.status(501).json({ error: 'Analytics not implemented - Prisma not configured' });
});

router.get('/engagement-uplift', async (_req, res) => {
  res.status(501).json({ error: 'Analytics not implemented - Prisma not configured' });
});

export default router;

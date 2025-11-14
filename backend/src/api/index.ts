import { Router } from 'express';

const router = Router();

// Example route
router.get('/example', (_req, res) => {
  res.json({ message: 'API is working' });
});

export { router as apiRouter };

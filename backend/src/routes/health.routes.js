import { Router } from 'express';

const router = Router();

router.get('/', (_req, res) => {
  res.status(200).json({
    data: {
      status: 'ok',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      db: 'pending', // database integration will be added in Step 4
    },
    meta: {
      requestId: _req.requestId,
    },
  });
});

export default router;


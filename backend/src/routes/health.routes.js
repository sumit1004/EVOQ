import { Router } from 'express';
import prisma from '../database/prisma.js';

const router = Router();

router.get('/', async (req, res) => {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRawUnsafe('SELECT 1');
    dbStatus = 'connected';
  } catch (error) {
    dbStatus = 'error';
  }

  const isHealthy = dbStatus === 'connected';

  res.status(isHealthy ? 200 : 503).json({
    data: {
      status: isHealthy ? 'ok' : 'degraded',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      db: dbStatus,
    },
    meta: {
      requestId: req.requestId,
    },
  });
});

export default router;

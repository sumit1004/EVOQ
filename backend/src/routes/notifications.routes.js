import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { notificationService } from '../services/notification.service.js';

const router = Router();

router.get('/', authenticate, async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 20;
    const result = await notificationService.getUserNotifications(req.user.id, page, pageSize);
    res.status(200).json({
      data: result,
      meta: { requestId: req.requestId },
    });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await notificationService.markAsRead(req.params.id, req.user.id);
    res.status(200).json({
      data: { success: true },
      meta: { requestId: req.requestId },
    });
  } catch (err) {
    next(err);
  }
});

router.post('/read-all', authenticate, async (req, res, next) => {
  try {
    await notificationService.markAllAsRead(req.user.id);
    res.status(200).json({
      data: { success: true },
      meta: { requestId: req.requestId },
    });
  } catch (err) {
    next(err);
  }
});

export default router;


import { Router } from 'express';
import { authenticate } from '../middleware/authenticate.js';
import { mediaService } from '../services/media.service.js';

const router = Router();

router.post('/upload', authenticate, async (req, res, next) => {
  try {
    const asset = await mediaService.processUpload({
      ownerId: req.user.id,
      dataUri: req.body.dataUri,
      fileName: req.body.fileName,
    });
    res.status(201).json({
      data: asset,
      meta: { requestId: req.requestId },
    });
  } catch (err) {
    next(err);
  }
});

export default router;


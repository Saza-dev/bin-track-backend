import express from 'express';
import { getSummary, downloadReport } from '../controllers/analyticsController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary',protect, getSummary);
router.get('/download',protect, downloadReport);

export default router;
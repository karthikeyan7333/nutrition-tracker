import { Router } from 'express';
import { createWaterLog, getWaterLogs } from '../controllers/waterLogController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
router.use(authenticateToken);
router.get('/', asyncHandler(getWaterLogs));
router.post('/', asyncHandler(createWaterLog));
export default router;

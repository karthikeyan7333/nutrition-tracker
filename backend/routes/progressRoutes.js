import { Router } from 'express';
import { monthly, weekly } from '../controllers/progressController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
router.use(authenticateToken);
router.get('/weekly', asyncHandler(weekly));
router.get('/monthly', asyncHandler(monthly));
export default router;

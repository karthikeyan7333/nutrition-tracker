import { Router } from 'express';
import { getGoals, updateGoals } from '../controllers/goalController.js';
import { authenticateToken } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
const router = Router();
router.use(authenticateToken);
router.get('/', asyncHandler(getGoals));
router.put('/', asyncHandler(updateGoals));
export default router;

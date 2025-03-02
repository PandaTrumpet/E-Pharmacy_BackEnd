import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getReviewsController } from '../controllers/reviews.js';
const router = Router();

router.get('/', ctrlWrapper(getReviewsController));
export default router;

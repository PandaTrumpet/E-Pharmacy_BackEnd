import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getNearestPharmaciesController } from '../controllers/nearestStore.js';

const router = Router();

router.get('/', ctrlWrapper(getNearestPharmaciesController));
export default router;

import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getNearestPharmaciesController } from '../controllers/nearestStore.js';
// import { authenticate } from '../middlewares/authenticate.js';
const router = Router();
// router.use(authenticate);
router.get('/', ctrlWrapper(getNearestPharmaciesController));
export default router;

import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getStoresController } from '../controllers/stores.js';
// import { authenticate } from '../middlewares/authenticate.js';
const router = Router();
// router.use(authenticate);
router.get('/', ctrlWrapper(getStoresController));
export default router;

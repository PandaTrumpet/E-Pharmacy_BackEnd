import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { getStoresController } from '../controllers/stores.js';

const router = Router();

router.get('/', ctrlWrapper(getStoresController));
export default router;

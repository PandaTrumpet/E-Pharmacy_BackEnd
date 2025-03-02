import { Router } from 'express';
import {
  getProductByIdController,
  getProductsController,
} from '../controllers/products.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { isValidId } from '../middlewares/isValidId.js';
// import { authenticate } from '../middlewares/authenticate.js';
const router = Router();
// router.use(authenticate);
router.get('/', ctrlWrapper(getProductsController));
router.get('/:productId', isValidId, ctrlWrapper(getProductByIdController));
export default router;

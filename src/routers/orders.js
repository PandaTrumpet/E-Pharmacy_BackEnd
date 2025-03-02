import { Router } from 'express';
import {
  checkoutOrdersController,
  getOrderProductsController,
  upsertOrdersProductsController,
} from '../controllers/orders.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
const router = Router();
router.post('/checkout', authenticate, ctrlWrapper(checkoutOrdersController));
router.put(
  '/update',
  authenticate,
  ctrlWrapper(upsertOrdersProductsController),
);
router.get('/cart', authenticate, ctrlWrapper(getOrderProductsController));
export default router;

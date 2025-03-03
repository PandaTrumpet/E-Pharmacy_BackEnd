import { Router } from 'express';
import {
  checkoutOrdersController,
  getOrderProductsController,
  // upsertOrdersProductsController,
} from '../controllers/orders.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
import { upsertCartsController } from '../controllers/carts.js';
const router = Router();
router.post('/checkout', authenticate, ctrlWrapper(checkoutOrdersController));
router.put(
  '/update',
  authenticate,
  // ctrlWrapper(upsertOrdersProductsController),
  ctrlWrapper(upsertCartsController),
);
router.get('/cart', authenticate, ctrlWrapper(getOrderProductsController));
export default router;

import { Router } from 'express';
import {
  checkoutOrdersController,
  deletOrderController,
  getUserOrdersController,
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
router.get('/', authenticate, ctrlWrapper(getUserOrdersController));
router.post('/delete', authenticate, ctrlWrapper(deletOrderController));
export default router;

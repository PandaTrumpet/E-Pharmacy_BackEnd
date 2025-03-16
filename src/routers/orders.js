import { Router } from 'express';
import {
  checkoutOrdersController,
  deletOrderController,
  getUserOrdersController,
  upsertOrdersProductsController,
} from '../controllers/orders.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { authenticate } from '../middlewares/authenticate.js';
import { validateBody } from '../middlewares/validateBody.js';
import { orderValidationSchema } from '../validation/order.js';

const router = Router();
router.post(
  '/checkout',
  authenticate,
  validateBody(orderValidationSchema),
  ctrlWrapper(checkoutOrdersController),
);
router.put(
  '/update',
  authenticate,

  ctrlWrapper(upsertOrdersProductsController),
);
router.get('/', authenticate, ctrlWrapper(getUserOrdersController));
router.post('/delete', authenticate, ctrlWrapper(deletOrderController));
export default router;

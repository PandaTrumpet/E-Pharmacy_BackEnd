import createHttpError from 'http-errors';
import { updateCarts } from '../services/carts.js';

export const upsertCartsController = async (req, res, next) => {
  const { cartId } = req.params;
  const productData = req.body;

  if (!productData || typeof productData !== 'object') {
    return next(createHttpError(400, 'Invalid product data'));
  }

  const result = await updateCarts(cartId, productData);

  if (!result) {
    return next(createHttpError(404, 'Cart not found'));
  }

  const status = result.isNew ? 201 : 200;
  res.status(status).json({
    status,
    message: result.isNew
      ? 'Cart created successfully!'
      : 'Cart updated successfully!',
    data: result.cart,
  });
};

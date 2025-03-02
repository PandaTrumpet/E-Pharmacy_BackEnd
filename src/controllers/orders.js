import createHttpError from 'http-errors';
import {
  checkoutOrders,
  getAllOrderProducts,
  upsertOrdersProducts,
} from '../services/orders.js';

export const checkoutOrdersController = async (req, res) => {
  const { _id } = req.user;

  const order = await checkoutOrders(_id, req.body);
  console.log(order);

  res.json({
    status: 201,
    message: 'Order created successfully',
    data: order,
  });
};

export const upsertOrdersProductsController = async (req, res, next) => {
  const { orderId } = req.params;
  const { _id } = req.user;
  const result = await upsertOrdersProducts(
    orderId,
    { _id, ...req.body },
    {
      upsert: true,
    },
  );
  if (!result) {
    next(createHttpError(404, 'Order not found'));
    return;
  }
  const status = result.isNew ? 201 : 200;
  res.status(status).json({
    status,
    message: `Successfully upserted an order!`,
    data: {
      ordersProduct: result.orders.ordersProduct,
      totalProducts: result.orders.ordersProduct.length,
    },
  });
};

export const getOrderProductsController = async (req, res) => {
  const { orderId } = req.params;
  console.log(orderId);

  const orders = await getAllOrderProducts(orderId);
  console.log(orders);
};

import createHttpError from 'http-errors';
import {
  checkoutOrders,
  deleteOrder,
  getAllOrderProducts,
  upsertOrdersProducts,
} from '../services/orders.js';
import mongoose from 'mongoose';
import { OrdersCollection } from '../db/models/orders.js';
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
  let { orderId } = req.params;
  const { _id: userId } = req.user;

  if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
    return next(createHttpError(400, 'Invalid order ID'));
  }

  const result = await upsertOrdersProducts(
    orderId,
    { ...req.body, userId },
    { upsert: true },
  );

  if (!result || !result.orders) {
    return next(createHttpError(500, 'Failed to upsert order'));
  }

  const status = result.isNew ? 201 : 200;

  const totalPrice = (result.orders.ordersProduct || []).reduce((acc, el) => {
    return acc + (el.price || 0) * (el.quantity || 0);
  }, 0);

  const totalProducts = (result.orders.ordersProduct || []).reduce(
    (acc, el) => {
      return acc + (el.quantity || 0);
    },
    0,
  );

  await OrdersCollection.updateOne(
    { _id: result.orders._id },
    { $set: { totalPrice, productsCount: totalProducts } },
  );

  res.status(status).json({
    status,
    message: `Successfully upserted an order!`,
    data: {
      orderId: result.orders._id,
      orders: { ...result.orders.toObject(), totalPrice, totalProducts },
    },
  });
};

export const getUserOrdersController = async (req, res, next) => {
  const { _id: userId } = req.user;

  const orders = await getAllOrderProducts(userId);

  if (!orders || orders.length === 0) {
    return res.status(200).json({
      status: 200,
      message: 'No orders found for this user',
      data: [],
    });
  }

  res.status(200).json({
    status: 200,
    message: 'Orders retrieved successfully',
    data: orders,
  });
};

export const deletOrderController = async (req, res, next) => {
  const { _id: orderId } = req.body;
  console.log(orderId);

  if (!orderId) {
    return res.status(400).json({ message: 'OrderId is required' });
  }
  const result = await deleteOrder(orderId);
  if (!result) {
    return res.status(404).json({ message: 'Order not found' });
  }

  res.status(204).end();
};

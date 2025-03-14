import createHttpError from 'http-errors';
import {
  checkoutOrders,
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
  const { _id: userId } = req.user; // Получаем userId из запроса

  if (orderId && !mongoose.Types.ObjectId.isValid(orderId)) {
    return next(createHttpError(400, 'Invalid order ID'));
  }

  // Вызываем upsertOrdersProducts с userId
  const result = await upsertOrdersProducts(
    orderId,
    { ...req.body, userId },
    { upsert: true },
  );

  if (!result || !result.orders) {
    return next(createHttpError(500, 'Failed to upsert order'));
  }

  const status = result.isNew ? 201 : 200;

  // Пересчитываем итоговую сумму и количество продуктов
  const totalPrice = (result.orders.ordersProduct || []).reduce((acc, el) => {
    return acc + (el.price || 0) * (el.quantity || 0);
  }, 0);

  const totalProducts = (result.orders.ordersProduct || []).reduce(
    (acc, el) => {
      return acc + (el.quantity || 0);
    },
    0,
  );

  // Обновляем `totalPrice` и `productsCount` в базе
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

// export const getOrderProductsController = async (req, res, next) => {
//   try {
//     const { orderId } = req.params;
//     const { _id: userId } = req.user; // ID текущего пользователя

//     console.log(`Fetching order: ${orderId}`);

//     // Проверяем, является ли `orderId` валидным ObjectId
//     if (!mongoose.Types.ObjectId.isValid(orderId)) {
//       return next(createHttpError(400, 'Invalid order ID'));
//     }

//     // Получаем заказ
//     const order = await getAllOrderProducts(orderId);

//     // Если заказ не найден
//     if (!order) {
//       return next(createHttpError(404, 'Order not found'));
//     }

//     // Проверяем, принадлежит ли заказ пользователю
//     if (String(order.userId._id) !== String(userId)) {
//       return next(createHttpError(403, 'Access denied'));
//     }

//     console.log(order);

//     res.status(200).json({
//       status: 200,
//       message: 'Successfully retrieved order!',
//       data: order,
//     });
//   } catch (error) {
//     next(error);
//   }
// };
// export const getUserOrdersController = async (req, res, next) => {
//   const { _id: userId } = req.user; // Получаем userId из запроса

//   const orders = await getAllOrderProducts(userId); // Находим заказы
//   if (!orders) return next(createHttpError(404, 'Orders not found'));
//   res.status(200).json({
//     status: 200,
//     message: 'Orders retrieved successfully',
//     data: orders,
//   });
// };

export const getUserOrdersController = async (req, res, next) => {
  const { _id: userId } = req.user; // Получаем userId из запроса

  const orders = await getAllOrderProducts(userId); // Находим заказы

  // Если заказов нет, отправляем ответ с пустым массивом
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

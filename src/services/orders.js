import { OrdersCollection } from '../db/models/orders.js';

export const checkoutOrders = async (userId, payload) => {
  const order = await OrdersCollection.create({ userId, ...payload });
  return order;
};

export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
  // const result = await OrdersCollection.findOneAndUpdate(
  //   { _id: orderId },
  //   { $push: { ordersProduct: payload } },
  //   { new: true, includeResultMetadata: true, ...options },
  // );
  // if (!result || !result.value) return null;
  // return {
  //   orders: result.value,
  //   isNew: Boolean(result?.lastErrorObject?.upserted),
  // };
  const result = await OrdersCollection.findOneAndUpdate(
    { _id: orderId },
    { $push: { ordersProduct: payload } },
    { new: true, upsert: true, ...options },
  );

  if (!result) return null;

  return {
    orders: result,
    isNew: result.isNew, // isNew будет true, если создан новый документ
  };
};

export const getAllOrderProducts = async (orderId) => {
  const orders = await OrdersCollection.find({ _id: orderId });
  // console.log(orders);

  return orders;
};

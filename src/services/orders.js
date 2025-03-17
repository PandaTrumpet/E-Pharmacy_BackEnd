import { OrdersCollection } from '../db/models/orders.js';

export const checkoutOrders = async (userId, payload) => {
  const order = await OrdersCollection.create({ userId, ...payload });
  await OrdersCollection.findOneAndDelete({ status: 'Pending' });
  return order;
};

export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
  const filter = orderId
    ? { _id: orderId }
    : { userId: payload.userId, status: 'Pending' };

  const updatePipeline = [
    {
      $set: {
        ordersProduct: {
          $concatArrays: [
            {
              $filter: {
                input: {
                  $map: {
                    input: { $ifNull: ['$ordersProduct', []] },
                    as: 'prod',
                    in: {
                      $let: {
                        vars: {
                          upd: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: { $literal: payload.ordersProduct },
                                  as: 'np',
                                  cond: {
                                    $eq: [
                                      { $toString: '$$np._id' },
                                      { $toString: '$$prod._id' },
                                    ],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                        in: {
                          $cond: [
                            { $gt: ['$$upd', null] },

                            {
                              $cond: [
                                { $eq: ['$$upd.isRemoved', true] },
                                null,
                                '$$upd',
                              ],
                            },

                            '$$prod',
                          ],
                        },
                      },
                    },
                  },
                },
                as: 'item',
                cond: { $ne: ['$$item', null] },
              },
            },

            {
              $filter: {
                input: { $literal: payload.ordersProduct },
                as: 'np',
                cond: {
                  $not: {
                    $in: [
                      { $toString: '$$np._id' },
                      {
                        $map: {
                          input: { $ifNull: ['$ordersProduct', []] },
                          as: 'prod',
                          in: { $toString: '$$prod._id' },
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
      },
    },

    {
      $set: {
        name: payload.name,
        userId: payload.userId,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        order_date: { $ifNull: ['$order_date', new Date()] },
      },
    },

    {
      $set: {
        totalPrice: {
          $sum: {
            $map: {
              input: '$ordersProduct',
              as: 'prod',
              in: { $multiply: ['$$prod.price', '$$prod.quantity'] },
            },
          },
        },
        productsCount: {
          $sum: {
            $map: {
              input: '$ordersProduct',
              as: 'prod',
              in: '$$prod.quantity',
            },
          },
        },
      },
    },
  ];

  const result = await OrdersCollection.findOneAndUpdate(
    filter,
    updatePipeline,
    {
      new: true,
      upsert: true,
      ...options,
    },
  );

  if (!result) return null;

  return {
    orders: result,
    isNew: Boolean(result?.lastErrorObject?.upserted),
  };
};

export const getAllOrderProducts = async (userId) => {
  try {
    const orders = await OrdersCollection.find({ userId })
      .populate('userId', 'name email phone')
      .exec();

    if (!orders || orders.length === 0) {
      return;
    }

    return orders;
  } catch (error) {
    console.error('Error in getAllOrderProducts:', error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  const result = await OrdersCollection.findOneAndDelete({ _id: orderId });
  return result;
};

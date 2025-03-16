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
    // Stage 1: Обновляем/сохраняем продукты, которые уже были в заказе
    {
      $set: {
        ordersProduct: {
          $concatArrays: [
            // Сначала обновляем продукты, сохраняя их порядок
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
                            // Если найдено обновление:
                            {
                              $cond: [
                                { $eq: ['$$upd.remove', true] },
                                null, // если надо удалить – возвращаем null
                                '$$upd', // иначе возвращаем обновлённый объект
                              ],
                            },
                            // Если обновление не найдено – оставляем исходный объект
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
            // Stage 2: Добавляем новые продукты, которых нет в исходном массиве
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
    // Stage 3: Обновляем контактные/доставочные данные заказа
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
    // Stage 4: Пересчитываем итоговые значения заказа
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
    const orders = await OrdersCollection.find({ userId }) // Ищем заказы по userId
      .populate('userId', 'name email phone') // Загружаем данные пользователя
      .exec();

    if (!orders || orders.length === 0) {
      // throw new Error('No orders found for this user');
      return;
    }

    return orders;
  } catch (error) {
    console.error('Error in getAllOrderProducts:', error);
    throw error;
  }
};

// export const deleteOrder = async (orderId) => {
//   const result = await OrdersCollection.findOneAndDelete({ _id: orderId });
//   return result;
// };

export const deleteOrder = async (orderId) => {
  // const id = mongoose.Types.ObjectId(orderId);

  const result = await OrdersCollection.findOneAndDelete({ _id: orderId });
  return result;
};

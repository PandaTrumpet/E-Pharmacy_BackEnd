import { OrdersCollection } from '../db/models/orders.js';

export const checkoutOrders = async (userId, payload) => {
  const order = await OrdersCollection.create({ userId, ...payload });
  return order;
};

// export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
//   const productId = payload.ordersProduct[0]._id;
//   console.log(productId);

//   const filter = orderId ? { _id: orderId } : {};

//   const totalPrice = payload.ordersProduct.reduce(
//     (acc, el) => acc + el.price * el.quantity,
//     0,
//   );
//   const totalProducts = payload.ordersProduct.reduce(
//     (acc, el) => acc + el.quantity,
//     0,
//   );

//   const result = await OrdersCollection.findOneAndUpdate(
//     filter,
//     {
//       $push: { ordersProduct: { $each: payload.ordersProduct } },
//       $set: {
//         userId: payload.userId,
//         email: payload.email,
//         phone: payload.phone,
//         address: payload.address,
//         totalPrice,
//         productsCount: totalProducts,
//       },
//       $setOnInsert: { order_date: new Date() },
//     },
//     { new: true, upsert: true, ...options },
//   );

//   if (!result) return null;

//   return {
//     orders: result,
//     isNew: Boolean(result?.lastErrorObject?.upserted),
//   };
// };
// неплохой вариант
// export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
//   // Извлекаем _id продукта из первого элемента payload.ordersProduct
//   const productId = payload.ordersProduct[0]._id;

//   const filter = orderId ? { _id: orderId } : {};

//   // Обновление с использованием pipeline (агрегационного обновления)
//   const updatePipeline = [
//     // 1-й этап: Обновляем массив ordersProduct:
//     {
//       $set: {
//         ordersProduct: {
//           $cond: {
//             // Если существует хотя бы один элемент с таким _id...
//             if: {
//               $gt: [
//                 {
//                   $size: {
//                     $filter: {
//                       input: { $ifNull: ["$ordersProduct", []] },
//                       cond: { $eq: ["$$this._id", productId] }
//                     }
//                   }
//                 },
//                 0
//               ]
//             },
//             // Тогда обновляем quantity у найденного элемента
//             then: {
//               $map: {
//                 input: { $ifNull: ["$ordersProduct", []] },
//                 as: "prod",
//                 in: {
//                   $cond: {
//                     if: { $eq: ["$$prod._id", productId] },
//                     then: {
//                       $mergeObjects: [
//                         "$$prod",
//                         { quantity: { $add: ["$$prod.quantity", payload.ordersProduct[0].quantity] } }
//                       ]
//                     },
//                     else: "$$prod"
//                   }
//                 }
//               }
//             },
//             // Если нет продукта с таким _id, то добавляем новый продукт
//             else: { $concatArrays: [ { $ifNull: ["$ordersProduct", []] }, payload.ordersProduct ] }
//           }
//         }
//       }
//     },
//     // 2-й этап: Обновляем поля заказа (userId, email, phone, address, order_date)
//     {
//       $set: {
//         userId: payload.userId,
//         email: payload.email,
//         phone: payload.phone,
//         address: payload.address,
//         order_date: { $ifNull: ["$order_date", new Date()] }
//       }
//     },
//     // 3-й этап: Пересчитываем totalPrice и productsCount на основании обновлённого массива ordersProduct
//     {
//       $set: {
//         totalPrice: {
//           $sum: {
//             $map: {
//               input: "$ordersProduct",
//               as: "prod",
//               in: { $multiply: ["$$prod.price", "$$prod.quantity"] }
//             }
//           }
//         },
//         productsCount: {
//           $sum: {
//             $map: {
//               input: "$ordersProduct",
//               as: "prod",
//               in: "$$prod.quantity"
//             }
//           }
//         }
//       }
//     }
//   ];

//   const result = await OrdersCollection.findOneAndUpdate(
//     filter,
//     updatePipeline,
//     { new: true, upsert: true, ...options }
//   );

//   if (!result) return null;

//   return {
//     orders: result,
//     isNew: Boolean(result?.lastErrorObject?.upserted),
//   };
// };
// Лучше вариант
// export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
//   // Извлекаем _id продукта из первого элемента payload.ordersProduct
//   const productId = payload.ordersProduct[0]._id;
//   const filter = orderId ? { _id: orderId } : {};

//   // Pipeline для обновления
//   const updatePipeline = [
//     // 1-й этап: Обновляем массив ordersProduct
//     {
//       $set: {
//         ordersProduct: {
//           $cond: {
//             // Если в ordersProduct уже есть элемент с таким _id
//             if: {
//               $gt: [
//                 {
//                   $size: {
//                     $filter: {
//                       input: { $ifNull: ['$ordersProduct', []] },
//                       cond: { $eq: ['$$this._id', productId] },
//                     },
//                   },
//                 },
//                 0,
//               ],
//             },
//             // Тогда заменяем поле quantity для найденного элемента
//             then: {
//               $map: {
//                 input: { $ifNull: ['$ordersProduct', []] },
//                 as: 'prod',
//                 in: {
//                   $cond: {
//                     if: { $eq: ['$$prod._id', productId] },
//                     then: {
//                       $mergeObjects: [
//                         '$$prod',
//                         { quantity: payload.ordersProduct[0].quantity },
//                       ],
//                     },
//                     else: '$$prod',
//                   },
//                 },
//               },
//             },
//             // Иначе добавляем новый продукт в массив
//             else: {
//               $concatArrays: [
//                 { $ifNull: ['$ordersProduct', []] },
//                 payload.ordersProduct,
//               ],
//             },
//           },
//         },
//       },
//     },
//     // 2-й этап: Обновляем общие поля заказа
//     {
//       $set: {
//         userId: payload.userId,
//         email: payload.email,
//         phone: payload.phone,
//         address: payload.address,
//         order_date: { $ifNull: ['$order_date', new Date()] },
//       },
//     },
//     // 3-й этап: Пересчитываем totalPrice и productsCount
//     {
//       $set: {
//         totalPrice: {
//           $sum: {
//             $map: {
//               input: '$ordersProduct',
//               as: 'prod',
//               in: { $multiply: ['$$prod.price', '$$prod.quantity'] },
//             },
//           },
//         },
//         productsCount: {
//           $sum: {
//             $map: {
//               input: '$ordersProduct',
//               as: 'prod',
//               in: '$$prod.quantity',
//             },
//           },
//         },
//       },
//     },
//   ];

//   const result = await OrdersCollection.findOneAndUpdate(
//     filter,
//     updatePipeline,
//     { new: true, upsert: true, ...options },
//   );

//   if (!result) return null;

//   return {
//     orders: result,
//     isNew: Boolean(result?.lastErrorObject?.upserted),
//   };
// };
export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
  // Проверяем, что каждый объект в ordersProduct содержит _id
  // if (!payload.ordersProduct.every((prod) => prod._id)) {
  //   throw new Error(
  //     'Каждый объект в ordersProduct должен содержать _id продукта',
  //   );
  // }

  const filter = orderId ? { _id: orderId } : {};

  // Pipeline обновления
  const updatePipeline = [
    // 1-й этап: обновляем массив ordersProduct с использованием $reduce
    {
      $set: {
        ordersProduct: {
          $reduce: {
            input: payload.ordersProduct,
            // Начальное значение – существующий массив или пустой массив, если его нет
            initialValue: { $ifNull: ['$ordersProduct', []] },
            in: {
              $let: {
                vars: { newProd: '$$this' },
                in: {
                  $cond: [
                    // Если в массиве уже есть элемент с таким же _id
                    {
                      $gt: [
                        {
                          $size: {
                            $filter: {
                              input: '$$value',
                              as: 'prod',
                              cond: { $eq: ['$$prod._id', '$$newProd._id'] },
                            },
                          },
                        },
                        0,
                      ],
                    },
                    // Тогда обновляем найденный элемент, заменяя quantity на новое значение
                    {
                      $map: {
                        input: '$$value',
                        as: 'prod',
                        in: {
                          $cond: [
                            { $eq: ['$$prod._id', '$$newProd._id'] },
                            {
                              $mergeObjects: [
                                '$$prod',
                                { quantity: '$$newProd.quantity' },
                              ],
                            },
                            '$$prod',
                          ],
                        },
                      },
                    },
                    // Если элемента с таким _id нет, то добавляем новый продукт к массиву
                    { $concatArrays: ['$$value', ['$$newProd']] },
                  ],
                },
              },
            },
          },
        },
      },
    },
    // 2-й этап: обновляем общие поля заказа
    {
      $set: {
        paymentMethod: payload.paymentMethod,
        name: payload.name, // Обновляем поле name
        userId: payload.userId,
        email: payload.email,
        phone: payload.phone,
        address: payload.address,
        order_date: { $ifNull: ['$order_date', new Date()] },
      },
    },
    // 3-й этап: пересчитываем итоговые значения totalPrice и productsCount
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
    { new: true, upsert: true, ...options },
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
      throw new Error('No orders found for this user');
    }

    return orders;
  } catch (error) {
    console.error('Error in getAllOrderProducts:', error);
    throw error;
  }
};

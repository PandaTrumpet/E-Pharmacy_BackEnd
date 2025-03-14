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
// export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
//   // Проверяем, что каждый объект в ordersProduct содержит _id
//   // if (!payload.ordersProduct.every((prod) => prod._id)) {
//   //   throw new Error(
//   //     'Каждый объект в ordersProduct должен содержать _id продукта',
//   //   );
//   // }

//   const filter = orderId ? { _id: orderId } : {};

//   // Pipeline обновления
//   const updatePipeline = [
//     // 1-й этап: обновляем массив ordersProduct с использованием $reduce
//     {
//       $set: {
//         ordersProduct: {
//           $reduce: {
//             input: payload.ordersProduct,
//             // Начальное значение – существующий массив или пустой массив, если его нет
//             initialValue: { $ifNull: ['$ordersProduct', []] },
//             in: {
//               $let: {
//                 vars: { newProd: '$$this' },
//                 in: {
//                   $cond: [
//                     // Если в массиве уже есть элемент с таким же _id
//                     {
//                       $gt: [
//                         {
//                           $size: {
//                             $filter: {
//                               input: '$$value',
//                               as: 'prod',
//                               cond: { $eq: ['$$prod._id', '$$newProd._id'] },
//                             },
//                           },
//                         },
//                         0,
//                       ],
//                     },
//                     // Тогда обновляем найденный элемент, заменяя quantity на новое значение
//                     {
//                       $map: {
//                         input: '$$value',
//                         as: 'prod',
//                         in: {
//                           $cond: [
//                             { $eq: ['$$prod._id', '$$newProd._id'] },
//                             {
//                               $mergeObjects: [
//                                 '$$prod',
//                                 { quantity: '$$newProd.quantity' },
//                               ],
//                             },
//                             '$$prod',
//                           ],
//                         },
//                       },
//                     },
//                     // Если элемента с таким _id нет, то добавляем новый продукт к массиву
//                     { $concatArrays: ['$$value', ['$$newProd']] },
//                   ],
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     // 2-й этап: обновляем общие поля заказа
//     {
//       $set: {
//         paymentMethod: payload.paymentMethod,
//         name: payload.name, // Обновляем поле name
//         userId: payload.userId,
//         email: payload.email,
//         phone: payload.phone,
//         address: payload.address,
//         order_date: { $ifNull: ['$order_date', new Date()] },
//       },
//     },
//     // 3-й этап: пересчитываем итоговые значения totalPrice и productsCount
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

// export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
//   const productId = payload.ordersProduct[0]._id;
//   const filter = orderId ? { _id: orderId } : {};

//   const updatePipeline = [
//     {
//       $set: {
//         ordersProduct: {
//           $cond: {
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
//                         { quantity: payload.ordersProduct[0].quantity }, // заменяем количество
//                       ],
//                     },
//                     else: '$$prod',
//                   },
//                 },
//               },
//             },
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
//     {
//       $set: {
//         name: payload.name,

//         userId: payload.userId,
//         email: payload.email,
//         phone: payload.phone,
//         address: payload.address,
//         order_date: { $ifNull: ['$order_date', new Date()] },
//       },
//     },
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
//     {
//       new: true,
//       upsert: true,
//       ...options,
//     },
//   );

//   if (!result) return null;

//   return {
//     orders: result,
//     isNew: Boolean(result?.lastErrorObject?.upserted),
//   };
// };

// Убирает продукт при null
// export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
//   // Извлекаем первый продукт из массива payload.ordersProduct
//   const filter = orderId ? { _id: orderId } : {};

//   const updatePipeline = [
//     // Stage 1: Обновляем массив ordersProduct:
//     {
//       $set: {
//         ordersProduct: {
//           $let: {
//             vars: {
//               newProd: { $arrayElemAt: [payload.ordersProduct, 0] },
//             },
//             in: {
//               $cond: {
//                 // Если продукт с таким _id уже существует:
//                 if: {
//                   $gt: [
//                     {
//                       $size: {
//                         $filter: {
//                           input: { $ifNull: ['$ordersProduct', []] },
//                           as: 'prod',
//                           cond: { $eq: ['$$prod._id', '$$newProd._id'] },
//                         },
//                       },
//                     },
//                     0,
//                   ],
//                 },
//                 then: {
//                   // Проходим по существующему массиву и обновляем продукт с новым количеством,
//                   // либо возвращаем null, если новое количество равно 0 (для последующего удаления)
//                   $map: {
//                     input: { $ifNull: ['$ordersProduct', []] },
//                     as: 'prod',
//                     in: {
//                       $cond: {
//                         if: { $eq: ['$$prod._id', '$$newProd._id'] },
//                         then: {
//                           $cond: {
//                             if: { $gt: ['$$newProd.quantity', 0] },
//                             then: {
//                               $mergeObjects: [
//                                 '$$prod',
//                                 { quantity: '$$newProd.quantity' },
//                               ],
//                             },
//                             else: null,
//                           },
//                         },
//                         else: '$$prod',
//                       },
//                     },
//                   },
//                 },
//                 else: {
//                   // Если продукта с таким _id нет, добавляем его в массив, но только если его количество > 0
//                   $cond: {
//                     if: { $gt: ['$$newProd.quantity', 0] },
//                     then: {
//                       $concatArrays: [
//                         { $ifNull: ['$ordersProduct', []] },
//                         ['$$newProd'],
//                       ],
//                     },
//                     else: { $ifNull: ['$ordersProduct', []] },
//                   },
//                 },
//               },
//             },
//           },
//         },
//       },
//     },
//     // Stage 2: Убираем все null из массива (те продукты, для которых новое quantity равно 0)
//     {
//       $set: {
//         ordersProduct: {
//           $filter: {
//             input: '$ordersProduct',
//             as: 'prod',
//             cond: { $ne: ['$$prod', null] },
//           },
//         },
//       },
//     },
//     // Stage 3: Обновляем общие поля заказа (shipping данные и т.д.)
//     {
//       $set: {
//         name: payload.name, // если поле name необходимо
//         userId: payload.userId,
//         email: payload.email,
//         phone: payload.phone,
//         address: payload.address,
//         order_date: { $ifNull: ['$order_date', new Date()] },
//       },
//     },
//     // Stage 4: Пересчитываем итоговые значения totalPrice и productsCount
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
//     {
//       new: true,
//       upsert: true,
//       ...options,
//     },
//   );

//   if (!result) return null;

//   return {
//     orders: result,
//     isNew: Boolean(result?.lastErrorObject?.upserted),
//   };
// };

// Пока лучший вариант
// export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
//   const filter = orderId ? { _id: orderId } : {};

//   const updatePipeline = [
//     // Stage 1: Формируем итоговый массив ordersProduct как объединение:
//     // а) существующих продуктов, _которые не обновляются_ (их _id отсутствует в payload)
//     // б) продуктов из payload, если для них не установлен флаг удаления.
//     {
//       $set: {
//         ordersProduct: {
//           $concatArrays: [
//             // Сохраняем продукты, которые не затрагиваются обновлением
//             {
//               $filter: {
//                 input: { $ifNull: ['$ordersProduct', []] },
//                 as: 'prod',
//                 cond: {
//                   $not: {
//                     $in: [
//                       { $toString: '$$prod._id' },
//                       {
//                         $map: {
//                           input: { $literal: payload.ordersProduct },
//                           as: 'np',
//                           in: { $toString: '$$np._id' },
//                         },
//                       },
//                     ],
//                   },
//                 },
//               },
//             },
//             // Добавляем продукты из payload, если они не помечены на удаление
//             {
//               $filter: {
//                 input: { $literal: payload.ordersProduct },
//                 as: 'np',
//                 cond: { $not: { $eq: ['$$np.remove', true] } },
//               },
//             },
//           ],
//         },
//       },
//     },
//     // Stage 2: Обновляем контактные/доставочные данные заказа
//     {
//       $set: {
//         userId: payload.userId,
//         email: payload.email,
//         phone: payload.phone,
//         address: payload.address,
//         order_date: { $ifNull: ['$order_date', new Date()] },
//       },
//     },
//     // Stage 3: Пересчитываем итоговые значения заказа
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
//     {
//       new: true,
//       upsert: true,
//       ...options,
//     },
//   );

//   if (!result) return null;

//   return {
//     orders: result,
//     isNew: Boolean(result?.lastErrorObject?.upserted),
//   };
// };

export const upsertOrdersProducts = async (orderId, payload, options = {}) => {
  const filter = orderId ? { _id: orderId } : {};

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

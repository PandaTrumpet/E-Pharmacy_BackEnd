import { ProductsCollection } from '../db/models/products.js';

// export const getAllProducts = async (filter = {}) => {
//   const products = await ProductsCollection.find(filter);
//   return products;
// };

// export const getAllProducts = async (filter = {}, page = 1, limit = 12) => {
//   const skip = (page - 1) * limit; // Сколько пропустить

//   const products = await ProductsCollection.find(filter)
//     .skip(skip) // Пропускаем предыдущие элементы
//     .limit(limit); // Ограничиваем количество

//   const totalProducts = await ProductsCollection.countDocuments(filter); // Общее количество товаров

//   return { products, totalProducts };
// };

export const getAllProducts = async (filter = {}, page = 1, limit) => {
  const skip = (page - 1) * (limit || 0); // Если `limit` не указан, skip = 0 (возьмёт все товары)

  let query = ProductsCollection.find(filter).skip(skip);

  if (limit) {
    query = query.limit(limit); // Применяем `limit`, только если он передан
  }

  const products = await query;
  const totalProducts = await ProductsCollection.countDocuments(filter); // Общее количество товаров

  return { products, totalProducts };
};

export const getProdunctById = async (id) => {
  const product = await ProductsCollection.findById(id);
  return product;
};

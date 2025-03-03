import createHttpError from 'http-errors';
import { getAllProducts, getProdunctById } from '../services/products.js';

// export const getProductsController = async (req, res, next) => {
//   // Извлекаем параметр name из query, если он есть
//   const { name } = req.query;
//   let filter = {};

//   if (name) {
//     // Используем регулярное выражение для поиска по названию (без учета регистра)
//     filter.name = new RegExp(name, 'i');
//   }

//   const products = await getAllProducts(filter);

//   if (!products || products.length === 0) {
//     throw createHttpError(404, 'Products not found');
//   }

//   res.json({
//     status: 200,
//     message: 'Successfully found products!',
//     data: products,
//   });
// };

export const getProductsController = async (req, res, next) => {
  const { name, category } = req.query;
  let filter = {};

  if (name) {
    // Поиск по названию (без учета регистра)
    filter.name = new RegExp(name, 'i');
  }

  if (category) {
    // Фильтрация по точному совпадению категории
    filter.category = category;
  }

  const products = await getAllProducts(filter);

  if (!products || products.length === 0) {
    throw createHttpError(404, 'Products not found');
  }

  res.json({
    status: 200,
    message: 'Successfully found products!',
    data: products,
  });
};

export const getProductByIdController = async (req, res) => {
  const { productId } = req.params;
  if (!productId) {
    throw createHttpError(400, 'Product id is not provided');
  }
  const product = await getProdunctById(productId);
  if (!product) {
    throw createHttpError(404, 'Product not found');
  }
  res.json({
    status: 200,
    message: 'Successfully found product!',
    data: product,
  });
};

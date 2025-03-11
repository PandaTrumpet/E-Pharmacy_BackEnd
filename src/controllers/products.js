import createHttpError from 'http-errors';
import { getAllProducts, getProdunctById } from '../services/products.js';

// export const getProductsController = async (req, res, next) => {
//   const { name, category } = req.query;
//   let filter = {};

//   if (name) {
//     // Поиск по названию (без учета регистра)
//     filter.name = new RegExp(name, 'i');
//   }

//   if (category) {
//     // Фильтрация по точному совпадению категории
//     filter.category = category;
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
  const { name, category, page = 1, limit = 10 } = req.query;

  let filter = {};

  if (name) {
    filter.name = new RegExp(name, 'i');
  }

  if (category) {
    filter.category = category;
  }

  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = parseInt(limit, 10) || 10;

  const { products, totalProducts } = await getAllProducts(
    filter,
    parsedPage,
    parsedLimit,
  );

  if (!products.length) {
    throw createHttpError(404, 'Products not found');
  }

  res.json({
    status: 200,
    message: 'Successfully found products!',
    data: products,
    pagination: {
      currentPage: parsedPage,
      totalPages: Math.ceil(totalProducts / parsedLimit),
      totalProducts,
    },
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

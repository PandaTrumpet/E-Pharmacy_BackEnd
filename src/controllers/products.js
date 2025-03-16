import createHttpError from 'http-errors';
import { getAllProducts, getProdunctById } from '../services/products.js';

export const getProductsController = async (req, res, next) => {
  const { name, category, page, limit } = req.query;

  let filter = {};

  if (name) {
    filter.name = new RegExp(name, 'i');
  }

  if (category) {
    filter.category = category;
  }

  const parsedPage = parseInt(page, 10) || 1;
  const parsedLimit = limit ? parseInt(limit, 10) : undefined;

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
      totalPages: parsedLimit ? Math.ceil(totalProducts / parsedLimit) : 1,
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

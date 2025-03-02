import createHttpError from 'http-errors';
import { getAllProducts, getProdunctById } from '../services/products.js';

export const getProductsController = async (req, res) => {
  const products = await getAllProducts();
  if (!products) {
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

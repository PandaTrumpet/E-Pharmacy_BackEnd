import { ProductsCollection } from '../db/models/products.js';

export const getAllProducts = async (filter = {}) => {
  const products = await ProductsCollection.find(filter);
  return products;
};
export const getProdunctById = async (id) => {
  const product = await ProductsCollection.findById(id);
  return product;
};

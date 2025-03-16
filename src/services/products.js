import { ProductsCollection } from '../db/models/products.js';

export const getAllProducts = async (filter = {}, page = 1, limit) => {
  const skip = (page - 1) * (limit || 0);

  let query = ProductsCollection.find(filter).skip(skip);

  if (limit) {
    query = query.limit(limit);
  }

  const products = await query;
  const totalProducts = await ProductsCollection.countDocuments(filter);

  return { products, totalProducts };
};

export const getProdunctById = async (id) => {
  const product = await ProductsCollection.findById(id);
  return product;
};

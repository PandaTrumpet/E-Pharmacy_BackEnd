import createHttpError from 'http-errors';
import { getStores } from '../services/stores.js';

export const getStoresController = async (req, res) => {
  const stores = await getStores();
  if (!stores) {
    throw createHttpError(404, 'Stores not found');
  }
  res.json({
    status: 200,
    message: 'Stores found successfully!',
    data: stores,
  });
};

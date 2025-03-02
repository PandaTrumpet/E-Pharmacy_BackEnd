import { PharmaciesCollection } from '../db/models/pharmacies.js';

export const getStores = async () => {
  const stores = await PharmaciesCollection.find();
  return stores;
};

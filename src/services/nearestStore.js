import { NearestPharmaciesCollection } from '../db/models/nearest_pharmacies.js';

export const getNearestPharmacies = async () => {
  const nearestPharmacies = await NearestPharmaciesCollection.find();
  return nearestPharmacies;
};

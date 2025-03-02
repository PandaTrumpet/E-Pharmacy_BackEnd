import createHttpError from 'http-errors';
import { getNearestPharmacies } from '../services/nearestStore.js';

export const getNearestPharmaciesController = async (req, res) => {
  const nearestPharmacies = await getNearestPharmacies();
  if (!nearestPharmacies) {
    throw createHttpError(404, 'Nearest pharmacies not found');
  }
  res.json({
    status: '200',
    message: 'Nearest pharmacies found successfully!',
    data: nearestPharmacies,
  });
};

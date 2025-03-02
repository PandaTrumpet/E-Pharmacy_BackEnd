import createHttpError from 'http-errors';
import { getReviews } from '../services/reviews.js';
export const getReviewsController = async (req, res) => {
  const reviews = await getReviews();
  if (!reviews) {
    throw createHttpError(404, 'Reviews not found');
  }
  res.json({
    status: 200,
    message: 'Reviews found successfully!',
    data: reviews,
  });
};

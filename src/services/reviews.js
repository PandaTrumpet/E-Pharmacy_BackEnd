import { ReviewsCollection } from '../db/models/reviews.js';

export const getReviews = async () => {
  const reviews = await ReviewsCollection.find();
  return reviews;
};

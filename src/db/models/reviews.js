import { Schema, model } from 'mongoose';

const reviewsSchema = new Schema(
  {
    customer_id: { type: String, required: true },
    name: { type: String, required: true },
    testimonial: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const ReviewsCollection = model('reviews', reviewsSchema);

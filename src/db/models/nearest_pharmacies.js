import { Schema, model } from 'mongoose';
const nearestPharmaciesSchema = new Schema(
  {
    // pharmacy_id: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    phone: { type: String, required: true },
    rating: { type: Number, required: true },
    status: { type: String, required: true, enum: ['open', 'closed'] },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
export const NearestPharmaciesCollection = model(
  'nearest_pharmacies',
  nearestPharmaciesSchema,
);

import { Schema, model } from 'mongoose';

const suppliersSchema = new Schema(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    suppliers: { type: String, required: true },
    date: { type: String, required: true },
    amount: { type: String, required: true },
    status: {
      type: String,
      required: true,
      eum: ['Active', 'Deactive'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const SuppliersCollection = model('suppliers', suppliersSchema);

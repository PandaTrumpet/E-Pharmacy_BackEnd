import { Schema, model } from 'mongoose';

const customersSchema = new Schema(
  {
    image: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    spent: { type: Number, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    register_date: { type: Date, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const CustomersCollection = model('customers', customersSchema);

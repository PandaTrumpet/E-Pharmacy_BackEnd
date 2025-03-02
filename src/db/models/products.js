import { model, Schema } from 'mongoose';

const productsSchema = new Schema(
  {
    name: { type: String, required: true },
    photo: { type: String, required: true },
    suppliers: { type: String, required: true },
    stock: { type: String, required: true },
    price: { type: String, required: true },
    category: { type: String, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);
export const ProductsCollection = model('products', productsSchema);

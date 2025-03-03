import { Schema, model } from 'mongoose';

const cartsSchema = new Schema(
  {
    cartOrder: [
      {
        name: { type: String, required: true },
        photo: { type: String, required: true },
        suppliers: { type: String, required: true },
        stock: { type: String, required: true },
        price: { type: Number, required: true }, // Был String, исправил на Number
        category: { type: String, required: true },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const CartCollection = model('carts', cartsSchema);

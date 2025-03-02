import { Schema, model } from 'mongoose';

const ordersSchmea = new Schema(
  {
    photo: { type: String, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    products: { type: String, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: [
        'Confirmed',
        'Completed',
        'Cancelled',
        'Pending',
        'Processing',
        'Shipped',
        'Delivered',
      ],
      default: 'Pending',
    },
    order_date: { type: Date, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const OrdersCollection = model('orders', ordersSchmea);

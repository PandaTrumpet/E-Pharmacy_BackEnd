import { Schema, model } from 'mongoose';

const ordersSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'customers',
      required: true,
    },
    photo: {
      type: String,

      // required: true
    },
    name: {
      type: String,
      // required: true,
    },
    ordersProduct: {
      type: Array,
      // required: true,
    },
    address: {
      type: String,
      // required: true
    },
    productsCount: {
      type: Number,
      // required: true
    },
    price: {
      type: Number,
      // required: true,
    },
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
    order_date: {
      type: Date,
      // required: true
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const OrdersCollection = model('orders', ordersSchema);

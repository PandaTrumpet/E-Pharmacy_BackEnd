import { Schema, model } from 'mongoose';

const ordersSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'customers',
      // required: true,
    },

    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    ordersProduct: [
      {
        name: { type: String, required: true, trim: true },
        photo: { type: String, required: true },
        suppliers: { type: String, required: true, trim: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
        remove: { type: Boolean },
        category: {
          type: String,
          required: true,
          trim: true,
          enum: ['Medicine', 'Heart', 'Head', 'Hand', 'Leg'],
        },
      },
    ],

    phone: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      trim: true,
    },

    productsCount: {
      type: Number,
      // default: 0,
      // min: 0,
    },
    totalProducts: {
      type: Number,
    },
    totalPrice: {
      type: Number,
      // default: 0,
      // min: 0,
    },

    paymentMethod: {
      type: String,
      required: true,
      enum: ['cash', 'bank'],
      default: 'cash',
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
      default: Date.now,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export const OrdersCollection = model('orders', ordersSchema);

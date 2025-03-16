import Joi from 'joi';

const orderProductSchema = Joi.object({
  _id: Joi.string().required(),
  name: Joi.string().trim().required(),
  photo: Joi.string().trim().required(),
  suppliers: Joi.string().trim().required(),
  quantity: Joi.number().min(1).required(),
  price: Joi.number().min(0).required(),
  remove: Joi.boolean().optional(),
  category: Joi.string()
    .trim()
    .valid('Medicine', 'Heart', 'Head', 'Hand', 'Leg')
    .required(),
});

export const orderValidationSchema = Joi.object({
  userId: Joi.string().hex().length(24).optional(),
  name: Joi.string().trim().optional(),
  email: Joi.string().trim().lowercase().email().required(),
  ordersProduct: Joi.array().items(orderProductSchema).min(1).required(),
  phone: Joi.string().required(),
  address: Joi.string().trim().optional(),
  productsCount: Joi.number().optional(),
  totalProducts: Joi.number().optional(),
  totalPrice: Joi.number().optional(),
  paymentMethod: Joi.string().valid('cash', 'bank').required(),
  status: Joi.string()
    .valid(
      'Confirmed',
      'Completed',
      'Cancelled',
      'Pending',
      'Processing',
      'Shipped',
      'Delivered',
    )
    .required(),
  order_date: Joi.date().optional(),
});

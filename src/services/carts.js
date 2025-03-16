import { CartCollection } from '../db/models/carts.js';

export const updateCarts = async (cartId, payload) => {
  try {
    let cart;

    if (!cartId) {
      cart = await CartCollection.create({ cartOrder: [payload] });
      return {
        cart,
        isNew: true,
      };
    } else {
      cart = await CartCollection.findByIdAndUpdate(
        cartId,
        { $push: { cartOrder: payload } },
        { new: true, upsert: true },
      );

      if (!cart) return null;

      return {
        cart,
        isNew: false,
      };
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    throw new Error('Failed to update cart');
  }
};

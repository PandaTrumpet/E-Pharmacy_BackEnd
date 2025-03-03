import { CartCollection } from '../db/models/carts.js';

export const updateCarts = async (cartId, payload) => {
  try {
    let cart;

    if (!cartId) {
      // Если ID корзины нет, создаем новую и добавляем объект товара
      cart = await CartCollection.create({ cartOrder: [payload] });
      return {
        cart,
        isNew: true,
      };
    } else {
      // Добавляем новый объект товара в cartOrder (не заменяем массив!)
      cart = await CartCollection.findByIdAndUpdate(
        cartId,
        { $push: { cartOrder: payload } }, // Теперь добавляем **сам объект товара**, а не ID
        { new: true, upsert: true },
      );

      if (!cart) return null;

      return {
        cart,
        isNew: false, // Корзина обновлена
      };
    }
  } catch (error) {
    console.error('Error updating cart:', error);
    throw new Error('Failed to update cart');
  }
};

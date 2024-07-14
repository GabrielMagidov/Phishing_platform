import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    const existingProduct = cart.find((item) => item.id === product.id);
    if (existingProduct) {
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId) => {
    const existingProduct = cart.find((item) => item.id === productId);
    if (existingProduct.quantity > 1) {
      setCart(
        cart.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      );
    } else {
      setCart(cart.filter((item) => item.id !== productId));
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const checkout = (formData) => {
    const purchaseDetails = {
      ...formData,
      items: cart,
      total: cart
        .reduce((sum, item) => sum + item.price * item.quantity, 0)
        .toFixed(2),
    };

    localStorage.setItem("purchaseDetails", JSON.stringify(purchaseDetails));

    clearCart();
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, clearCart, checkout }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;

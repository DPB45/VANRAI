import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

// 1. Create the Context
const CartContext = createContext();

// 2. Create a custom hook to use the context
export const useCart = () => {
  return useContext(CartContext);
};

// 3. Create the Provider component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    // Load cart from local storage on initial load
    try {
      const localData = localStorage.getItem('vanraiCart');
      return localData ? JSON.parse(localData) : [];
    } catch (error) {
      console.error("Could not parse local storage cart", error);
      return [];
    }
  });

  // Save to local storage whenever cartItems changes
  useEffect(() => {
    localStorage.setItem('vanraiCart', JSON.stringify(cartItems));
  }, [cartItems]);

  // --- Cart Logic Functions ---

  // Add an item to the cart
  const addToCart = (product, quantity) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item._id === product._id);

      if (existingItem) {
        // If item exists, update its quantity
        return prevItems.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Only keep what the cart/checkout UI displays and what the order
        // request needs — not the entire product document. The full product
        // (as fetched for display) also carries its complete `reviews` array,
        // `numReviews`, timestamps, etc., which has no reason to be
        // duplicated into every cart line item and persisted to
        // localStorage. The backend independently re-looks-up price/stock
        // by _id when the order is actually placed, so nothing here is
        // trusted for billing anyway — this is purely about not bloating
        // the stored cart with data that's irrelevant to it.
        const { _id, name, price, imageUrl, category, weight, inStock } = product;
        return [...prevItems, { _id, name, price, imageUrl, category, weight, inStock, quantity }];
      }
    });
  };

  // Remove an item from the cart
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      return prevItems.filter((item) => item._id !== productId);
    });
  };

  // Update an item's quantity
  const updateQuantity = (productId, amount) => {
    setCartItems((prevItems) => {
      return prevItems
        .map((item) => {
          if (item._id === productId) {
            const newQuantity = item.quantity + amount;
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0); // Remove item if quantity reaches 0
    });
  };

  // --- NEW FUNCTION: Clear the cart ---
  const clearCart = () => {
    setCartItems([]);
  };

  // Re-sync every cart line with the live product (price, name, image, stock).
  // Prices are snapshotted when an item is added, but the server always bills
  // the CURRENT price, so without this the shopper can see one total and be
  // charged another. Products that no longer exist are dropped.
  const refreshCart = useCallback(async () => {
    const snapshot = JSON.parse(localStorage.getItem('vanraiCart') || '[]');
    if (snapshot.length === 0) return;

    const results = await Promise.all(
      snapshot.map(async (item) => {
        try {
          const { data } = await axios.get(`/api/products/${item._id}`);
          return { item, product: data, gone: false };
        } catch (err) {
          const gone = err.response?.status === 404;
          return { item, product: null, gone };
        }
      })
    );

    setCartItems((prev) =>
      prev
        .map((line) => {
          const match = results.find((r) => r.item._id === line._id);
          if (!match || !match.product) return match?.gone ? null : line;
          const { name, price, imageUrl, category, weight, inStock } = match.product;
          return { ...line, name, price, imageUrl, category, weight, inStock };
        })
        .filter(Boolean)
    );
  }, []);

  // --- Calculations ---

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const shipping = 50.00; // Fixed shipping

  const total = subtotal + shipping;

  // --- Value to provide to children ---
  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart, // <-- Export the new function
    refreshCart,
    subtotal,
    shipping,
    total,
    // Total number of units in the cart (not just distinct products), so the
    // header badge matches what's actually in the cart.
    itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
import React, { createContext, useState, useContext, useEffect } from 'react';

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
        // If new item, add it to the cart
        return [...prevItems, { ...product, quantity: quantity }];
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
    subtotal,
    shipping,
    total,
    itemCount: cartItems.length
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
  // charged another. Products that no longer exist are dropped, and the
  // shopper is told.
  //
  // One batch request (not one per line), and at most once per minute, so
  // moving between Cart and Checkout can't eat into the API rate limit.
  const lastRefreshRef = useRef(0);
  const refreshCart = useCallback(async () => {
    const snapshot = JSON.parse(localStorage.getItem('vanraiCart') || '[]');
    if (snapshot.length === 0) return;
    if (Date.now() - lastRefreshRef.current < 60 * 1000) return;
    lastRefreshRef.current = Date.now();

    let products = [];
    try {
      // The server accepts at most 50 ids per request, so go in chunks; a
      // line missing from the response is then genuinely gone, not just
      // beyond the limit.
      for (let i = 0; i < snapshot.length; i += 50) {
        const ids = snapshot.slice(i, i + 50).map((item) => item._id).join(',');
        const { data } = await axios.get('/api/products', { params: { ids } });
        // A wrong VITE_API_URL can return HTML instead of JSON.
        if (!Array.isArray(data?.products)) throw new Error('Unexpected products response');
        products = products.concat(data.products);
      }
    } catch {
      lastRefreshRef.current = 0; // let the next visit retry
      return; // network/rate-limit problem: keep the cart as-is
    }

    const byId = new Map(products.map((p) => [p._id, p]));
    // Worked out from the snapshot (not inside the state updater below, which
    // React may run later or twice) so the notice is always accurate.
    const removedNames = snapshot.filter((item) => !byId.has(item._id)).map((item) => item.name);

    setCartItems((prev) =>
      prev
        .map((line) => {
          const live = byId.get(line._id);
          // Only drop lines that were part of the refreshed snapshot; an item
          // added while the request was in flight must survive.
          if (!live) return snapshot.some((i) => i._id === line._id) ? null : line;
          const { name, price, imageUrl, category, weight, inStock } = live;
          return { ...line, name, price, imageUrl, category, weight, inStock };
        })
        .filter(Boolean)
    );

    if (removedNames.length > 0) {
      toast.error(
        `${removedNames.join(', ')} ${removedNames.length > 1 ? 'are' : 'is'} no longer available and ${removedNames.length > 1 ? 'were' : 'was'} removed from your cart.`
      );
    }
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
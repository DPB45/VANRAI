import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';

// 1. Create Context
const UserContext = createContext();

// 2. Custom hook to use context
export const useUser = () => {
  return useContext(UserContext);
};

// 3. Provider Component
export const UserProvider = ({ children }) => {
  const [userInfo, setUserInfo] = useState(() => {
    // Load user info from local storage on initial load
    try {
      const storedUser = localStorage.getItem('userInfo');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Could not parse user info from local storage", error);
      return null;
    }
  });

  // The logged-in user's wishlist, stored here (rather than re-fetched by
  // every single product card) as a Set of product ID strings so any card
  // anywhere in the app can immediately show the correct heart state.
  const [wishlist, setWishlist] = useState(new Set());

  // Save user info to local storage whenever it changes
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [userInfo]);

  const refreshWishlist = useCallback(async () => {
    if (!userInfo) {
      setWishlist(new Set());
      return;
    }
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/users/wishlist', config);
      setWishlist(new Set((data || []).map((p) => p._id)));
    } catch (error) {
      // If the token is stale/invalid this will 401 — just leave the
      // wishlist empty rather than throwing inside a background sync.
      console.error('Could not load wishlist', error);
    }
  }, [userInfo]);

  // Load the wishlist whenever the logged-in user changes (login/logout).
  useEffect(() => {
    refreshWishlist();
  }, [refreshWishlist]);

  // Called by product cards right after a successful toggle so every other
  // card in the app updates immediately, without a full re-fetch.
  const setWishlistMembership = (productId, isMember) => {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (isMember) next.add(productId);
      else next.delete(productId);
      return next;
    });
  };

  const isInWishlist = (productId) => wishlist.has(productId);

  // Login function to update state
  const login = (userData) => {
    setUserInfo(userData);
  };

  // Logout function to clear state
  const logout = () => {
    setUserInfo(null);
    setWishlist(new Set());
  };

  // Value provided to children
  const value = {
    userInfo,
    login,
    logout,
    wishlist,
    isInWishlist,
    setWishlistMembership,
    refreshWishlist,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
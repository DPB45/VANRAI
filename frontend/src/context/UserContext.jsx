import React, { createContext, useState, useContext, useEffect } from 'react';

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

  // Save user info to local storage whenever it changes
  useEffect(() => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
  }, [userInfo]);

  // Login function to update state
  const login = (userData) => {
    setUserInfo(userData);
  };

  // Logout function to clear state
  const logout = () => {
    setUserInfo(null);
  };

  // Value provided to children
  const value = {
    userInfo,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
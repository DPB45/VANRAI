import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios'; // <-- Import axios
import App from './App.jsx';
import './index.css';
import './i18n';

// --- 1. Configure Axios Base URL ---
// If VITE_API_URL is set (in production), use it. Otherwise use localhost.
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
// -----------------------------------

// Import Pages
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Contact from './pages/Contact.jsx';
import Login from './pages/Login.jsx';
import AboutUs from './pages/AboutUs.jsx';
import Recipes from './pages/Recipes.jsx';
import RecipeDetails from './pages/RecipeDetails.jsx';
import HelpCenter from './pages/HelpCenter.jsx';
import AccountDashboard from './pages/AccountDashboard.jsx';
import Profile from './pages/Profile.jsx';
import Orders from './pages/Orders.jsx';
import Addresses from './pages/Addresses.jsx';
import Settings from './pages/Settings.jsx';
import OrderDetails from './pages/OrderDetails.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Wishlist from './pages/Wishlist.jsx';

// Admin Imports
import AdminRoute from './components/AdminRoute.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import UserList from './pages/admin/UserList.jsx';
import OrderList from './pages/admin/OrderList.jsx';
import ProductList from './pages/admin/ProductList.jsx';
import ProductEdit from './pages/admin/ProductEdit.jsx';
import Analytics from './pages/admin/Analytics.jsx';

import { CartProvider } from './context/CartContext.jsx';
import { UserProvider } from './context/UserContext.jsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/shop', element: <Shop /> },
      { path: '/product/:id', element: <ProductDetails /> },
      { path: '/cart', element: <Cart /> },
      { path: '/checkout', element: <Checkout /> },
      { path: '/contact', element: <Contact /> },
      { path: '/login', element: <Login /> },
      { path: '/about', element: <AboutUs /> },
      { path: '/recipes', element: <Recipes /> },
      { path: '/recipes/:slug', element: <RecipeDetails /> },
      { path: '/help', element: <HelpCenter /> },
      { path: '/account/dashboard', element: <AccountDashboard /> },
      { path: '/account/profile', element: <Profile /> },
      { path: '/account/orders', element: <Orders /> },
      { path: '/account/addresses', element: <Addresses /> },
      { path: '/account/settings', element: <Settings /> },
      { path: '/order/:id', element: <OrderDetails /> },
      { path: '/forgot-password', element: <ForgotPassword /> },
      { path: '/resetpassword/:token', element: <ResetPassword /> },
      { path: '/wishlist', element: <Wishlist /> },

      // Admin Routes
      {
        path: '/admin',
        element: <AdminRoute />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'userlist', element: <UserList /> },
          { path: 'orderlist', element: <OrderList /> },
          { path: 'productlist', element: <ProductList /> },
          { path: 'product/:id/edit', element: <ProductEdit /> },
          { path: 'analytics', element: <Analytics /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <UserProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </UserProvider>
    </HelmetProvider>
  </React.StrictMode>
);
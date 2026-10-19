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
if (import.meta.env.VITE_API_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL;
} else if (import.meta.env.DEV) {
  axios.defaults.baseURL = 'http://localhost:5001';
} else {
  // A production build without VITE_API_URL would otherwise call the
  // visitor's own localhost:5001 and fail in a confusing way.
  console.error('VITE_API_URL is not set for this build; API requests will fail. Set it in your hosting provider\'s environment variables and redeploy.');
}
// -----------------------------------

// --- 2. Expired / invalid session handling ---
// Tokens last 30 days. When one expires (or is revoked) every authenticated
// call starts returning 401, which used to just surface as scattered "Not
// authorized" errors while the UI still looked logged in. Clear the stale
// session and send the user to log in once, instead. Login attempts
// themselves also return 401 (wrong password), so those are excluded.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const hadToken = Boolean(error.config?.headers?.Authorization);
    const isLoginCall = /\/users\/(login|register)/.test(url);
    if (status === 401 && hadToken && !isLoginCall) {
      localStorage.removeItem('userInfo');
      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Import Pages
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Contact from './pages/Contact.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfService from './pages/TermsOfService.jsx';
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
import MessageList from './pages/admin/MessageList.jsx';

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
      { path: '/privacy-policy', element: <PrivacyPolicy /> },
      { path: '/terms', element: <TermsOfService /> },
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
          { path: 'messages', element: <MessageList /> },
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
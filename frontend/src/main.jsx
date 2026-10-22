import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios'; // <-- Import axios
import toast from 'react-hot-toast';
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
// Several requests often fail together when a token expires; handle it once.
let handlingExpiredSession = false;

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';
    const hadToken = Boolean(error.config?.headers?.Authorization);
    const isLoginCall = /\/users\/(login|register)/.test(url);
    if (status === 401 && hadToken && !isLoginCall && !handlingExpiredSession) {
      handlingExpiredSession = true;
      localStorage.removeItem('userInfo');
      const path = window.location.pathname;
      const needsLogin = /^\/(account|admin|checkout|order|wishlist)/.test(path);
      if (path !== '/login') {
        // Say why first, then move on after a beat, so a shopper who was
        // mid-action understands what happened instead of losing it silently.
        toast.error('Your session expired. Please log in again.');
        setTimeout(() => {
          if (needsLogin) {
            window.location.assign('/login');
          } else {
            // Public page (e.g. a stale token tripped the background wishlist
            // fetch): just drop the dead session, no login screen needed.
            window.location.reload();
          }
        }, 1800);
      } else {
        handlingExpiredSession = false; // already on the login page
      }
    }
    return Promise.reject(error);
  }
);

// --- Pages loaded up-front: the main shopping path ---
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import AdminRoute from './components/AdminRoute.jsx';

// --- Pages loaded on demand (code-split into separate files) ---
// <Suspense> for these lives in App.jsx, around <Outlet />.
const Contact = lazy(() => import('./pages/Contact.jsx'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy.jsx'));
const TermsOfService = lazy(() => import('./pages/TermsOfService.jsx'));
const AboutUs = lazy(() => import('./pages/AboutUs.jsx'));
const Recipes = lazy(() => import('./pages/Recipes.jsx'));
const RecipeDetails = lazy(() => import('./pages/RecipeDetails.jsx'));
const HelpCenter = lazy(() => import('./pages/HelpCenter.jsx'));
const AccountDashboard = lazy(() => import('./pages/AccountDashboard.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const Orders = lazy(() => import('./pages/Orders.jsx'));
const Addresses = lazy(() => import('./pages/Addresses.jsx'));
const Settings = lazy(() => import('./pages/Settings.jsx'));
const OrderDetails = lazy(() => import('./pages/OrderDetails.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'));
const Wishlist = lazy(() => import('./pages/Wishlist.jsx'));

// Admin pages (most visitors never open these)
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard.jsx'));
const UserList = lazy(() => import('./pages/admin/UserList.jsx'));
const OrderList = lazy(() => import('./pages/admin/OrderList.jsx'));
const ProductList = lazy(() => import('./pages/admin/ProductList.jsx'));
const ProductEdit = lazy(() => import('./pages/admin/ProductEdit.jsx'));
const Analytics = lazy(() => import('./pages/admin/Analytics.jsx'));
const MessageList = lazy(() => import('./pages/admin/MessageList.jsx'));

import { CartProvider } from './context/CartContext.jsx';
import { UserProvider } from './context/UserContext.jsx';

// Shown if a page fails to load. The usual cause: a visitor kept the site
// open across a new deploy, so the old page file names no longer exist.
// A reload fetches the new version.
const RouteError = () => (
  <div style={{ padding: '4rem 1rem', textAlign: 'center' }}>
    <p>Something went wrong loading this page.</p>
    <button
      onClick={() => window.location.reload()}
      style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', cursor: 'pointer' }}
    >
      Reload
    </button>
  </div>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <RouteError />,
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
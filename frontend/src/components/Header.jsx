import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import SearchBar from './SearchBar'; // <-- 1. Import SearchBar
import { ShoppingCartIcon, UserIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const Header = () => {
  const { itemCount } = useCart();
  const { userInfo, logout } = useUser();
  const { t } = useTranslation();

  const logoutHandler = () => {
    logout();
    localStorage.removeItem('userInfo');
    // We navigate to '/' since the login page might need to be explicitly accessed later
  };

  return (
    <header className="bg-white shadow-md py-4 px-6 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-3xl font-semibold text-red-700 hover:text-red-800 transition-colors"
        >
          {t('Vanrai Spices')}
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-gray-600 hover:text-red-600">{t('Home')}</Link>
          <Link to="/shop" className="text-gray-600 hover:text-red-600">{t('Shop')}</Link>
          <Link to="/recipes" className="text-gray-600 hover:text-red-600">{t('Recipes')}</Link>
          <Link to="/about" className="text-gray-600 hover:text-red-600">{t('About Us')}</Link>
          <Link to="/contact" className="text-gray-600 hover:text-red-600">{t('Contact Us')}</Link>
        </nav>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">

          <SearchBar /> {/* <-- 2. Add SearchBar here */}

          <LanguageSwitcher />

          {/* Cart */}
          <Link to="/cart" className="relative flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 transition-colors">
            <ShoppingCartIcon className="h-5 w-5" />
            <span>{t('Cart')}</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-red-600 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-red-600">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Account/Logout Button (Conditional) */}
          {userInfo ? (
            <div className="flex items-center gap-4">
              <Link
                to="/account/dashboard"
                className="flex items-center gap-2 text-gray-700 hover:text-red-600 font-medium"
              >
                  <UserIcon className="h-5 w-5"/>
                  Hi, {userInfo.name.split(' ')[0]}
              </Link>
              <button
                onClick={logoutHandler}
                title={t('Logout')}
                className="flex items-center text-gray-500 hover:text-red-600"
              >
                <ArrowLeftOnRectangleIcon className="h-6 w-6" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center gap-2 text-gray-600 hover:text-red-600 font-semibold py-2 px-4 rounded-md border border-gray-300 hover:border-red-600"
            >
              <UserIcon className="h-5 w-5" />
              <span>{t('Account')}</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
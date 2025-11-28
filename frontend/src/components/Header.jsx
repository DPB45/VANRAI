import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import SearchBar from './SearchBar';
import {
  ShoppingCartIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Header = () => {
  const { itemCount, clearCart } = useCart(); // <-- Get clearCart function
  const { userInfo, logout } = useUser();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoutHandler = () => {
    clearCart(); // <-- 1. Clear the cart on logout
    logout();
    localStorage.removeItem('userInfo');
    navigate('/login');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link
            to="/"
            className="text-2xl md:text-3xl font-semibold text-red-700 hover:text-red-800 transition-colors flex-shrink-0"
          >
            {t('Vanrai Spices')}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-gray-600 hover:text-red-600 font-medium">{t('Home')}</Link>
            <Link to="/shop" className="text-gray-600 hover:text-red-600 font-medium">{t('Shop')}</Link>
            <Link to="/recipes" className="text-gray-600 hover:text-red-600 font-medium">{t('Recipes')}</Link>
            <Link to="/about" className="text-gray-600 hover:text-red-600 font-medium">{t('About Us')}</Link>
            <Link to="/contact" className="text-gray-600 hover:text-red-600 font-medium">{t('Contact Us')}</Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3 md:space-x-4">

            <div className="hidden md:block">
               <SearchBar />
            </div>

            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-red-600">
              <ShoppingCartIcon className="h-6 w-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Desktop Account Button */}
            <div className="hidden lg:block">
              {userInfo ? (
                <div className="flex items-center gap-3">
                  <Link to="/account/dashboard" className="flex items-center gap-1 text-gray-700 hover:text-red-600 font-medium">
                      <UserIcon className="h-5 w-5"/>
                      <span className="max-w-[100px] truncate">{userInfo.name.split(' ')[0]}</span>
                  </Link>
                  <button onClick={logoutHandler} title={t('Logout')} className="text-gray-500 hover:text-red-600">
                    <ArrowLeftOnRectangleIcon className="h-6 w-6" />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="flex items-center gap-1 text-gray-600 hover:text-red-600 font-semibold border px-3 py-1.5 rounded-md hover:border-red-600 transition-all">
                  <UserIcon className="h-5 w-5" />
                  <span>{t('Account')}</span>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 text-gray-600 hover:text-red-600 focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-7 w-7" />
              ) : (
                <Bars3Icon className="h-7 w-7" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-gray-100 animate-fade-in-down">
            <div className="mt-4 mb-4">
                <SearchBar />
            </div>

            <nav className="flex flex-col space-y-3">
              <Link to="/" className="text-gray-700 hover:text-red-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('Home')}</Link>
              <Link to="/shop" className="text-gray-700 hover:text-red-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('Shop')}</Link>
              <Link to="/recipes" className="text-gray-700 hover:text-red-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('Recipes')}</Link>
              <Link to="/about" className="text-gray-700 hover:text-red-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('About Us')}</Link>
              <Link to="/contact" className="text-gray-700 hover:text-red-600 font-medium py-2 border-b border-gray-50" onClick={() => setIsMobileMenuOpen(false)}>{t('Contact Us')}</Link>

              <div className="pt-2">
                  {userInfo ? (
                    <div className="flex flex-col space-y-3">
                       <Link to="/account/dashboard" className="flex items-center gap-2 text-gray-700 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                          <UserIcon className="h-5 w-5"/> My Dashboard
                       </Link>
                       <button onClick={logoutHandler} className="flex items-center gap-2 text-gray-500 hover:text-red-600 text-left">
                          <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Logout
                       </button>
                    </div>
                  ) : (
                    <Link to="/login" className="flex items-center gap-2 text-gray-700 font-medium" onClick={() => setIsMobileMenuOpen(false)}>
                        <UserIcon className="h-5 w-5" /> Login / Sign Up
                    </Link>
                  )}
              </div>

              <div className="pt-2">
                 <LanguageSwitcher />
              </div>
            </nav>
          </div>
        )}

      </div>
    </header>
  );
};

export default Header;
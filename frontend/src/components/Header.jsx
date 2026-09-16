import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import {
  ShoppingCartIcon,
  UserIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

// One shared definition for the primary nav, so the desktop and mobile
// menus can never drift out of sync with each other.
const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/shop', label: 'Shop' },
  { to: '/recipes', label: 'Recipes' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact Us' },
];

// A nav link whose underline grows in from the left on hover, and stays
// filled in on the current route - motion that responds to the person
// (hover) or state (active route), not a scripted entrance animation.
const NavItem = ({ to, end, children, onClick }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `group relative py-1 font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 rounded-sm ${
        isActive ? 'text-red-700' : 'text-gray-600 hover:text-red-600'
      }`
    }
  >
    {({ isActive }) => (
      <>
        {children}
        <span
          className={`pointer-events-none absolute -bottom-1 left-0 h-[2px] rounded-full bg-gradient-to-r from-red-600 to-amber-500 transition-all duration-300 ease-out ${
            isActive ? 'w-full' : 'w-0 group-hover:w-full'
          }`}
        />
      </>
    )}
  </NavLink>
);

const Header = () => {
  const { itemCount } = useCart();
  const { userInfo, logout } = useUser();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const logoutHandler = () => {
    // NOTE: we intentionally do NOT clear the cart here. Logging out
    // shouldn't destroy items a guest or user has added — the cart is
    // device-local and should persist across login/logout on the same device.
    logout();
    localStorage.removeItem('userInfo');
    navigate('/login');
    closeMobileMenu();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-sm">
      {/* The one deliberately bold touch on an otherwise quiet header: a
          slim chili-to-turmeric gradient line, the two colors this store
          is literally built on. */}
      <div className="h-[3px] w-full bg-gradient-to-r from-red-700 via-red-500 to-amber-400" />

      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between gap-4">

          {/* Logo / Wordmark */}
          <Link
            to="/"
            className="group flex flex-shrink-0 items-center gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 rounded-sm"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8 text-red-700 transition-transform duration-300 ease-out group-hover:-rotate-6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 21C12 21 4 16.5 4 9.5C4 5 7.5 2 12 2C16.5 2 20 5 20 9.5C20 16.5 12 21 12 21Z"
                fill="currentColor"
                fillOpacity="0.12"
              />
              <path
                d="M12 21V6M12 6C9 6 6 4.5 5 2M12 6C15 6 18 4.5 19 2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="leading-none">
              <span className="block font-display text-[1.7rem] font-bold tracking-tight text-red-700 transition-colors group-hover:text-red-800">
                Vanrai
              </span>
              <span className="mt-0.5 block text-[0.65rem] font-semibold tracking-[0.22em] text-amber-600">
                SPICES
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <NavItem key={link.to} to={link.to} end={link.end}>
                {link.label}
              </NavItem>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1 md:gap-2">

            <Link
              to="/wishlist"
              title="Wishlist"
              className="rounded-full p-2.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              <HeartIcon className="h-5 w-5" />
            </Link>

            <Link
              to="/cart"
              title="Cart"
              className="relative rounded-full p-2.5 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white ring-2 ring-white">
                  {itemCount}
                </span>
              )}
            </Link>

            <div className="mx-1 hidden h-6 w-px bg-gray-200 lg:block" />

            {/* Desktop Account */}
            <div className="hidden lg:flex items-center">
              {userInfo ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/account/dashboard"
                    className="group flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                  >
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700">
                      {userInfo.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[100px] truncate font-medium text-gray-700 group-hover:text-red-700">
                      {userInfo.name.split(' ')[0]}
                    </span>
                  </Link>
                  <button
                    onClick={logoutHandler}
                    title="Logout"
                    className="rounded-full p-2.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                  >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40"
                >
                  <UserIcon className="h-4 w-4" />
                  Account
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="rounded-full p-2.5 text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/40 lg:hidden"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="animate-fade-in-down border-t border-gray-100 pb-5 pt-3 lg:hidden">
            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `rounded-lg px-2 py-2.5 font-medium transition-colors ${
                      isActive ? 'bg-red-50 text-red-700' : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}

              <Link
                to="/wishlist"
                onClick={closeMobileMenu}
                className="flex items-center gap-2 rounded-lg px-2 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
              >
                <HeartIcon className="h-5 w-5" /> My Wishlist
              </Link>

              <div className="mt-2 border-t border-gray-100 pt-3">
                {userInfo ? (
                  <div className="flex flex-col gap-1">
                    <Link
                      to="/account/dashboard"
                      onClick={closeMobileMenu}
                      className="flex items-center gap-2 rounded-lg px-2 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-red-600"
                    >
                      <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-700">
                        {userInfo.name.charAt(0).toUpperCase()}
                      </span>
                      My Dashboard
                    </Link>
                    <button
                      onClick={logoutHandler}
                      className="flex items-center gap-2 rounded-lg px-2 py-2.5 text-left font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-red-600"
                    >
                      <ArrowLeftOnRectangleIcon className="h-5 w-5" /> Logout
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="flex items-center justify-center gap-1.5 rounded-full bg-red-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-red-700"
                  >
                    <UserIcon className="h-4 w-4" /> Login / Sign Up
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
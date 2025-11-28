import React from 'react';
import { Link } from 'react-router-dom';
// Importing social icons - from the correct 'fa6' path
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa6';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">

        {/* Top Section: Links */}
        <div className="flex flex-col md:flex-row justify-between text-center md:text-left mb-8">

          {/* Quick Links */}
          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold text-gray-800 mb-3">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/about" className="text-gray-600 hover:text-red-600">About Us</Link>
              <Link to="/contact" className="text-gray-600 hover:text-red-600">Contact Us</Link>
              <Link to="/help" className="text-gray-600 hover:text-red-600">Help & FAQs</Link>
              <Link to="/help" className="text-gray-600 hover:text-red-600">Return Policy</Link>
            </nav>
          </div>

          {/* Company */}
          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold text-gray-800 mb-3">Company</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/about" className="text-gray-600 hover:text-red-600">Our Story</Link>
              <Link to="/recipes" className="text-gray-600 hover:text-red-600">Blog & Recipes</Link>
              <Link to="/contact" className="text-gray-600 hover:text-red-600">Privacy Policy</Link>
              <Link to="/contact" className="text-gray-600 hover:text-red-600">Terms of Service</Link>
            </nav>
          </div>

          {/* Shop */}
          <div className="mb-6 md:mb-0">
            <h3 className="font-semibold text-gray-800 mb-3">Shop</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/shop" className="text-gray-600 hover:text-red-600">All Spices</Link>
              <Link to="/shop" className="text-gray-600 hover:text-red-600">Masalas</Link>
              <Link to="/shop" className="text-gray-600 hover:text-red-600">Best Sellers</Link>
              <Link to="/shop" className="text-gray-600 hover:text-red-600">Herbs</Link>
            </nav>
          </div>

        </div>

        {/* Bottom Section: Socials & Copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center border-t border-gray-100 pt-6">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} Vanrai Spices. All rights reserved.
          </p>

          <div className="flex space-x-4">
            <a href="#" className="text-gray-500 hover:text-red-600">
              <FaFacebookF className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-red-600">
              <FaInstagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-red-600">
              <FaLinkedinIn className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-500 hover:text-red-600">
              <FaYoutube className="w-5 h-5" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
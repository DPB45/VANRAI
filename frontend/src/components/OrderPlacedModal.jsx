import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/solid';

const OrderPlacedModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      {/* Modal */}
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Icon */}
        <CheckCircleIcon className="w-16 h-16 text-red-600 mx-auto mb-4" />

        {/* Content */}
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Placed!</h2>
        <p className="text-gray-600 mb-6">
          Your order has been placed successfully! Thank you for shopping with
          Vanrai Spices. Your order will be delivered soon.
        </p>

        {/* Action Button */}
        <Link
          to="/shop"
          onClick={onClose}
          className="w-full bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderPlacedModal;
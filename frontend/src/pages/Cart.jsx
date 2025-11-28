import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext'; // Import the custom hook
import { PlusIcon, MinusIcon, TrashIcon } from '@heroicons/react/24/outline';

// This is the component for a single item in the cart
const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <div className="flex items-center justify-between py-6 border-b border-gray-200">
      <div className="flex items-center">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="ml-6">
          <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
          <p className="text-gray-500">200g</p>
        </div>
      </div>
      <div className="flex items-center gap-8">
        {/* Quantity Selector */}
        <div className="flex items-center border border-gray-300 rounded-md">
          <button
            onClick={() => updateQuantity(item._id, -1)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-l-md"
          >
            <MinusIcon className="w-5 h-5" />
          </button>
          <span className="px-4 text-lg font-semibold">{item.quantity}</span>
          <button
            onClick={() => updateQuantity(item._id, 1)}
            className="p-2 text-gray-700 hover:bg-gray-100 rounded-r-md"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>
        {/* Price */}
        <p className="text-lg font-semibold text-gray-800">
          ₹{(item.price * item.quantity).toFixed(2)}
        </p>
        {/* Remove Button */}
        <button
          onClick={() => removeFromCart(item._id)}
          className="text-gray-400 hover:text-red-600"
        >
          <TrashIcon className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

// This is the main Cart page component
const Cart = () => {
  const { cartItems, subtotal, shipping, total, itemCount } = useCart();

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Your Shopping Cart</h1>
        <p className="text-xl text-gray-600 mb-8">Your cart is currently empty.</p>
        <Link
          to="/shop"
          className="bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors"
        >
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        Your Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Cart Items List (Left/Main) */}
        <div className="lg:col-span-2">
          {cartItems.map((item) => (
            <CartItem key={item._id} item={item} />
          ))}
        </div>

        {/* Order Summary (Right/Sidebar) */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Subtotal:</span>
                <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="text-gray-600">Shipping:</span>
                <span className="font-semibold text-gray-800">₹{shipping.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-300 my-4"></div>
              <div className="flex justify-between text-2xl font-bold">
                <span className="text-gray-800">Total:</span>
                <span className="text-red-600">₹{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Link
                to="/checkout"
                className="w-full block text-center bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors"
              >
                Checkout
              </Link>
              <Link
                to="/shop"
                className="w-full block text-center bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-md hover:bg-gray-50 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline'; // Outline icon
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';   // Solid icon
import { useUser } from '../context/UserContext'; // For auth check and token
import toast from 'react-hot-toast';
import axios from 'axios';

// Function to render stars (no changes)
const renderRating = (rating) => {
  let stars = [];
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;

  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`full-${i}`} className="text-yellow-400">&#9733;</span>);
  }
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} className="text-gray-300">&#9733;</span>);
  }
  return stars;
};

const ShopProductCard = ({ product }) => {
    const { userInfo } = useUser();
    const [isWishlisted, setIsWishlisted] = useState(false);

    // Placeholder weights (remains the same)
    const productWeights = { /* ... */ };
    const weight = productWeights[product.name] || '100g';

    // --- Wishlist Logic ---
    const toggleWishlist = async () => {
        if (!userInfo) {
            toast.error("Please log in to save items to your wishlist.");
            return;
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
            };

            const { data } = await axios.put(
                '/api/users/wishlist',
                { productId: product._id }, // Send the product's ID
                config
            );

            setIsWishlisted(data.isAdded);
            toast.success(data.message, {
                icon: data.isAdded ? '❤️' : '💔',
            });

        } catch (error) {
            toast.error("Failed to update wishlist.");
            console.error("Wishlist toggle error:", error);
        }
    };
    // -----------------------

    // --- Initial Check (Simplified: Assumes data comes back with isWishlisted flag, or we fetch the list globally) ---
    // For a simple functional demo, we'll assume the status is managed by the toggle only.
    // A robust app would check the user's initial wishlist on app load.

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl relative">

            {/* Wishlist Icon */}
            {userInfo && (
                <button
                    onClick={toggleWishlist}
                    className="absolute top-3 right-3 p-1 rounded-full bg-white/70 z-10 text-red-600 transition-colors"
                >
                    {isWishlisted ? (
                        <HeartIconSolid className="w-6 h-6 animate-pulse" /> // Solid heart if wished
                    ) : (
                        <HeartIconOutline className="w-6 h-6 hover:text-red-600" /> // Outline heart otherwise
                    )}
                </button>
            )}

            <Link to={`/product/${product._id}`} className="block">
                <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-56 object-cover"
                />
                <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-2">{weight}</p>
                    <div className="flex justify-between items-center">
                        <p className="text-xl font-bold text-red-600">₹{product.price.toFixed(2)}</p>
                        <div className="flex items-center">
                            {renderRating(product.rating)}
                            <span className="text-gray-600 text-sm ml-1">({product.rating})</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default ShopProductCard;
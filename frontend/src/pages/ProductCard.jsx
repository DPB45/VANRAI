import React from 'react';
import { Link } from 'react-router-dom';

// Function to render stars
const renderRating = (rating) => {
  let stars = [];
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(<span key={`full-${i}`} className="text-yellow-400">&#9733;</span>);
  }
  // Half star
  if (halfStar) {
    stars.push(<span key="half" className="text-yellow-400">&#9734;</span>); // Using empty star as half-star placeholder
  }
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<span key={`empty-${i}`} className="text-gray-300">&#9733;</span>);
  }
  return stars;
};

const ProductCard = ({ product }) => {
  // A simple handler for the cart button
  const handleAddToCart = () => {
    console.log(`Added ${product.name} to cart.`);
    // In a real app, you would dispatch an action to your cart context/state
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl flex flex-col">
      <Link to={`/product/${product._id}`} className="block">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <Link to={`/product/${product._id}`} className="hover:text-red-600">
          <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate">{product.name}</h3>
        </Link>
        <div className="flex items-center mb-2">
          {renderRating(product.rating)}
          <span className="text-gray-600 text-sm ml-1">({product.rating})</span>
        </div>
        <p className="text-xl font-bold text-gray-900 mb-3">₹{product.price.toFixed(2)}</p>

        <button
          onClick={handleAddToCart}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors duration-300 mt-auto"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
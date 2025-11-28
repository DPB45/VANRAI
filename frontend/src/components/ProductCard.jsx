import React from 'react';
import { Link } from 'react-router-dom';

// Function to render stars
const renderRating = (rating) => {
  let stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(<span key={i} className="text-yellow-400">&#9733;</span>); // Full star
    } else {
      stars.push(<span key={i} className="text-gray-300">&#9733;</span>); // Empty star
    }
  }
  return stars;
};

const ProductCard = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105">
      <Link to={`/product/${product._id}`}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-56 object-cover"
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{product.name}</h3>
          <p className="text-sm text-gray-500 mb-2 h-10">{product.description}</p>
          <div className="flex justify-between items-center mb-2">
            <p className="text-xl font-bold text-gray-900">₹{product.price.toFixed(2)}</p>
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

export default ProductCard;
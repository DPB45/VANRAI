import React from 'react';
import { Link } from 'react-router-dom';

// Function to render stars (empty stars)
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

const RelatedProductCard = ({ product }) => {
  // Create a fake "original price" based on the image's style
  const originalPrice = (product.price * 1.15).toFixed(2);

  return (
    <div className="bg-white text-center">
      <Link to={`/product/${product._id}`} className="block">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-56 object-cover rounded-lg shadow-md mb-4"
        />
        <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
        <div className="flex justify-center items-baseline gap-2 my-2">
          {/* Using text-red-600 for the main price, but image shows black. Adjust if needed */}
          <span className="text-xl font-bold text-gray-900">₹{product.price.toFixed(2)}</span>
          {/* The image doesn't show an original price for all items, but this matches the style */}
          {/* <span className="text-md text-gray-400 line-through">₹{originalPrice}</span> */}
        </div>
        <div className="flex justify-center items-center">
          {renderRating(product.rating)}
          <span className="text-gray-600 text-sm ml-1">({product.rating})</span>
        </div>
      </Link>
    </div>
  );
};

export default RelatedProductCard;
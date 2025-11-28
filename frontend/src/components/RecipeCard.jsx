import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, ClockIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

const RecipeCard = ({ post }) => {
  const isVideo = post.type === 'video';

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col">
      <Link to={`/recipes/${post.slug}`} className="block">
        <img
          src={post.imageUrl}
          alt={post.title}
          className="w-full h-56 object-cover"
        />
      </Link>
      <div className="p-6 flex flex-col flex-grow">
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <Link to={`/recipes/${post.slug}`} className="hover:text-red-600">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{post.title}</h3>
        </Link>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 flex-grow">{post.description}</p>

        {/* Meta */}
        <div className="text-sm text-gray-500 border-t border-gray-100 pt-4 mt-auto">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                {post.prepTime}
              </span>
              <span className="flex items-center gap-1.5">
                <ClockIcon className="w-4 h-4" />
                {post.totalTime}
              </span>
            </div>

            <Link
              to={`/recipes/${post.slug}`}
              className="flex items-center gap-1.5 text-red-600 font-semibold hover:underline"
            >
              {isVideo ? (
                <>
                  <PlayCircleIcon className="w-5 h-5" />
                  Watch More
                </>
              ) : (
                <>
                  <BookOpenIcon className="w-5 h-5" />
                  Read More
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
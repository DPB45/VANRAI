import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recipeData } from '../data/recipeData'; // Import the shared data
import { ClockIcon, TagIcon } from '@heroicons/react/24/outline';

// This component renders either an article or a recipe with ingredients/steps
const RecipeContent = ({ recipe }) => {

  // Check what kind of content we have
  const hasVideo = recipe.content.videoUrl && !recipe.content.videoUrl.includes('placeholder');
  const hasArticle = recipe.content.articleBody;
  const hasRecipeSteps = recipe.content.ingredients && recipe.content.steps;

  return (
    <div className="prose prose-lg max-w-none">

      {/* 1. Show Video if it's real */}
      {hasVideo && (
        <div className="aspect-w-16 aspect-h-9 mb-12 rounded-lg overflow-hidden shadow-lg">
          <iframe
            src={recipe.content.videoUrl}
            title={recipe.title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          ></iframe>
        </div>
      )}

      {/* 2. Show Article Body if it exists */}
      {hasArticle && (
        <div className="text-gray-700">
          {recipe.content.articleBody.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      )}

      {/* 3. Show Ingredients and Steps if they exist */}
      {hasRecipeSteps && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Ingredients</h3>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {recipe.content.ingredients.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Steps</h3>
            <ol className="list-decimal pl-5 space-y-4 text-gray-700">
              {recipe.content.steps.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

// Main Recipe Details Page
const RecipeDetails = () => {
  const { slug } = useParams();
  const recipe = recipeData.find((r) => r.slug === slug);

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!recipe) {
    return (
      <div className="container mx-auto p-12 text-center">
        <h1 className="text-3xl font-bold text-red-600">Recipe Not Found</h1>
        <p className="mt-4">We couldn't find the recipe you were looking for.</p>
        <Link
          to="/recipes"
          className="mt-6 inline-block bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700"
        >
          Back to all Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* 1. Hero Image */}
      <div className="relative h-[400px] w-full">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. Main Content Area */}
      <div className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            {recipe.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {recipe.description}
          </p>

          {/* Meta Info */}
          <div className="flex justify-center flex-wrap gap-4 md:gap-8 mt-6 text-gray-500">
            <div className="flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              <span className="font-medium">{recipe.tags.join(', ')}</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span>Prep: <span className="font-medium">{recipe.prepTime}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5" />
              <span>Total Time: <span className="font-medium">{recipe.totalTime}</span></span>
            </div>
          </div>
        </div>

        {/* 3. Recipe/Article Content */}
        <RecipeContent recipe={recipe} />
      </div>
    </div>
  );
};

export default RecipeDetails;
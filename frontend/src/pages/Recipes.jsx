import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from '@heroicons/react/24/solid';
import RecipeCard from '../components/RecipeCard';
import { recipeData } from '../data/recipeData'; // Import data

// Reusable filter tab
const FilterTab = ({ title, activeCategory, setActiveCategory }) => (
  <button
    onClick={() => setActiveCategory(title)}
    className={`pb-2 text-gray-600 hover:text-red-600
      ${activeCategory === title
        ? 'border-b-2 border-red-600 text-red-600 font-semibold'
        : 'border-b-2 border-transparent'
      }
    `}
  >
    {title}
  </button>
);

// Main Recipes Page
const Recipes = () => {
  const [activeCategory, setActiveCategory] = useState('All Recipes'); // Default remains "All Recipes"
  const [sortBy, setSortBy] = useState('Newest');

  // This will filter and sort the recipes whenever the state changes
  const displayRecipes = useMemo(() => {
    // 1. Filtering
    let filtered = [];

    if (activeCategory === 'All Recipes') {
      filtered = recipeData;
    } else if (activeCategory === 'Sutra Delights') {
      // Filter logic remains the same
      filtered = recipeData.filter(p => p.tags.includes('Curry') || p.tags.includes('Dinner'));
    } else if (activeCategory === 'Sweet Treats') {
      filtered = recipeData.filter(p => p.tags.includes('Sweet'));
    } else if (activeCategory === 'Quick Meals') {
      filtered = recipeData.filter(p => p.tags.includes('Quick Meal'));
    } else if (activeCategory === 'Healthy Choices') {
      filtered = recipeData.filter(p => p.tags.includes('Healthy'));
    } else {
      filtered = recipeData; // Fallback
    }

    // 2. Sorting
    let sorted = [...filtered];
    if (sortBy === 'Title (A-Z)') {
      sorted.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'Title (Z-A)') {
      sorted.sort((a, b) => b.title.localeCompare(a.title));
    }

    return sorted;
  }, [activeCategory, sortBy]);

  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <section className="relative h-[450px] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=1974&auto.format&fit=crop')",
          }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Mastering the Art of Authentic Indian Curries
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            This is the A-to-Z listing of our best-in-class Indian curry
            recipes designed and categorized for your culinary mastery.
          </p>
          <Link
            to="/recipes/ultimate-chicken-tikka-masala"
            className="bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors duration-300"
          >
            Read Full Recipe
          </Link>
        </div>
      </section>

      {/* 2. Filters & Articles Section */}
      <section className="container mx-auto px-4 py-16">
        {/* Filter/Sort Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 mb-8">
          {/* Tabs */}
          <div className="flex flex-wrap gap-6">
            <FilterTab title="All Recipes" activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
            {/* --- The "Video Guides" FilterTab is removed from here --- */}
            <FilterTab title="Sutra Delights" activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
            <FilterTab title="Sweet Treats" activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
            <FilterTab title="Quick Meals" activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
            <FilterTab title="Healthy Choices" activeCategory={activeCategory} setActiveCategory={setActiveCategory} />
          </div>
          {/* Sort By */}
          <div className="relative mt-4 md:mt-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-gray-600 appearance-none bg-transparent border-none pr-8 focus:outline-none focus:ring-0"
            >
              <option value="Newest">Sort by: Newest</option>
              <option value="Title (A-Z)">Sort by: Title (A-Z)</option>
              <option value="Title (Z-A)">Sort by: Title (Z-A)</option>
            </select>
            <ChevronDownIcon className="w-4 h-4 text-gray-600 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Section Title */}
        <h2 className="text-3xl font-bold text-gray-800 mb-8">
          Explore Our Latest Recipes & Articles
        </h2>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayRecipes.length > 0 ? (
            displayRecipes.map((post) => (
              <RecipeCard key={post.slug} post={post} />
            ))
          ) : (
            <p className="text-gray-500 md:col-span-3 text-center">
              No recipes found for this category.
            </p>
          )}
        </div>
      </section>

      {/* 3. Newsletter Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Join Our Culinary Journey!
          </h2>
          <p className="text-gray-600 mb-8">
            Get exclusive recipes, cooking tips, and special offers directly to your inbox. Don't
            miss out on the rich flavors of Vanrai Spices!
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Your email address"
              className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <button
              type="submit"
              className="bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Recipes;
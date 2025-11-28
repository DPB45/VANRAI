import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

// A reusable component for each filter section
const FilterSection = ({ title, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-4">
      <h3
        className="font-semibold text-gray-800 flex justify-between items-center cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{title}</span>
        {isOpen ? (
          <ChevronUpIcon className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="w-5 h-5 text-gray-400" />
        )}
      </h3>
      {isOpen && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  );
};

// Reusable Checkbox component
const Checkbox = ({ label, name, checked, onChange }) => (
  <label className="flex items-center text-gray-600 cursor-pointer text-sm">
    <input
      type="checkbox"
      name={name}
      className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
      checked={checked}
      onChange={onChange}
    />
    <span className="ml-2">{label}</span>
  </label>
);

// FiltersSidebar component
const FiltersSidebar = ({ onFilterChange, currentFilters }) => {
  // Use local state to manage inputs, then sync to parent via onFilterChange
  const [categories, setCategories] = useState(currentFilters.categories.reduce((acc, cat) => ({ ...acc, [cat]: true }), { spices: false, masalas: false, herbs: false }));
  const [price, setPrice] = useState(currentFilters.maxPrice);
  const [availability, setAvailability] = useState(currentFilters.availability);


  // --- Filter Handlers ---
  const handleCategoryChange = (e) => {
    const { name, checked } = e.target;
    setCategories((prev) => ({ ...prev, [name]: checked }));
  };

  const handlePriceChange = (e) => {
    setPrice(Number(e.target.value));
  };

  const handleAvailabilityChange = (e) => {
    const { name, checked } = e.target;
    setAvailability((prev) => ({ ...prev, [name]: checked }));
  };

  const clearFilters = () => {
    setCategories({ spices: false, masalas: false, herbs: false });
    setPrice(500);
    setAvailability({ inStock: false, outOfStock: false });
    onFilterChange({
        categories: [],
        maxPrice: 500,
        availability: { inStock: false, outOfStock: false },
        sortBy: 'Popularity' // Reset sort preference too
    });
  };

  // --- Effect to send filter changes to parent ---
  useEffect(() => {
    // Get active categories list (e.g., ['spices', 'masalas'])
    const activeCategories = Object.keys(categories).filter(
      (key) => categories[key]
    );

    // Call the onFilterChange function passed from Shop.jsx
    onFilterChange({
      categories: activeCategories,
      maxPrice: price,
      availability: availability,
    });
  }, [categories, price, availability, onFilterChange]);


  return (
    <aside className="w-full lg:w-1/4 pr-8 sticky top-24 self-start"> {/* Added sticky for better UX */}
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Filters</h2>

      <FilterSection title="Category" defaultOpen={true}>
        <Checkbox
          label="Masalas (Blends)"
          name="masalas"
          checked={categories.masalas}
          onChange={handleCategoryChange}
        />
        <Checkbox
          label="Spices (Powders/Whole)"
          name="spices"
          checked={categories.spices}
          onChange={handleCategoryChange}
        />
        <Checkbox
          label="Herbs"
          name="herbs"
          checked={categories.herbs}
          onChange={handleCategoryChange}
        />
      </FilterSection>

      <FilterSection title="Price" defaultOpen={true}>
        <input
          type="range"
          min="50"
          max="500"
          value={price}
          onChange={handlePriceChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer range-thumb-red"
        />
        <div className="flex justify-between text-gray-600 text-sm mt-2">
          <span>₹50</span>
          <span>Max: ₹{price}</span>
        </div>
      </FilterSection>

      <FilterSection title="Availability" defaultOpen={true}>
        <Checkbox
          label="In Stock"
          name="inStock"
          checked={availability.inStock}
          onChange={handleAvailabilityChange}
        />
        <Checkbox
          label="Out of Stock"
          name="outOfStock"
          checked={availability.outOfStock}
          onChange={handleAvailabilityChange}
        />
      </FilterSection>

      <button
        onClick={clearFilters}
        className="mt-6 w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50"
      >
        Clear Filters
      </button>
    </aside>
  );
};

export default FiltersSidebar;
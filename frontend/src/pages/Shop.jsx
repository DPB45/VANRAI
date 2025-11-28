import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import FiltersSidebar from '../components/FiltersSidebar';
import ShopProductCard from '../components/ShopProductCard';
import { Squares2X2Icon, Bars3Icon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

// Helper function to extract search params from URL
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

// Pagination component
const Pagination = ({ page, pages, keyword = '' }) => {
    const navigate = useNavigate();

    if (pages <= 1) return null;

    const items = [...Array(pages).keys()];

    const paginateHandler = (pageNumber) => {
        // Preserves search keyword when navigating pages
        navigate(`/shop?keyword=${keyword}&pageNumber=${pageNumber}`);
    };

    return (
        <div className="flex justify-center items-center mt-12">
            <nav className="flex items-center gap-2">
                <button
                    onClick={() => paginateHandler(page - 1)}
                    disabled={page === 1}
                    className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-50"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>

                {items.map((x) => (
                    <button
                        key={x + 1}
                        onClick={() => paginateHandler(x + 1)}
                        className={`w-8 h-8 rounded-md font-medium transition-colors ${
                            x + 1 === page
                                ? 'text-white bg-red-600'
                                : 'text-gray-500 hover:bg-gray-100'
                        }`}
                    >
                        {x + 1}
                    </button>
                ))}

                <button
                    onClick={() => paginateHandler(page + 1)}
                    disabled={page === pages}
                    className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-50"
                >
                    <ChevronRightIcon className="w-5 h-5" />
                </button>
            </nav>
        </div>
    );
};


const Shop = () => {
  const query = useQuery();
  const keyword = query.get('keyword') || '';
  const pageNumber = query.get('pageNumber') || 1; // Default to page 1

  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1); // Total number of pages
  const [page, setPage] = useState(1); // Current page number

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State for advanced filtering (applied locally after server fetch)
  const [currentFilters, setCurrentFilters] = useState({
      categories: [],
      maxPrice: 500,
      availability: { inStock: false, outOfStock: false },
      sortBy: 'Popularity'
  });

  // --- Fetch Products with Search & Pagination ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // API call includes keyword and page number
        const url = `/api/products?keyword=${keyword}&pageNumber=${pageNumber}`;
        const { data } = await axios.get(url);

        // --- CORE FIX: Destructure the paged response ---
        setProducts(data.products);
        setPages(data.pages);
        setPage(data.page);
        // ------------------------------------------------

      } catch (err) {
        setError('Failed to load products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, pageNumber]); // Re-fetch whenever search or page changes

  // Handler to update filters state from sidebar
  const handleFilterChange = useCallback((newFilters) => {
    setCurrentFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // --- LOCAL FILTERING AND SORTING LOGIC (Applied to the current page results) ---
  const filteredAndSortedProducts = useMemo(() => {
    let tempProducts = [...products];
    const filters = currentFilters;

    // NOTE: This filtering/sorting is applied locally to the current page's batch of 8 products.

    // 1. Filter by Price
    tempProducts = tempProducts.filter((product) => product.price <= filters.maxPrice);

    // 2. Filter by Category
    if (filters.categories.length > 0) {
        const categoryMap = { spices: 'Spices', masalas: 'Masalas', herbs: 'Herbs' };
        const activeCategories = filters.categories.map(key => categoryMap[key]).filter(Boolean);

        tempProducts = tempProducts.filter((product) =>
            activeCategories.includes(product.category)
        );
    }

    // 3. Filter by Availability
    if (filters.availability.inStock && !filters.availability.outOfStock) {
        tempProducts = tempProducts.filter((product) => product.inStock === true);
    } else if (!filters.availability.inStock && filters.availability.outOfStock) {
        tempProducts = tempProducts.filter((product) => product.inStock === false);
    }

    // 4. Sorting (Local sort on the current page's results)
    if (filters.sortBy === 'Price (Low to High)') {
        tempProducts.sort((a, b) => a.price - b.price);
    } else if (filters.sortBy === 'Price (High to Low)') {
        tempProducts.sort((a, b) => b.price - a.price);
    } else if (filters.sortBy === 'Title (A-Z)') {
        tempProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    return tempProducts;
  }, [products, currentFilters]);


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row">

        {/* 1. Filters Sidebar */}
        <FiltersSidebar onFilterChange={handleFilterChange} currentFilters={currentFilters} />

        {/* 2. Main Content & Product Grid */}
        <main className="w-full lg:w-3/4">
          {/* Top Bar (Sort, View) */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${filteredAndSortedProducts.length} Products Found ${keyword ? `for "${keyword}"` : ''}`}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button className="text-gray-800 p-2 rounded-md bg-gray-100">
                  <Squares2X2Icon className="w-5 h-5" />
                </button>
                <button className="text-gray-400 p-2">
                  <Bars3Icon className="w-5 h-5" />
                </button>
              </div>
              {/* Sort By Dropdown */}
              <div className="relative flex items-center gap-2 text-gray-600">
                 <select
                    value={currentFilters.sortBy}
                    onChange={(e) => handleFilterChange({ sortBy: e.target.value })}
                    className="text-gray-600 appearance-none bg-white border-none pr-8 py-1 focus:outline-none focus:ring-0"
                 >
                    <option value="Popularity">Popularity</option>
                    <option value="Title (A-Z)">Title (A-Z)</option>
                    <option value="Price (Low to High)">Price (Low to High)</option>
                    <option value="Price (High to Low)">Price (High to Low)</option>
                 </select>
                 <ChevronDownIcon className="w-4 h-4 text-gray-600 absolute right-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md h-96 animate-pulse p-4">
                    <div className="bg-gray-200 h-48 w-full rounded-md mb-4"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : filteredAndSortedProducts.length === 0 ? (
            <p className="text-center text-gray-500">No products found matching your search and filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {filteredAndSortedProducts.map((product) => (
                <ShopProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Component */}
          <Pagination page={page} pages={pages} keyword={keyword} />
        </main>
      </div>
    </div>
  );
};

export default Shop;
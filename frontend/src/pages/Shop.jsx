import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import FiltersSidebar from '../components/FiltersSidebar';
import ShopProductCard from '../components/ShopProductCard';
import SearchBar from '../components/SearchBar';
import { Squares2X2Icon, Bars3Icon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

// Helper function to extract search params from URL
const useQuery = () => {
    return new URLSearchParams(useLocation().search);
};

// Maps the UI's sort labels to the backend's `sortBy` query values.
const SORT_BY_MAP = {
    'Popularity': 'popularity',
    'Title (A-Z)': 'title',
    'Price (Low to High)': 'priceAsc',
    'Price (High to Low)': 'priceDesc',
};

// Maps the sidebar's category keys to the values stored on each product.
const CATEGORY_MAP = { spices: 'Spices', masalas: 'Masalas', herbs: 'Herbs' };

// Must match FiltersSidebar's PRICE_SLIDER_MAX. At this value the slider
// means "no upper limit", so we don't send maxPrice to the backend at all -
// that way a product priced above the slider's max is never silently
// filtered out, no matter how high the catalog's prices go.
const PRICE_SLIDER_MAX = 2000;

// Pagination component
const Pagination = ({ page, pages, buildPageUrl }) => {
    const navigate = useNavigate();

    if (pages <= 1) return null;

    const items = [...Array(pages).keys()];

    return (
        <div className="flex justify-center items-center mt-12">
            <nav className="flex items-center gap-2">
                <button
                    onClick={() => navigate(buildPageUrl(page - 1))}
                    disabled={page === 1}
                    className="p-2 text-gray-400 hover:text-gray-700 disabled:opacity-50"
                >
                    <ChevronLeftIcon className="w-5 h-5" />
                </button>

                {items.map((x) => (
                    <button
                        key={x + 1}
                        onClick={() => navigate(buildPageUrl(x + 1))}
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
                    onClick={() => navigate(buildPageUrl(page + 1))}
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
  const navigate = useNavigate();
  const keyword = query.get('keyword') || '';
  const pageNumber = Number(query.get('pageNumber')) || 1;

  const [products, setProducts] = useState([]);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters are sent straight to the backend now, so they're applied across
  // the WHOLE catalog instead of only the 8 products on the current page.
  const [currentFilters, setCurrentFilters] = useState({
      categories: [],
      maxPrice: PRICE_SLIDER_MAX,
      availability: { inStock: false, outOfStock: false },
      sortBy: 'Popularity'
  });

  // Builds a /shop URL that preserves the keyword, only changing the page
  // number. Used by the Pagination component.
  const buildPageUrl = (pageNum) => `/shop?keyword=${encodeURIComponent(keyword)}&pageNumber=${pageNum}`;

  // --- Fetch Products from the server with search, filters, sort & pagination ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        params.set('keyword', keyword);
        params.set('pageNumber', pageNumber);

        const activeCategories = currentFilters.categories
            .map((key) => CATEGORY_MAP[key])
            .filter(Boolean);
        if (activeCategories.length > 0) {
            params.set('category', activeCategories.join(','));
        }

        // Only constrain by price if the slider isn't sitting at "no limit".
        if (currentFilters.maxPrice < PRICE_SLIDER_MAX) {
            params.set('maxPrice', currentFilters.maxPrice);
        }

        const { inStock, outOfStock } = currentFilters.availability;
        if (inStock && !outOfStock) params.set('inStock', 'true');
        else if (!inStock && outOfStock) params.set('inStock', 'false');
        // If both or neither are checked, don't filter by stock at all.

        params.set('sortBy', SORT_BY_MAP[currentFilters.sortBy] || 'popularity');

        const { data } = await axios.get(`/api/products?${params.toString()}`);

        setProducts(data.products);
        setPages(data.pages);
        setPage(data.page);
        setTotalProducts(data.totalProducts);

      } catch (err) {
        setError('Failed to load products.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, pageNumber, currentFilters]);

  // Handler to update filters state from sidebar. Also resets pagination
  // back to page 1, since the previous page number may no longer make sense
  // once the result set changes.
  //
  // IMPORTANT: this is memoized with useCallback, keyed only on the
  // primitive `keyword`/`pageNumber` values (which only change when the URL
  // actually changes). FiltersSidebar re-runs its own sync effect whenever
  // this function's identity changes, so if it were re-created on every
  // render (e.g. every time loading/products state updates) it would
  // trigger an infinite fetch loop.
  const handleFilterChange = useCallback((newFilters) => {
    setCurrentFilters((prev) => ({ ...prev, ...newFilters }));
    if (pageNumber !== 1) {
      navigate(`/shop?keyword=${encodeURIComponent(keyword)}&pageNumber=1`);
    }
  }, [keyword, pageNumber, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search — lives only here on the Shop page now, not in the global
          header. `key={keyword}` remounts it (re-applying initialKeyword)
          whenever the URL's keyword changes from elsewhere, e.g. clearing
          filters or navigating back, so the box never goes stale. */}
      <div className="mb-6 max-w-md">
        <SearchBar key={keyword} initialKeyword={keyword} />
      </div>

      <div className="flex flex-col lg:flex-row">

        {/* 1. Filters Sidebar */}
        <FiltersSidebar onFilterChange={handleFilterChange} currentFilters={currentFilters} />

        {/* 2. Main Content & Product Grid */}
        <main className="w-full lg:w-3/4">
          {/* Top Bar (Sort, View) */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {loading ? 'Loading...' : `${totalProducts} Products Found ${keyword ? `for "${keyword}"` : ''}`}
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
          ) : products.length === 0 ? (
            <p className="text-center text-gray-500">No products found matching your search and filters.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {products.map((product) => (
                <ShopProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {/* Pagination Component */}
          <Pagination page={page} pages={pages} buildPageUrl={buildPageUrl} />
        </main>
      </div>
    </div>
  );
};

export default Shop;
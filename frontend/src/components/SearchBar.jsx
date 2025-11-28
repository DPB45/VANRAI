import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const SearchBar = () => {
    const [keyword, setKeyword] = useState('');
    const navigate = useNavigate();

    const searchHandler = (e) => {
        e.preventDefault();
        if (keyword.trim()) {
            // Redirect to /shop with the search term as a query parameter
            navigate(`/shop?keyword=${keyword.trim()}&pageNumber=1`);
        } else {
            // If empty, redirect to base shop page
            navigate(`/shop`);
        }
    };

    return (
        <form onSubmit={searchHandler} className="relative w-full max-w-sm mr-4">
            <input
                type="search"
                name="keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search Spices, Masalas..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-red-500"
            />
            <button type="submit" className="absolute left-0 top-0 mt-2 ml-3 text-gray-500 hover:text-red-600">
                <MagnifyingGlassIcon className="w-5 h-5" />
            </button>
        </form>
    );
};

export default SearchBar;
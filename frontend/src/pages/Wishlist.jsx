import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { HeartIcon } from '@heroicons/react/24/outline';
import ShopProductCard from '../components/ShopProductCard';

const Wishlist = () => {
    const { userInfo } = useUser();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch Wishlist Data
    useEffect(() => {
        const fetchWishlist = async () => {
            if (!userInfo) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const config = {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                };
                // Fetch the populated wishlist from backend
                const { data } = await axios.get('/api/users/wishlist', config);
                setWishlistItems(data);
            } catch (err) {
                setError('Failed to load wishlist.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchWishlist();
    }, [userInfo]);

    if (!userInfo) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Wishlist</h1>
                <p className="text-lg text-gray-600 mb-6">Please log in to view your saved items.</p>
                <Link to="/login" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
                <HeartIcon className="w-8 h-8 text-red-600" />
                My Wishlist ({wishlistItems.length})
            </h1>

            {loading ? (
                <p className="text-center text-gray-500">Loading saved items...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : wishlistItems.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <HeartIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <p className="text-xl text-gray-600 mb-4">Your wishlist is empty.</p>
                    <Link to="/shop" className="text-red-600 font-semibold hover:underline">
                        Browse Products &rarr;
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {wishlistItems.map((product) => (
                        // Reusing your existing Product Card
                        <ShopProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
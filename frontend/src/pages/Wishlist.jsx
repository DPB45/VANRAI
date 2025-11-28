import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { ShoppingCartIcon, HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import ShopProductCard from '../components/ShopProductCard'; // Reuse the card component

const Wishlist = () => {
    const { userInfo } = useUser();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchWishlist = async () => {
        if (!userInfo) return;
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // GET request to fetch populated wishlist array
            const { data } = await axios.get('/api/users/wishlist', config);

            // The backend populates the array with product objects
            setWishlistItems(data);

        } catch (err) {
            setError('Failed to load wishlist.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, [userInfo]);

    if (!userInfo) {
        return (
            <div className="container mx-auto p-12 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Your Wishlist</h1>
                <p className="text-lg text-red-500">Please log in to view your saved items.</p>
                <Link to="/login" className="mt-4 inline-block text-red-600 hover:underline">Go to Login</Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Saved Items ({wishlistItems.length})</h1>

            {loading ? (
                <p className="text-center text-gray-500">Loading wishlist...</p>
            ) : error ? (
                <p className="text-center text-red-500">{error}</p>
            ) : wishlistItems.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-lg bg-gray-50">
                    <HeartIconOutline className="w-12 h-12 mx-auto text-red-400 mb-4" />
                    <p className="text-xl text-gray-600">Your wishlist is empty.</p>
                    <Link to="/shop" className="text-red-600 hover:underline mt-2 inline-block">Start adding spices!</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Map over the fetched product objects */}
                    {wishlistItems.map((product) => (
                        <ShopProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
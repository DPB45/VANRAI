import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';

const ProductEdit = () => {
    const { id: productId } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useUser();

    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [imageUrl, setImageUrl] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Masalas');
    const [inStock, setInStock] = useState(true);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                // We don't need a token to fetch public product details, but good practice
                const { data } = await axios.get(`/api/products/${productId}`);
                setName(data.name);
                setPrice(data.price);
                setImageUrl(data.imageUrl);
                setDescription(data.description);
                setCategory(data.category);
                setInStock(data.inStock);
            } catch (err) {
                setError('Failed to fetch product details.');
            }
        };
        fetchProduct();
    }, [productId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const dataToSend = {
            name,
            price: Number(price),
            description,
            category,
            imageUrl,
            inStock,
        };

        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };

            // Update Request
            await axios.put(`/api/products/${productId}`, dataToSend, config);

            setSuccess(`Product updated successfully!`);
            // Optional: Redirect back after short delay
            // setTimeout(() => navigate('/admin/productlist'), 1500);

        } catch (err) {
            setError(err.response?.data?.message || 'Update failed.');
        } finally {
            setLoading(false);
        }
    };

    if (!userInfo || !userInfo.isAdmin) {
      return <div className="p-12 text-center text-red-500">Access Denied</div>;
    }

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <Link to="/admin/productlist" className="text-gray-500 hover:text-gray-700 mb-4 inline-block">
                 &larr; Go Back
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mb-8">Edit Product</h1>

            {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}
            {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">

                {/* Image Preview */}
                <div className="flex justify-center mb-4">
                    {imageUrl && (
                        <img src={imageUrl} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500" required />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows="4" className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500" required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                        <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500" required>
                            <option value="Masalas">Masalas</option>
                            <option value="Spices">Spices</option>
                            <option value="Herbs">Herbs</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Path (e.g. /images/my-product.jpg)</label>
                    <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="w-full border border-gray-300 rounded-md p-2 focus:ring-red-500" />
                </div>

                {/* Stock Checkbox */}
                <div className="flex items-center">
                    <input id="inStock" type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-4 w-4 text-red-600 border-gray-300 rounded focus:ring-red-500" />
                    <label htmlFor="inStock" className="ml-2 block text-sm text-gray-900">
                        Product is In Stock
                    </label>
                </div>

                <div className="pt-4">
                    <button type="submit" disabled={loading} className={`w-full bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        {loading ? 'Updating...' : 'Update Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;
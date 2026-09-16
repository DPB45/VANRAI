import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { PlusIcon, TrashIcon, PencilSquareIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { userInfo } = useUser();
  const navigate = useNavigate();

  const config = { headers: { Authorization: `Bearer ${userInfo?.token}` } };

  const fetchProducts = async () => {
      try {
        setLoading(true);
        // The backend supports an explicit pageSize (capped at 200 server-side),
        // so the admin list can pull the whole catalog in a single request
        // instead of only ever showing the first two pages (16 products).
        const { data } = await axios.get(`/api/products?pageNumber=1&pageSize=200`, config);
        setProducts(data.products || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch products.');
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      fetchProducts();
    } else {
        navigate('/login');
    }
  }, [userInfo, navigate]);

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product? This cannot be undone.')) {
      try {
        await axios.delete(`/api/products/${id}`, config);
        // Refresh the list after deletion
        fetchProducts();
      } catch (err) {
        alert(err.response?.data?.message || 'Deletion failed.');
      }
    }
  };

  const createProductHandler = async () => {
      try {
          // Create a sample product instantly
          const { data: createdProduct } = await axios.post('/api/products', {
              name: 'Sample Name',
              price: 0,
              description: 'Sample description',
              category: 'Masalas',
              inStock: true
          }, config);

          // Redirect to the edit screen for this new product
          navigate(`/admin/product/${createdProduct._id}/edit`);

      } catch (err) {
          alert(err.response?.data?.message || 'Product creation failed.');
      }
  };

  if (!userInfo || !userInfo.isAdmin) return null;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Products</h1>
        <button
          onClick={createProductHandler}
          className="bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" /> Create Product
        </button>
      </div>

      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="px-6 py-4 text-sm text-gray-500">{product._id.substring(0, 8)}...</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">₹{product.price}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 text-sm">
                    {product.inStock ? (
                      <CheckCircleIcon className="h-5 w-5 text-green-500"/>
                    ) : (
                      <XCircleIcon className="h-5 w-5 text-red-500"/>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium space-x-4">
                    <Link to={`/admin/product/${product._id}/edit`} className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1">
                      <PencilSquareIcon className="h-4 w-4" /> Edit
                    </Link>
                    <button onClick={() => deleteHandler(product._id)} className="text-red-600 hover:text-red-900 inline-flex items-center gap-1">
                      <TrashIcon className="h-4 w-4" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="text-center mt-6">
        <Link to="/admin" className="text-red-600 hover:underline">
          &larr; Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
};

export default ProductList;
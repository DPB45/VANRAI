import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext'; // Import user context

const Orders = () => {
  const [orders, setOrders] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { userInfo } = useUser(); // Get user info for token

  useEffect(() => {
    const fetchOrders = async () => {
      // Reset state on each fetch attempt
      setOrders([]); // Start with empty array
      setLoading(true);
      setError('');

      if (!userInfo) {
        setError('Please log in to view orders.');
        setLoading(false);
        return;
      }
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`, // Include token
          },
        };

        // Fetch orders from the backend
        const { data } = await axios.get(
          '/api/orders/myorders', // Make sure this matches your backend port
           config
        );

        // --- Important Check ---
        // Ensure the response data is actually an array before setting state
        if (Array.isArray(data)) {
            setOrders(data);
        } else {
            console.error("API did not return an array:", data);
            setError('Received invalid data format for orders.');
        }
        // ---------------------

      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders.');
        console.error("Fetch orders error:", err.response || err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [userInfo]); // Re-fetch if userInfo changes

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">Order History</h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading orders...</p>
      ) : error ? (
        <p className="text-center text-red-500 bg-red-100 p-4 rounded-md">{error}</p>
      ) : // --- Add Array.isArray check before mapping ---
      !Array.isArray(orders) || orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 text-lg">You have no past orders.</p>
        </div>
      ) : (
      // --- END check ---
        <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {/* This map should now be safe */}
              {orders.map((order) => (
                <tr key={order._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order._id.substring(0, 10)}...</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{order.totalPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {order.isPaid ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Paid ({new Date(order.paidAt).toLocaleDateString('en-IN')})
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Not Paid
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                     {order.isDelivered ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Delivered ({new Date(order.deliveredAt).toLocaleDateString('en-IN')})
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Not Delivered
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <Link
                      to={`/order/${order._id}`}
                      className="text-red-600 hover:text-red-800 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Back to Dashboard Link */}
      <div className="text-center mt-8">
        <Link to="/account/dashboard" className="text-red-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Orders;
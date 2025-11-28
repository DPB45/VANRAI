import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import { XCircleIcon } from '@heroicons/react/24/solid';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const { userInfo } = useUser();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/orders', config);
        setOrders(data);
      } catch (error) {
        console.error(error);
      }
    };
    if(userInfo && userInfo.isAdmin) fetchOrders();
  }, [userInfo]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Orders</h1>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivered</th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order._id}>
                <td className="px-6 py-4 text-sm text-gray-500">{order._id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.user && order.user.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-gray-500">₹{order.totalPrice}</td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {order.isDelivered ? (
                    <span className="text-green-600 font-bold">{new Date(order.deliveredAt).toLocaleDateString()}</span>
                  ) : (
                    <XCircleIcon className="h-5 w-5 text-red-500"/>
                  )}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link to={`/order/${order._id}`} className="text-indigo-600 hover:text-indigo-900">Details</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default OrderList;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../../context/UserContext';
import {
  CurrencyRupeeIcon,
  ShoppingCartIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, colorClass, loading }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
    <div className={`p-3 rounded-full mr-4 ${colorClass} bg-opacity-20`}>
      <Icon className={`w-8 h-8 ${colorClass.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-gray-500 text-sm">{title}</p>
      {loading ? (
        <div className="h-8 w-24 bg-gray-200 animate-pulse rounded mt-1"></div>
      ) : (
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
      )}
    </div>
  </div>
);

const Analytics = () => {
  const { userInfo } = useUser();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = {
          headers: { Authorization: `Bearer ${userInfo.token}` },
        };
        const { data } = await axios.get('/api/orders/stats', config);

        setStats(data);
        setLoading(false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load analytics');
        setLoading(false);
      }
    };

    if (userInfo && userInfo.isAdmin) {
      fetchStats();
    }
  }, [userInfo]);

  // Helper to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-red-600">
        <p>Error: {error}</p>
        <Link to="/admin" className="underline">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Sales"
          value={formatCurrency(stats.totalSales)}
          icon={CurrencyRupeeIcon}
          colorClass="bg-green-500 text-green-600"
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={ShoppingCartIcon}
          colorClass="bg-blue-500 text-blue-600"
          loading={loading}
        />
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={UserGroupIcon}
          colorClass="bg-purple-500 text-purple-600"
          loading={loading}
        />
      </div>

      <div className="text-center">
        <Link to="/admin" className="text-red-600 hover:underline">
          &larr; Back to Admin Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Analytics;
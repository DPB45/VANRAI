import React from 'react';
import { Link } from 'react-router-dom';
// 1. FIX: Use ../../ to go up two levels to find the context folder
import { useUser } from '../../context/UserContext';
import {
  UsersIcon,
  ShoppingBagIcon,
  TagIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Reusable Admin Card Component
const AdminCard = ({ title, description, icon: Icon, link, colorClass }) => (
  <Link
    to={link}
    className={`block bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-all duration-300 border-l-4 ${colorClass}`}
  >
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="text-gray-500 text-sm mt-2">{description}</p>
      </div>
      <div className="p-3 bg-gray-50 rounded-full">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
    </div>
    <div className="mt-4 text-sm font-semibold text-gray-600 hover:text-gray-900">
      View Details &rarr;
    </div>
  </Link>
);

const AdminDashboard = () => {
  const { userInfo } = useUser();

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {userInfo?.name}</p>
        </div>
        <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded">
          Administrator Access
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Users Management */}
        <AdminCard
          title="Users"
          description="Manage customers and admins."
          icon={UsersIcon}
          link="/admin/userlist"
          colorClass="border-blue-500"
        />

        {/* Orders Management */}
        <AdminCard
          title="Orders"
          description="Track and update order status."
          icon={ShoppingBagIcon}
          link="/admin/orderlist"
          colorClass="border-green-500"
        />

        {/* Products Management */}
        <AdminCard
          title="Products"
          description="Add, edit, or delete spices."
          icon={TagIcon}
          link="/admin/productlist"
          colorClass="border-orange-500"
        />

        {/* Analytics */}
        <AdminCard
          title="Analytics"
          description="View sales reports & stats."
          icon={ChartBarIcon}
          link="/admin/analytics"
          colorClass="border-purple-500"
        />

      </div>
    </div>
  );
};

export default AdminDashboard;
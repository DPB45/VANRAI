import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useCart } from '../context/CartContext'; // <-- 1. Import useCart
import {
  UserCircleIcon,
  ArchiveBoxIcon,
  MapPinIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';

const DashboardCard = ({ title, icon: Icon, children, linkTo, isHighlight }) => (
    <div className={`p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg ${isHighlight ? 'bg-red-50 border-2 border-red-100' : 'bg-white'}`}>
        <div className="flex items-center text-red-600 mb-4">
            <Icon className="w-8 h-8 mr-3 flex-shrink-0" />
            <h3 className="text-xl font-semibold text-gray-800 truncate">{title}</h3>
        </div>
        <div className="text-gray-600 space-y-2 mb-4 text-sm">
            {children}
        </div>
        {linkTo && (
            <Link
                to={linkTo}
                className="text-sm font-medium text-red-600 hover:underline"
            >
                {isHighlight ? 'Access Panel →' : `View/Edit ${title}`}
            </Link>
        )}
    </div>
);

const AccountDashboard = () => {
  const navigate = useNavigate();
  const { userInfo, logout } = useUser();
  const { clearCart } = useCart(); // <-- 2. Get clearCart function

  const handleLogout = () => {
    clearCart(); // <-- 3. Clear the cart here
    logout();
    localStorage.removeItem('userInfo');
    navigate('/');
  };

  if (!userInfo) {
     return (
        <div className="container mx-auto p-12 text-center min-h-[calc(100vh-160px)] flex flex-col justify-center items-center">
            <p className="text-lg text-gray-700">You are not logged in.</p>
            <Link to="/login" className="mt-4 inline-block text-red-600 hover:underline font-semibold">
                Go to Login Page
            </Link>
        </div>
     );
  }

  return (
    <div className="bg-gray-50 py-16 min-h-[calc(100vh-160px)]">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">My Account</h1>
          <p className="text-lg text-gray-600">Welcome back, {userInfo.name}!</p>

          {userInfo.isAdmin && (
              <span className="inline-block mt-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                  ADMINISTRATOR
              </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {userInfo.isAdmin && (
            <DashboardCard
                title="Admin Dashboard"
                icon={CommandLineIcon}
                linkTo="/admin"
                isHighlight={true}
            >
                <p>Manage products, orders, and users.</p>
                <p className="font-bold">Restricted Access</p>
            </DashboardCard>
          )}

          <DashboardCard title="My Profile" icon={UserCircleIcon} linkTo="/account/profile">
            <p><strong>Name:</strong> {userInfo.name}</p>
            <p><strong>Email:</strong> {userInfo.email}</p>
          </DashboardCard>

          <DashboardCard title="Order History" icon={ArchiveBoxIcon} linkTo="/account/orders">
            <p>View your past orders and track current shipments.</p>
            <p>You have <strong>0</strong> recent orders.</p>
          </DashboardCard>

          <DashboardCard title="My Addresses" icon={MapPinIcon} linkTo="/account/addresses">
            <p>Manage your saved shipping and billing addresses.</p>
            <p>You have <strong>1</strong> saved address.</p>
          </DashboardCard>

          <DashboardCard title="Account Settings" icon={Cog6ToothIcon} linkTo="/account/settings">
            <p>Update your password and communication preferences.</p>
          </DashboardCard>

          <div className="bg-white p-6 rounded-lg shadow-md transition-shadow hover:shadow-lg flex items-center justify-center md:col-span-2 lg:col-span-1">
             <button
               onClick={handleLogout}
               className="flex items-center gap-2 text-lg font-semibold text-red-600 hover:text-red-800 transition-colors"
             >
               <ArrowRightOnRectangleIcon className="w-6 h-6" />
               Logout
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDashboard;
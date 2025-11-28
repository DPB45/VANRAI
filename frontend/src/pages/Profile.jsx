import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { UserCircleIcon } from '@heroicons/react/24/outline';

const Profile = () => {
  const { userInfo, login } = useUser();
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!userInfo) {
    return (
      <div className="container mx-auto p-12 text-center">
        <p>Please log in to view your profile.</p>
        <Link to="/login" className="text-red-600 hover:underline">Go to Login</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    if (!email.includes('@') || !email.includes('.')) {
        setError('Invalid email format.');
        setLoading(false);
        return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      // Send PUT request to update profile (excluding password)
      const { data } = await axios.put(
        'http://localhost:5001/api/users/profile',
        { name, email }, // Send updated name and email
        config
      );

      setMessage('Profile updated successfully!');
      login(data); // Update user info in context/local storage
      setLoading(false);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">My Profile</h1>

      {/* Message Area */}
      {message && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-center">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
        <div className="flex justify-center mb-4">
            <UserCircleIcon className="w-16 h-16 text-gray-400" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="profileName">Full Name</label>
          <input
            type="text"
            id="profileName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="profileEmail">Email Address</label>
          <input
            type="email"
            id="profileEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Saving Changes...' : 'Update Profile'}
          </button>
        </div>
      </form>

      <div className="text-center mt-8">
        <Link to="/account/dashboard" className="text-red-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Profile;
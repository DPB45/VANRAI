import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';

const Settings = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { userInfo, login } = useUser();

  // Redirect if not logged in
  if (!userInfo) {
     return <p className='p-12 text-center'>Please log in to access settings.</p>;
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage('New passwords do not match.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
       setMessage('Password must be at least 6 characters.');
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

      // Send PUT request to update profile (only sending password)
      const { data } = await axios.put(
        '/api/users/profile',
        { password }, // Only send the new password
        config
      );

      setMessage('Password updated successfully!');
      login(data); // Update user info in context/local storage
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Account Settings</h1>

      {/* Message Area */}
      {message && (
        <div className={`mb-6 p-3 rounded-md text-center ${message.includes('successfully') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message}
        </div>
      )}

      <div className="bg-white p-8 rounded-lg shadow-md space-y-8">

        {/* Change Password Form */}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-700">Change Password</h2>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password" id="password" value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Enter new password (min. 6 characters)"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password" id="confirmPassword" value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Confirm new password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>

        {/* 2FA Settings */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Two-Factor Authentication</h2>
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
            <div>
              <p className="font-medium text-gray-800">Email OTP Protection</p>
              <p className="text-sm text-gray-500">Require a code sent to your email when logging in.</p>
            </div>
            <button
              onClick={async () => {
                  try {
                    const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
                    const { data } = await axios.put('/api/users/2fa', {}, config);

                    // Update local user info
                    const updatedUser = { ...userInfo, isTwoFactorEnabled: data.isTwoFactorEnabled };
                    login(updatedUser); // Update context
                    localStorage.setItem('userInfo', JSON.stringify(updatedUser));

                    alert(data.message);
                  } catch (err) {
                    alert('Failed to update 2FA settings');
                  }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${userInfo.isTwoFactorEnabled ? 'bg-red-600' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${userInfo.isTwoFactorEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

      </div>

      <div className="text-center mt-8">
        <Link to="/account/dashboard" className="text-red-600 hover:underline">
          &larr; Back to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default Settings;
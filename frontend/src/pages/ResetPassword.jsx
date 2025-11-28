import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { LockClosedIcon } from '@heroicons/react/24/outline';

const ResetPassword = () => {
    const { token } = useParams(); // Get token from URL
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };

            // Call backend endpoint to perform reset using the token
            const { data } = await axios.put(
                `/api/users/resetpassword/${token}`,
                { password },
                config
            );

            setMessage(data.message);
            setError(''); // Clear errors on success
            setPassword('');
            setConfirmPassword('');

        } catch (err) {
            setError(err.response?.data?.message || 'Password reset failed.');
            setMessage('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-16 bg-gray-50 min-h-[calc(100vh-160px)]">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Set New Password</h1>
                    <p className="text-gray-500">
                        Enter a new secure password for your account.
                    </p>
                </div>

                {message && (
                    <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md text-center text-sm">
                        {message}
                    </div>
                )}
                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">New Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <LockClosedIcon className="w-5 h-5" />
                            </span>
                            <input
                                type="password" id="password" value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Enter new password (min 6 characters)"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirm Password</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <LockClosedIcon className="w-5 h-5" />
                            </span>
                            <input
                                type="password" id="confirmPassword" value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="Confirm new password"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Resetting...' : 'Reset Password'}
                    </button>

                    <div className="text-center pt-2">
                        {message.includes('successful') && (
                            <Link to="/login" className="text-sm text-red-600 hover:underline">
                                Proceed to Login
                            </Link>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
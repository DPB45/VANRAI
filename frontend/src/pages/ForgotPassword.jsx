import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        if (!email.includes('@') || !email.includes('.')) {
            setError('Please enter a valid email address.');
            setLoading(false);
            return;
        }

        try {
            const config = { headers: { 'Content-Type': 'application/json' } };

            // Call the backend endpoint to request a reset link
            const { data } = await axios.post(
                '/api/users/forgotpassword',
                { email },
                config
            );

            setMessage(data.message);

        } catch (err) {
            // Even if the user doesn't exist, we return a generic success message
            setMessage('If a user is found, a password reset link has been sent to their email.');
            console.error("Forgot password error:", err.response || err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-16 bg-gray-50 min-h-[calc(100vh-160px)]">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h1>
                    <p className="text-gray-500">
                        Enter your email address and we'll send you a link to reset your password.
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                                <EnvelopeIcon className="w-5 h-5" />
                            </span>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                placeholder="your.email@example.com"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Sending Request...' : 'Send Reset Link'}
                    </button>

                    <div className="text-center pt-2">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-red-600 hover:underline">
                            &larr; Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
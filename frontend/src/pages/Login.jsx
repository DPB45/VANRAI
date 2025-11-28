import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LockClosedIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUser } from '../context/UserContext';

// --- Reusable tab button (Updated for mobile touch targets) ---
const AuthTab = ({ title, activeTab, setActiveTab }) => (
    <button
        type="button"
        onClick={() => setActiveTab(title)}
        className={`flex-1 py-3 text-center text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
      ${activeTab === title
            ? 'bg-white shadow text-gray-800' // Active tab
            : 'text-gray-500 hover:text-gray-700' // Inactive tab
            }
    `}
    >
        {title}
    </button>
);

// --- Reusable login method button (Updated for mobile flex) ---
const MethodButton = ({ title, activeMethod, setActiveMethod }) => (
    <button
        type="button"
        onClick={() => setActiveMethod(title)}
        className={`flex-1 py-2.5 px-4 text-center text-sm font-semibold rounded-md transition-colors duration-150 ease-in-out whitespace-nowrap
      ${activeMethod === title
            ? 'bg-red-600 text-white shadow-md'
            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }
    `}
    >
        {title === 'Email' ? 'Login with Email' : 'Login with OTP'}
    </button>
);


// Main Login Page
const Login = () => {
    const [activeTab, setActiveTab] = useState('Login');
    const [activeMethod, setActiveMethod] = useState('Email');

    // Standard Form State
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // 2FA State
    const [show2FAInput, setShow2FAInput] = useState(false);
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [tempUserId, setTempUserId] = useState(null);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useUser();

    // --- Validation ---
    const validateInputs = () => {
        if (show2FAInput) {
            if (twoFactorCode.length !== 6) {
                setError('Please enter a valid 6-digit code.');
                return false;
            }
            return true;
        }

        if (activeMethod !== 'Email') return true;

        if (activeTab === 'Sign Up' && name.trim() === '') {
            setError('Name is required.');
            return false;
        }
        if (!email.includes('@') || !email.includes('.')) {
            setError('Please enter a valid email address.');
            return false;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return false;
        }
        return true;
    };

    // --- Handle Submit ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateInputs()) return;

        setLoading(true);

        try {
            if (activeTab === 'Sign Up') {
                const config = { headers: { 'Content-Type': 'application/json' } };
                const { data } = await axios.post(
                    '/api/users/register',
                    { name, email, password },
                    config
                );
                login(data);
                localStorage.setItem('userInfo', JSON.stringify(data));
                setLoading(false);
                navigate('/account/dashboard');
            }
            else if (activeTab === 'Login') {
                if (activeMethod === 'Email') {
                    let data;

                    if (show2FAInput) {
                        const res = await axios.post('/api/users/login/verify2fa', {
                            userId: tempUserId,
                            code: twoFactorCode
                        });
                        data = res.data;
                    } else {
                        const res = await axios.post('/api/users/login', {
                            email,
                            password
                        });
                        data = res.data;
                    }

                    if (data.twoFactorRequired) {
                        setTempUserId(data.userId);
                        setShow2FAInput(true);
                        setLoading(false);
                        setError('');
                        return;
                    }

                    login(data);
                    localStorage.setItem('userInfo', JSON.stringify(data));
                    setLoading(false);
                    navigate('/account/dashboard');

                } else if (activeMethod === 'OTP') {
                    setError('OTP Login not yet implemented.');
                    setLoading(false);
                }
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Authentication failed.');
            setLoading(false);
        }
    };

    const handleSimulateLogin = () => {
        const simData = { _id: 'simulated_id', name: 'Simulated User', email: 'simulated@example.com', token: 'fake_token'};
        login(simData);
        localStorage.setItem('userInfo', JSON.stringify(simData));
        navigate('/account/dashboard');
    };

    return (
        <div className="flex items-center justify-center py-8 md:py-16 bg-gray-50 min-h-[calc(100vh-160px)] px-4">
            <div className="w-full max-w-md bg-white p-6 md:p-8 rounded-xl shadow-lg border border-gray-100">

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900 mb-2">
                        Welcome to Vanrai Spices
                    </h1>
                    <p className="text-sm text-gray-500 px-4">
                        Your journey to authentic Indian flavors begins here.
                    </p>
                </div>

                {/* Tabs (Hide if in 2FA mode) */}
                {!show2FAInput && (
                    <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
                        <AuthTab title="Login" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <AuthTab title="Sign Up" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                )}

                {/* Methods (Hide if in 2FA mode) */}
                {!show2FAInput && activeTab === 'Login' && (
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                        <MethodButton title="Email" activeMethod={activeMethod} setActiveMethod={setActiveMethod} />
                        <MethodButton title="OTP" activeMethod={activeMethod} setActiveMethod={setActiveMethod} />
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 rounded-md text-center text-sm font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* --- 2FA CODE INPUT UI --- */}
                    {show2FAInput ? (
                        <div className="space-y-6">
                            <div className="text-center bg-blue-50 p-4 rounded-md text-blue-700 text-sm border border-blue-100">
                                <p className="font-semibold mb-1">Two-Factor Authentication</p>
                                <p>We sent a 6-digit code to your email.</p>
                            </div>
                            <div>
                                <label htmlFor="2fa" className="block text-sm font-medium text-gray-700 mb-2 text-center">Enter Code</label>
                                <input
                                    type="text"
                                    id="2fa"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center tracking-[0.5em] font-bold text-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-red-600 text-white font-semibold py-3.5 px-8 rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => { setShow2FAInput(false); setError(''); }}
                                    className="text-sm text-gray-500 hover:text-gray-800 font-medium underline underline-offset-2"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- STANDARD LOGIN/SIGNUP UI ---
                        <div className="space-y-5">
                            {activeMethod === 'Email' && (
                                <>
                                    {/* Name (Sign Up only) */}
                                    {activeTab === 'Sign Up' && (
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <UserIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                                </div>
                                                <input
                                                    type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                                                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                                    placeholder="John Doe" required
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <EnvelopeIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                                placeholder="name@example.com" required
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <LockClosedIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                                            </div>
                                            <input
                                                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-red-500 focus:border-red-500 sm:text-sm"
                                                placeholder="••••••••" required
                                                minLength={activeTab === 'Sign Up' ? 6 : undefined}
                                            />
                                        </div>
                                        {activeTab === 'Sign Up' && (<p className="mt-1 text-xs text-gray-500">Must be at least 6 characters.</p>)}
                                    </div>

                                    {/* Remember/Forgot (Login only) */}
                                    {activeTab === 'Login' && (
                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center">
                                                <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded" />
                                                <label htmlFor="remember-me" className="ml-2 block text-gray-900">Remember me</label>
                                            </div>
                                            <Link to="/forgot-password" className="font-medium text-red-600 hover:text-red-500">
                                                Forgot password?
                                            </Link>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit" disabled={loading}
                                        className={`w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Processing...' : (activeTab === 'Login' ? 'Login' : 'Create Account')}
                                    </button>
                                </>
                            )}

                            {/* OTP Form Placeholder */}
                            {activeTab === 'Login' && activeMethod === 'OTP' && (
                                <div className="text-center py-8">
                                    <p className="text-gray-500 mb-4">OTP Login feature coming soon!</p>
                                    <button
                                        type="button"
                                        onClick={() => setActiveMethod('Email')}
                                        className="text-red-600 hover:underline text-sm font-medium"
                                    >
                                        Switch to Email Login
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </form>

                {!show2FAInput && (
                    <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                         <button
                            type="button" onClick={handleSimulateLogin}
                            className="text-xs text-gray-400 hover:text-gray-600 hover:underline transition-colors"
                        >
                            Simulate Login (Dev Mode)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
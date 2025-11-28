import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LockClosedIcon, EnvelopeIcon, UserIcon } from '@heroicons/react/24/outline';
import { useUser } from '../context/UserContext';

// --- Reusable tab button ---
const AuthTab = ({ title, activeTab, setActiveTab }) => (
    <button
        type="button"
        onClick={() => setActiveTab(title)}
        className={`w-1/2 py-2 text-center text-sm font-medium rounded-md transition-colors duration-150 ease-in-out
      ${activeTab === title
                ? 'bg-white shadow text-gray-800' // Active tab
                : 'text-gray-500 hover:text-gray-700' // Inactive tab
            }
    `}
    >
        {title}
    </button>
);

// --- Reusable login method button ---
const MethodButton = ({ title, activeMethod, setActiveMethod }) => (
    <button
        type="button"
        onClick={() => setActiveMethod(title)}
        className={`w-1/2 py-2 px-4 text-center font-semibold rounded-md transition-colors duration-150 ease-in-out
      ${activeMethod === title
                ? 'bg-red-600 text-white' // Active method
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50' // Inactive method
            }
    `}
    >
        {title}
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

        if (activeMethod !== 'Email') return true; // Skip for OTP method

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
            // --- SIGN UP FLOW ---
            if (activeTab === 'Sign Up') {
                const config = { headers: { 'Content-Type': 'application/json' } };
                const { data } = await axios.post(
                    '/api/users/register',
                    { name, email, password },
                    config
                );
                console.log('Registration Successful:', data);
                login(data);
                localStorage.setItem('userInfo', JSON.stringify(data));
                setLoading(false);
                navigate('/account/dashboard');
            }
            // --- LOGIN FLOW ---
            else if (activeTab === 'Login') {
                if (activeMethod === 'Email') {
                    let data;

                    if (show2FAInput) {
                        // STEP 2: Verify 2FA Code
                        const res = await axios.post('/api/users/login/verify2fa', {
                            userId: tempUserId,
                            code: twoFactorCode
                        });
                        data = res.data;
                    } else {
                        // STEP 1: Initial Login Request
                        const res = await axios.post('/api/users/login', {
                            email,
                            password
                        });
                        data = res.data;
                    }

                    // Check if 2FA is required by backend
                    if (data.twoFactorRequired) {
                        setTempUserId(data.userId);
                        setShow2FAInput(true); // Switch UI to code input
                        setLoading(false);
                        setError(''); // Clear any prev errors
                        return; // Stop here, wait for user to enter code
                    }

                    // Login Successful (No 2FA or 2FA verified)
                    console.log('Login Successful:', data);
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
        <div className="flex items-center justify-center py-16 bg-gray-50 min-h-[calc(100vh-160px)]">
            <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Welcome to Vanrai Spices
                    </h1>
                    <p className="text-gray-500">
                        Your journey to authentic Indian flavors begins here.
                    </p>
                </div>

                {/* Tabs (Hide if in 2FA mode to prevent switching) */}
                {!show2FAInput && (
                    <div className="bg-gray-100 p-1 rounded-lg flex mb-6">
                        <AuthTab title="Login" activeTab={activeTab} setActiveTab={setActiveTab} />
                        <AuthTab title="Sign Up" activeTab={activeTab} setActiveTab={setActiveTab} />
                    </div>
                )}

                {/* Methods (Hide if in 2FA mode) */}
                {!show2FAInput && activeTab === 'Login' && (
                    <div className="flex gap-4 mb-6">
                        <MethodButton title="Email" activeMethod={activeMethod} setActiveMethod={setActiveMethod} />
                        <MethodButton title="OTP" activeMethod={activeMethod} setActiveMethod={setActiveMethod} />
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    {/* --- 2FA CODE INPUT UI --- */}
                    {show2FAInput ? (
                        <div className="space-y-6">
                            <div className="text-center bg-blue-50 p-4 rounded-md text-blue-700 text-sm">
                                <p className="font-semibold">Two-Factor Authentication Enabled</p>
                                <p>We sent a verification code to your email.</p>
                            </div>
                            <div>
                                <label htmlFor="2fa" className="block text-sm font-medium text-gray-700 mb-1 text-center">Enter 6-Digit Code</label>
                                <input
                                    type="text"
                                    id="2fa"
                                    value={twoFactorCode}
                                    onChange={(e) => setTwoFactorCode(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-md text-center tracking-[0.5em] font-bold text-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                                    placeholder="000000"
                                    maxLength={6}
                                    autoFocus
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                            <div className="text-center">
                                <button
                                    type="button"
                                    onClick={() => { setShow2FAInput(false); setError(''); }}
                                    className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        // --- STANDARD LOGIN/SIGNUP UI ---
                        <>
                            {activeMethod === 'Email' && (
                                <div className="space-y-4">
                                    {/* Name (Sign Up only) */}
                                    {activeTab === 'Sign Up' && (
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                            <div className="mt-1 relative rounded-md shadow-sm">
                                                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><UserIcon className="w-5 h-5" /></span>
                                                <input
                                                    type="text" id="name" value={name} onChange={(e) => setName(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                    placeholder="John Doe" required
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {/* Email */}
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><EnvelopeIcon className="w-5 h-5" /></span>
                                            <input
                                                type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                placeholder="vanrai@example.com" required
                                            />
                                        </div>
                                    </div>
                                    {/* Password */}
                                    <div>
                                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                                        <div className="mt-1 relative rounded-md shadow-sm">
                                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400"><LockClosedIcon className="w-5 h-5" /></span>
                                            <input
                                                type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                placeholder="Enter your password" required
                                                minLength={activeTab === 'Sign Up' ? 6 : undefined}
                                            />
                                            {activeTab === 'Sign Up' && (<p className="mt-1 text-xs text-gray-500">Password must be at least 6 characters.</p>)}
                                        </div>
                                    </div>
                                    {/* Remember/Forgot (Login only) */}
                                    {activeTab === 'Login' && (
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center text-sm text-gray-600">
                                                <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                                                <span className="ml-2">Remember me</span>
                                            </label>
                                            <Link to="/forgot-password" className="text-sm text-red-600 hover:underline">Forgot password?</Link>
                                        </div>
                                    )}
                                    {/* Submit Button */}
                                    <button
                                        type="submit" disabled={loading}
                                        className={`w-full bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Processing...' : (activeTab === 'Login' ? 'Login' : 'Create Account')}
                                    </button>
                                </div>
                            )}

                            {/* OTP Form (Login only) */}
                            {activeTab === 'Login' && activeMethod === 'OTP' && (
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number</label>
                                        <div className="mt-1">
                                            <input
                                                type="tel" id="phone"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                placeholder="Enter your 10-digit phone number" required
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit" disabled={loading}
                                        className={`w-full bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </form>

                {!show2FAInput && (
                    <div className="text-center mt-6">
                        <button
                            type="button" onClick={handleSimulateLogin}
                            className="text-sm text-gray-500 hover:text-red-600 hover:underline"
                        >
                            Simulate Login (for dashboard view)
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
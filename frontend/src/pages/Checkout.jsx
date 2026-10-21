import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import { useNavigate, Link } from 'react-router-dom';
import OrderPlacedModal from '../components/OrderPlacedModal';
// 1. Import TrashIcon
import { TrashIcon } from '@heroicons/react/24/outline';

const FormInput = ({ label, id, name, value, onChange, error, isOptional = false, required = true }) => (
    <div className="mb-4">
        <label htmlFor={id} className="block text-sm font-semibold text-gray-600 mb-1">
            {label} {isOptional && <span className="text-gray-400">(Optional)</span>}
        </label>
        <input
            type="text"
            inputMode={id === 'postalCode' || id === 'phone' ? 'numeric' : undefined}
            id={id}
            name={name}
            className={`w-full px-4 py-2 bg-white border rounded-md shadow-sm focus:outline-none focus:ring-2
                       ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-red-500'}`}
            value={value}
            onChange={onChange}
            required={required}
        />
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
);

// Fill the form from a saved address, keeping what's already typed for any
// field the saved address doesn't have (older addresses have no phone).
const applySaved = (prev, a) => ({
    ...prev,
    fullName: a.fullName || prev.fullName,
    phone: a.phone || prev.phone,
    addressLine1: a.addressLine1 || '',
    addressLine2: a.addressLine2 || '',
    city: a.city || '',
    state: a.state || '',
    postalCode: a.postalCode || '',
    country: a.country || 'India',
});

const Checkout = () => {
    // 2. Get removeFromCart from context
    const { cartItems, subtotal, shipping, total, clearCart, removeFromCart, refreshCart } = useCart();
    const { userInfo } = useUser();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [addressErrors, setAddressErrors] = useState({});
    const navigate = useNavigate();

    // The draft address is kept in sessionStorage so that being bounced to
    // /login mid-checkout (and back) doesn't wipe everything the shopper typed.
    const DRAFT_KEY = 'vanraiCheckoutDraft';
    const [shippingAddress, setShippingAddress] = useState(() => {
        const base = {
            fullName: userInfo?.name || '',
            phone: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            postalCode: '',
            country: 'India',
        };
        try {
            const saved = sessionStorage.getItem(DRAFT_KEY);
            return saved ? { ...base, ...JSON.parse(saved) } : base;
        } catch {
            return base;
        }
    });
    const [placedOrderId, setPlacedOrderId] = useState(null);

    useEffect(() => {
        try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(shippingAddress)); } catch { /* ignore */ }
    }, [shippingAddress]);

    // Lines the latest refresh found to be out of stock; the server would
    // reject the order for these anyway, so stop it here with a clear reason.
    const unavailableItems = cartItems.filter((item) => item.inStock === false);

    // Saved addresses from the account, offered as a one-click prefill.
    const [savedAddresses, setSavedAddresses] = useState([]);
    useEffect(() => {
        if (!userInfo) return;
        let cancelled = false;
        axios
            .get('/api/users/addresses', { headers: { Authorization: `Bearer ${userInfo.token}` } })
            .then(({ data }) => {
                if (cancelled || !Array.isArray(data)) return;
                setSavedAddresses(data);
                // If nothing has been typed yet, start from the default address.
                const def = data.find((a) => a.isDefault);
                setShippingAddress((prev) => (def && prev.addressLine1.trim() === '' ? applySaved(prev, def) : prev));
            })
            .catch(() => { /* saved addresses are a convenience; ignore failures */ });
        return () => { cancelled = true; };
    }, [userInfo]);

    const handleUseSaved = (e) => {
        const chosen = savedAddresses.find((a) => a._id === e.target.value);
        if (chosen) {
            setShippingAddress((prev) => applySaved(prev, chosen));
            setAddressErrors({});
        }
    };

    // Re-sync prices/stock with the server before the shopper commits to a total.
    useEffect(() => {
        refreshCart();
    }, [refreshCart]);

    // Redirect if cart becomes empty while on this page
    useEffect(() => {
        if (cartItems.length === 0 && !isModalOpen) {
            navigate('/shop');
        }
    }, [cartItems, navigate, isModalOpen]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress((prev) => ({ ...prev, [name]: value }));
        setAddressErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateAddress = () => {
        let isValid = true;
        let errors = {};

        if (shippingAddress.fullName.trim() === '') { errors.fullName = 'Full name is required.'; isValid = false; }
        if (shippingAddress.addressLine1.trim() === '') { errors.addressLine1 = 'Address Line 1 is required.'; isValid = false; }
        if (shippingAddress.city.trim() === '') { errors.city = 'City is required.'; isValid = false; }
        if (shippingAddress.state.trim() === '') { errors.state = 'State is required.'; isValid = false; }

        if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) {
            errors.phone = 'Enter a valid 10-digit mobile number.'; isValid = false;
        }

        if (shippingAddress.postalCode.trim() === '') {
            errors.postalCode = 'Postal Code is required.'; isValid = false;
        } else if (!/^[1-9]\d{5}$/.test(shippingAddress.postalCode.trim())) {
            errors.postalCode = 'Enter a valid 6-digit PIN code.'; isValid = false;
        }

        setAddressErrors(errors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Belt and braces for Enter-key submits: never send an order that
        // contains an out-of-stock line.
        if (unavailableItems.length > 0) {
            setError('Please remove the out-of-stock item(s) from your order first.');
            return;
        }

        setLoading(true);

        if (!userInfo) {
            setError('Please log in to place an order.');
            setLoading(false);
            navigate('/login', { state: { from: '/checkout' } });
            return;
        }

        if (!validateAddress()) {
            setError('Please correct the highlighted address fields.');
            setLoading(false);
            return;
        }

        const orderData = {
            // Only ids + quantities matter: the server recomputes every price.
            orderItems: cartItems.map((item) => ({ _id: item._id, name: item.name, quantity: item.quantity })),
            shippingAddress: shippingAddress,
            paymentMethod: 'COD',
        };

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };
            const { data: createdOrder } = await axios.post(
                '/api/orders',
                orderData,
                config
            );
            try { sessionStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
            setPlacedOrderId(createdOrder._id);
            clearCart();
            setIsModalOpen(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to place order.');
            console.error("Order placement error:", err.response || err);
        } finally {
            setLoading(false);
        }
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        navigate('/shop');
    };

    return (
        <>
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-12" style={{ color: '#6b4423' }}>
                    Checkout
                </h1>
                {error && (
                    <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-md text-center">
                        {error}
                    </div>
                )}
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                        {/* --- LEFT COLUMN: Address & Payment --- */}
                        <div>
                            <section>
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6" style={{ color: '#6b4423' }}>
                                    Delivery Address
                                </h2>
                                <div className="space-y-4">
                                    {savedAddresses.length > 0 && (
                                        <div>
                                            <label htmlFor="savedAddress" className="block text-sm font-medium text-gray-700 mb-1">Use a saved address</label>
                                            <select
                                                id="savedAddress"
                                                defaultValue=""
                                                onChange={handleUseSaved}
                                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                                            >
                                                <option value="" disabled>Choose a saved address…</option>
                                                {savedAddresses.map((a) => (
                                                    <option key={a._id} value={a._id}>
                                                        {a.fullName} — {a.addressLine1}, {a.city} {a.postalCode}{a.isDefault ? ' (default)' : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                    <FormInput label="Full Name" id="fullName" name="fullName" value={shippingAddress.fullName} onChange={handleAddressChange} error={addressErrors.fullName} />
                                    <FormInput label="Mobile Number" id="phone" name="phone" value={shippingAddress.phone} onChange={handleAddressChange} error={addressErrors.phone} />
                                    <FormInput label="Address Line 1" id="addressLine1" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleAddressChange} error={addressErrors.addressLine1} />
                                    <FormInput label="Address Line 2" id="addressLine2" name="addressLine2" value={shippingAddress.addressLine2} onChange={handleAddressChange} isOptional={true} required={false} />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput label="City" id="city" name="city" value={shippingAddress.city} onChange={handleAddressChange} error={addressErrors.city} />
                                        <FormInput label="State" id="state" name="state" value={shippingAddress.state} onChange={handleAddressChange} error={addressErrors.state} />
                                    </div>
                                    <FormInput label="Postal Code" id="postalCode" name="postalCode" value={shippingAddress.postalCode} onChange={handleAddressChange} error={addressErrors.postalCode} />
                                    <FormInput label="Country" id="country" name="country" value={shippingAddress.country} onChange={handleAddressChange} />
                                </div>
                            </section>

                            <section className="mt-12">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6" style={{ color: '#6b4423' }}>
                                    Payment Option
                                </h2>
                                <div className="bg-gray-50 p-6 rounded-lg text-gray-800 border border-gray-200">
                                   <p className="font-medium">Cash on Delivery (COD)</p>
                                   <p className="text-sm text-gray-600 mt-1">Pay upon receiving your order.</p>
                                </div>
                            </section>
                        </div>

                        {/* --- RIGHT COLUMN: Order Summary --- */}
                        <div>
                            <div className="bg-gray-50 p-8 rounded-lg shadow-md sticky top-32">
                                <h2 className="text-2xl font-semibold text-gray-800 mb-6">Order Summary</h2>

                                {/* Item List with Delete Option */}
                                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                                    {cartItems.map((item) => (
                                        <div key={item._id} className="flex justify-between items-center text-sm border-b pb-3">
                                            <div className="flex items-center flex-grow">
                                                <img src={item.imageUrl} alt={item.name} className="w-10 h-10 rounded-md object-cover mr-3" />
                                                <div>
                                                    <span className="text-gray-800 font-medium block">{item.name}</span>
                                                    <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="font-semibold text-gray-800">₹{(item.price * item.quantity).toFixed(2)}</span>

                                                {/* 3. Remove Button */}
                                                <button
                                                    type="button" // IMPORTANT: prevent form submit
                                                    onClick={() => removeFromCart(item._id)}
                                                    className="text-gray-400 hover:text-red-600 transition-colors p-1"
                                                    title="Remove Item"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                    {cartItems.length === 0 && <p className="text-gray-500">Cart is empty</p>}
                                </div>

                                {/* Totals */}
                                <div className="space-y-3 border-t border-gray-300 pt-6">
                                    <div className="flex justify-between text-lg">
                                        <span className="text-gray-600">Subtotal:</span>
                                        <span className="font-semibold text-gray-800">₹{subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg">
                                        <span className="text-gray-600">Shipping:</span>
                                        <span className="font-semibold text-gray-800">₹{shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-300 my-2"></div>
                                    <div className="flex justify-between text-2xl font-bold">
                                        <span className="text-gray-800">Total:</span>
                                        <span className="text-red-600">₹{total.toFixed(2)}</span>
                                    </div>
                                </div>

                                {/* Guests used to get a permanently greyed-out button with no
                                    explanation (and the redirect-to-login code in handleSubmit
                                    could never run). Now they're told why and can log in, then
                                    land back here with their typed address preserved. */}
                                {!userInfo && (
                                    <p className="mt-6 text-sm text-gray-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                                        Please{' '}
                                        <Link to="/login" state={{ from: '/checkout' }} className="font-semibold text-red-600 hover:underline">
                                            log in
                                        </Link>{' '}
                                        to place your order. Your details below will be kept.
                                    </p>
                                )}

                                {unavailableItems.length > 0 && (
                                    <p className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-3">
                                        {unavailableItems.map((item) => item.name).join(', ')}{' '}
                                        {unavailableItems.length > 1 ? 'are' : 'is'} out of stock. Remove{' '}
                                        {unavailableItems.length > 1 ? 'them' : 'it'} from your order (trash icon) to continue.
                                    </p>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || cartItems.length === 0 || unavailableItems.length > 0}
                                    className={`w-full mt-4 bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors ${ (loading || cartItems.length === 0 || unavailableItems.length > 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Placing Order...' : userInfo ? 'Place Order' : 'Log in to Place Order'}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <OrderPlacedModal isOpen={isModalOpen} onClose={handleCloseModal} orderId={placedOrderId} />
        </>
    );
};

export default Checkout;
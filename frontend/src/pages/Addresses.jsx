import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/solid';
import { useUser } from '../context/UserContext';

// Reusable Input
const FormInput = ({ id, label, placeholder, defaultValue, required = true }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type="text"
            id={id}
            name={id}
            defaultValue={defaultValue}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder={placeholder}
            required={required}
        />
    </div>
);

// Form Component (Handles both Add and Edit)
const AddressForm = ({ initialData, onSave, onCancel, saving }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const addressData = {
            fullName: formData.get('fullName'),
            addressLine1: formData.get('addressLine1'),
            addressLine2: formData.get('addressLine2') || '',
            city: formData.get('city'),
            state: formData.get('state'),
            postalCode: formData.get('postalCode'),
            country: 'India', // Hardcoded for now
        };
        onSave(addressData);
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg shadow-inner space-y-4 mb-8 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {initialData ? 'Edit Address' : 'Add New Address'}
            </h2>

            <FormInput id="fullName" label="Full Name" placeholder="John Doe" defaultValue={initialData?.fullName} />
            <FormInput id="addressLine1" label="Address Line 1" placeholder="123 Spice Lane" defaultValue={initialData?.addressLine1} />
            <FormInput id="addressLine2" label="Address Line 2 (Optional)" placeholder="Apartment, Suite, Unit" required={false} defaultValue={initialData?.addressLine2} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput id="city" label="City" placeholder="Mumbai" defaultValue={initialData?.city} />
                <FormInput id="state" label="State" placeholder="Maharashtra" defaultValue={initialData?.state} />
                <FormInput id="postalCode" label="Postal Code" placeholder="400001" defaultValue={initialData?.postalCode} />
            </div>

            <div className="flex justify-end gap-4 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md hover:bg-gray-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className={`bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-700 ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {saving ? 'Saving...' : (initialData ? 'Update Address' : 'Save Address')}
                </button>
            </div>
        </form>
    );
};


const Addresses = () => {
    const { userInfo } = useUser();

    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null); // Track which address is being edited (by _id)

    const authConfig = userInfo
        ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
        : null;

    // --- Load addresses from the backend ---
    useEffect(() => {
        const fetchAddresses = async () => {
            if (!userInfo) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const { data } = await axios.get('/api/users/addresses', authConfig);
                setAddresses(data);
            } catch (err) {
                toast.error('Failed to load your addresses.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAddresses();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo]);

    // Handle Save (Add or Update)
    const handleSaveAddress = async (addressData) => {
        setSaving(true);
        try {
            if (editingId) {
                const { data } = await axios.put(`/api/users/addresses/${editingId}`, addressData, authConfig);
                setAddresses(data);
                toast.success('Address updated.');
            } else {
                const { data } = await axios.post('/api/users/addresses', addressData, authConfig);
                setAddresses(data);
                toast.success('Address saved.');
            }
            closeForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save address.');
        } finally {
            setSaving(false);
        }
    };

    // Open Form for Editing
    const handleEditClick = (addressId) => {
        setEditingId(addressId);
        setShowForm(true);
    };

    // Delete Address
    const handleDeleteClick = async (addressId) => {
        if (!window.confirm('Are you sure you want to delete this address?')) return;

        try {
            const { data } = await axios.delete(`/api/users/addresses/${addressId}`, authConfig);
            setAddresses(data);
            toast.success('Address deleted.');
            if (editingId === addressId) closeForm();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete address.');
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingId(null);
    };

    if (!userInfo) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">My Addresses</h1>
                <p className="text-lg text-gray-600 mb-6">Please log in to manage your saved addresses.</p>
                <Link to="/login" className="bg-red-600 text-white px-6 py-2 rounded-md hover:bg-red-700 transition-colors">
                    Go to Login
                </Link>
            </div>
        );
    }

    const editingAddress = editingId ? addresses.find((a) => a._id === editingId) : null;

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">My Addresses</h1>

            {/* Show Form (Pass initialData if editing) */}
            {showForm && (
                <AddressForm
                    initialData={editingAddress}
                    onSave={handleSaveAddress}
                    onCancel={closeForm}
                    saving={saving}
                />
            )}

            {loading ? (
                <p className="text-center text-gray-500 py-8">Loading your addresses...</p>
            ) : (
                <>
                    {/* Address List */}
                    <div className="space-y-6">
                        {addresses.map((address) => (
                            <div key={address._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
                                {editingId === address._id && <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none"></div>}

                                {address.isDefault && (
                                    <span className="absolute top-4 right-4 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded-full">
                                        Default
                                    </span>
                                )}

                                <p className="font-semibold text-gray-800">{address.fullName}</p>
                                <p className="text-gray-600">{address.addressLine1}{address.addressLine2 ? `, ${address.addressLine2}` : ''}</p>
                                <p className="text-gray-600">{address.city}, {address.state} {address.postalCode}</p>
                                <p className="text-gray-600">{address.country}</p>

                                <div className="mt-4 space-x-4 flex">
                                    <button
                                        onClick={() => handleEditClick(address._id)}
                                        className="text-sm font-medium text-blue-600 hover:underline hover:text-blue-800"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(address._id)}
                                        className="text-sm font-medium text-gray-500 hover:text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}

                        {addresses.length === 0 && !showForm && (
                            <p className="text-center text-gray-500 py-8">You haven't saved any addresses yet.</p>
                        )}
                    </div>

                    {/* Add New Button (Hidden if form is open) */}
                    {!showForm && (
                        <div className="text-center mt-8">
                            <button
                                onClick={() => setShowForm(true)}
                                className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-700 transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Add New Address
                            </button>
                        </div>
                    )}
                </>
            )}

            <div className="text-center mt-10">
                <Link to="/account/dashboard" className="text-red-600 hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default Addresses;

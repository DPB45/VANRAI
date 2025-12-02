import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/solid';

// Reusable Input (Updated to handle defaultValue)
const FormInput = ({ id, label, placeholder, defaultValue, required = true }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type="text"
            id={id}
            name={id}
            defaultValue={defaultValue} // <-- Key change: use defaultValue
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder={placeholder}
            required={required}
        />
    </div>
);

// Form Component (Handles both Add and Edit)
const AddressForm = ({ initialData, onSave, onCancel }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const addressData = {
            name: formData.get('fullName'),
            line1: formData.get('addressLine1'),
            line2: formData.get('addressLine2') || '',
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

            <FormInput id="fullName" label="Full Name" placeholder="John Doe" defaultValue={initialData?.name} />
            <FormInput id="addressLine1" label="Address Line 1" placeholder="123 Spice Lane" defaultValue={initialData?.line1} />
            <FormInput id="addressLine2" label="Address Line 2 (Optional)" placeholder="Apartment, Suite, Unit" required={false} defaultValue={initialData?.line2} />

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
                    className="bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-700"
                >
                    {initialData ? 'Update Address' : 'Save Address'}
                </button>
            </div>
        </form>
    );
};


const Addresses = () => {
    // Default Sample Data
    const [addresses, setAddresses] = useState([
        {
            name: 'John Doe',
            line1: '123 Spice Lane',
            line2: 'Apartment Suite',
            city: 'Mumbai',
            state: 'Maharashtra',
            postalCode: '400001',
            country: 'India',
        }
    ]);

    const [showForm, setShowForm] = useState(false);
    const [editingIndex, setEditingIndex] = useState(null); // Track which item is being edited

    // Handle Save (Add or Update)
    const handleSaveAddress = (addressData) => {
        if (editingIndex !== null) {
            // Update existing address
            const updatedAddresses = [...addresses];
            updatedAddresses[editingIndex] = addressData;
            setAddresses(updatedAddresses);
        } else {
            // Add new address
            setAddresses([...addresses, addressData]);
        }
        closeForm();
    };

    // Open Form for Editing
    const handleEditClick = (index) => {
        setEditingIndex(index);
        setShowForm(true);
    };

    // Delete Address
    const handleDeleteClick = (indexToDelete) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            setAddresses(addresses.filter((_, index) => index !== indexToDelete));
            // If we deleted the item currently being edited, close the form
            if (editingIndex === indexToDelete) {
                closeForm();
            }
        }
    };

    const closeForm = () => {
        setShowForm(false);
        setEditingIndex(null);
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">My Addresses</h1>

            {/* Show Form (Pass initialData if editing) */}
            {showForm && (
                <AddressForm
                    initialData={editingIndex !== null ? addresses[editingIndex] : null}
                    onSave={handleSaveAddress}
                    onCancel={closeForm}
                />
            )}

            {/* Address List */}
            <div className="space-y-6">
                {addresses.map((address, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200 relative">
                        {/* Highlight card if currently editing */}
                        {editingIndex === index && <div className="absolute inset-0 border-2 border-red-500 rounded-lg pointer-events-none"></div>}

                        <p className="font-semibold text-gray-800">{address.name}</p>
                        <p className="text-gray-600">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                        <p className="text-gray-600">{address.city}, {address.state} {address.postalCode}</p>
                        <p className="text-gray-600">{address.country}</p>

                        <div className="mt-4 space-x-4 flex">
                            <button
                                onClick={() => handleEditClick(index)}
                                className="text-sm font-medium text-blue-600 hover:underline hover:text-blue-800"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDeleteClick(index)}
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

            <div className="text-center mt-10">
                <Link to="/account/dashboard" className="text-red-600 hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default Addresses;
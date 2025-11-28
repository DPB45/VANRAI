import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

// Reusable Input for the Add Address Form
const FormInput = ({ id, label, placeholder, required = true }) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type="text"
            id={id}
            name={id}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            placeholder={placeholder}
            required={required}
        />
    </div>
);

// Form Component for Adding a New Address
const AddAddressForm = ({ onAdd, onCancel }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newAddress = {
            name: formData.get('fullName'),
            line1: formData.get('addressLine1'),
            line2: formData.get('addressLine2') || '', // Optional field
            city: formData.get('city'),
            state: formData.get('state'),
            postalCode: formData.get('postalCode'),
            country: 'India', // Assuming India for now
        };
        onAdd(newAddress); // Pass the new address object up
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-lg shadow-inner space-y-4 mb-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Address</h2>
            <FormInput id="fullName" label="Full Name" placeholder="John Doe" />
            <FormInput id="addressLine1" label="Address Line 1" placeholder="123 Spice Lane" />
            <FormInput id="addressLine2" label="Address Line 2 (Optional)" placeholder="Apartment, Suite, Unit" required={false} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput id="city" label="City" placeholder="Mumbai" />
                <FormInput id="state" label="State" placeholder="Maharashtra" />
                <FormInput id="postalCode" label="Postal Code" placeholder="400001" />
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
                    Save Address
                </button>
            </div>
        </form>
    );
};


// Main Addresses Page Component
const Addresses = () => {
    // State to hold addresses (with a default example)
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
    const [showAddForm, setShowAddForm] = useState(false);

    // Function to add a new address
    const handleAddAddress = (newAddress) => {
        setAddresses([...addresses, newAddress]); // Add new address to the array
        setShowAddForm(false); // Hide the form
    };

    // Function to delete an address by its index
    const handleDeleteAddress = (indexToDelete) => {
        if (window.confirm('Are you sure you want to delete this address?')) {
            setAddresses(addresses.filter((_, index) => index !== indexToDelete));
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">My Addresses</h1>

            {/* Conditionally render the Add Address Form */}
            {showAddForm && (
                <AddAddressForm
                    onAdd={handleAddAddress}
                    onCancel={() => setShowAddForm(false)}
                />
            )}

            {/* List of Addresses */}
            <div className="space-y-6">
                {addresses.map((address, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                        <p className="font-semibold text-gray-800">{address.name}</p>
                        <p className="text-gray-600">{address.line1}{address.line2 ? `, ${address.line2}` : ''}</p>
                        <p className="text-gray-600">{address.city}, {address.state} {address.postalCode}</p>
                        <p className="text-gray-600">{address.country}</p>
                        <div className="mt-4 space-x-4">
                            <button className="text-sm text-red-600 hover:underline font-medium">
                                Edit (Coming Soon)
                            </button>
                            <button
                                onClick={() => handleDeleteAddress(index)} // Call delete handler
                                className="text-sm text-gray-500 hover:text-red-600 hover:underline font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}

                {/* Show message if no addresses exist */}
                {addresses.length === 0 && !showAddForm && (
                    <p className="text-center text-gray-500 py-8">You haven't saved any addresses yet.</p>
                )}
            </div>

            {/* Add New Address Button (only show if form is hidden) */}
            {!showAddForm && (
                <div className="text-center mt-8">
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="inline-flex items-center gap-2 bg-red-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-red-700 transition-colors"
                    >
                        <PlusIcon className="w-5 h-5" />
                        Add New Address
                    </button>
                </div>
            )}

            {/* Back to Dashboard Link */}
            <div className="text-center mt-10">
                <Link to="/account/dashboard" className="text-red-600 hover:underline">
                    &larr; Back to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default Addresses;
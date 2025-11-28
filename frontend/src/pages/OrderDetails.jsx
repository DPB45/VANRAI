import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../context/UserContext';
import { CheckCircleIcon, XCircleIcon, ClockIcon, TruckIcon, HomeIcon } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

// --- Order Status Stepper ---
const OrderStatusStepper = ({ currentStatus }) => {
    const steps = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentStepIndex = steps.indexOf(currentStatus);

    return (
        <div className="w-full py-6">
            <div className="flex items-center">
                {steps.map((step, index) => (
                    <React.Fragment key={step}>
                        <div className="relative flex flex-col items-center text-center flex-1">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm z-10
                                ${index <= currentStepIndex ? 'bg-green-600' : 'bg-gray-300'}`}
                            >
                                {index < currentStepIndex ? <CheckCircleIcon className="w-6 h-6" /> : index + 1}
                            </div>
                            <div className={`mt-2 text-xs font-medium ${index <= currentStepIndex ? 'text-green-700' : 'text-gray-500'}`}>
                                {step}
                            </div>
                        </div>
                        {/* Connector Line */}
                        {index < steps.length - 1 && (
                            <div className={`flex-auto border-t-4 transition duration-500 ease-in-out ${index < currentStepIndex ? 'border-green-600' : 'border-gray-300'}`}></div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};

const OrderDetails = () => {
    const { id: orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { userInfo } = useUser();

    // Admin State for updating status
    const [statusToUpdate, setStatusToUpdate] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [courierName, setCourierName] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');

    const fetchOrderDetails = async () => {
        if (!userInfo) return;
        try {
            setLoading(true);
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`/api/orders/${orderId}`, config);
            setOrder(data);
            setStatusToUpdate(data.orderStatus); // Set initial dropdown value
        } catch (err) {
            setError('Failed to fetch order details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderDetails();
    }, [orderId, userInfo]);

    const handleStatusUpdate = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };

            await axios.put(
                `/api/orders/${orderId}/status`,
                {
                    status: statusToUpdate,
                    trackingId,
                    courierName,
                    trackingUrl
                },
                config
            );

            toast.success('Order status updated!');
            fetchOrderDetails(); // Refresh data
        } catch (err) {
            toast.error('Failed to update status.');
        }
    };

    if (loading) return <p className="text-center py-20">Loading...</p>;
    if (error) return <p className="text-center py-20 text-red-500">{error}</p>;
    if (!order) return <p className="text-center py-20">Order not found.</p>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">Order Details</h1>

            <div className="bg-white p-8 rounded-lg shadow-md space-y-8">

                {/* Header & Status */}
                <div className="border-b pb-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-800">Order #{order._id.substring(0, 10)}...</h2>
                        <span className="text-sm text-gray-500">
                            Placed: {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    {/* --- TRACKING STEPPER --- */}
                    <OrderStatusStepper currentStatus={order.orderStatus} />

                    {/* --- TRACKING INFO (Visible if shipped) --- */}
                    {order.trackingInfo && order.trackingInfo.trackingId && (
                        <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                            <h4 className="font-bold text-blue-800 flex items-center gap-2">
                                <TruckIcon className="w-5 h-5" /> Tracking Information
                            </h4>
                            <div className="mt-2 text-sm text-blue-900 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <p><span className="font-semibold">Courier:</span> {order.trackingInfo.courierName}</p>
                                <p><span className="font-semibold">Tracking ID:</span> {order.trackingInfo.trackingId}</p>
                                {order.trackingInfo.trackingUrl && (
                                    <p>
                                        <a href={order.trackingInfo.trackingUrl} target="_blank" rel="noreferrer" className="underline hover:text-blue-600">
                                            Track Package &rarr;
                                        </a>
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* --- ADMIN CONTROLS (Only for Admins) --- */}
                {userInfo && userInfo.isAdmin && (
                    <div className="bg-gray-100 p-6 rounded-md border border-gray-300">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Admin: Update Status</h3>
                        <form onSubmit={handleStatusUpdate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Change Status</label>
                                    <select
                                        value={statusToUpdate}
                                        onChange={(e) => setStatusToUpdate(e.target.value)}
                                        className="w-full p-2 border border-gray-300 rounded mt-1"
                                    >
                                        <option value="Processing">Processing</option>
                                        <option value="Shipped">Shipped</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                    </select>
                                </div>

                                {/* Show inputs only if status is Shipped */}
                                {statusToUpdate === 'Shipped' && (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Courier Name</label>
                                            <input type="text" placeholder="e.g. BlueDart" className="w-full p-2 border border-gray-300 rounded mt-1"
                                                value={courierName} onChange={(e) => setCourierName(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tracking ID</label>
                                            <input type="text" placeholder="e.g. 123456789" className="w-full p-2 border border-gray-300 rounded mt-1"
                                                value={trackingId} onChange={(e) => setTrackingId(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">Tracking URL (Optional)</label>
                                            <input type="text" placeholder="https://..." className="w-full p-2 border border-gray-300 rounded mt-1"
                                                value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <button type="submit" className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">
                                Update Status
                            </button>
                        </form>
                    </div>
                )}
                {/* --------------------------------------- */}

                {/* Order Items & Summary (Remains the same) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     {/* ... (Keeping the rest of your layout the same) ... */}
                     <div className="md:col-span-1 space-y-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">Shipping Address</h3>
                            {order.shippingAddress && (
                                <div className="text-gray-600">
                                    <p>{order.shippingAddress.fullName}</p>
                                    <p>{order.shippingAddress.addressLine1}</p>
                                    <p>{order.shippingAddress.city}, {order.shippingAddress.postalCode}</p>
                                    <p>{order.shippingAddress.country}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="md:col-span-2">
                         <h3 className="text-lg font-semibold text-gray-700 mb-4">Order Items</h3>
                         <div className="space-y-4">
                            {order.orderItems.map(item => (
                                <div key={item.product} className="flex justify-between items-center border-b pb-4">
                                    <div className="flex items-center">
                                        <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded mr-4"/>
                                        <div><p className="font-medium">{item.name}</p><p className="text-sm text-gray-500">x{item.qty}</p></div>
                                    </div>
                                    <p className="font-medium">₹{(item.qty * item.price).toFixed(2)}</p>
                                </div>
                            ))}
                         </div>
                         <div className="mt-6 pt-4 border-t flex justify-between items-center text-xl font-bold text-gray-800">
                             <span>Total</span>
                             <span>₹{order.totalPrice.toFixed(2)}</span>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetails;
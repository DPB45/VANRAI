import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import validator from 'validator';
import sendEmail from '../utils/emailUtils.js';
import User from '../models/userModel.js';

// Create new order (unchanged)
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice } = req.body;

  if (!orderItems || orderItems.length === 0) { res.status(400); throw new Error('No order items'); }
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) { res.status(400); throw new Error('Please fill in all required shipping address fields.'); }
  if (!validator.isNumeric(shippingAddress.postalCode)) { res.status(400); throw new Error('Postal Code must be numeric.'); }

  const order = new Order({
    orderItems: orderItems.map((item) => ({
      name: item.name, qty: item.quantity, image: item.imageUrl, price: item.price, product: item._id,
    })),
    user: req.user._id, shippingAddress, paymentMethod, itemsPrice, shippingPrice, totalPrice,
  });

  const createdOrder = await order.save();

  const user = await User.findById(req.user._id);
  if (user) {
      await sendEmail({
          to: user.email,
          subject: `Order Confirmation #${createdOrder._id.toString().substring(18)}`,
          text: `Your order for ₹${totalPrice.toFixed(2)} has been successfully placed.`,
          html: `<h2>Order Confirmation</h2><p>Thank you for your order! Your total is <b>₹${totalPrice.toFixed(2)}</b> and will be shipped soon.</p>`,
      });
  }

  res.status(201).json(createdOrder);
});

// Get My Orders (unchanged)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
});

// Get Order By ID (unchanged)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (order) {
    if (req.user.isAdmin || order.user._id.toString() === req.user._id.toString()) {
        res.json(order);
    } else {
        res.status(403);
        throw new Error('Not authorized');
    }
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// Get All Orders (unchanged)
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.json(orders);
});

// --- NEW FUNCTION: Update Order Status (Admin) ---
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingId, courierName, trackingUrl } = req.body;
  const order = await Order.findById(req.params.id);

  if (order) {
    order.orderStatus = status;

    // If status is Shipped, save tracking info
    if (status === 'Shipped') {
        order.trackingInfo = {
            trackingId: trackingId || '',
            courierName: courierName || '',
            trackingUrl: trackingUrl || ''
        };

        // Email Trigger: Shipped
        const user = await User.findById(order.user);
        if (user) {
             await sendEmail({
                to: user.email,
                subject: `Your Order has Shipped!`,
                text: `Your order is on its way via ${courierName}. Tracking ID: ${trackingId}`,
                html: `<h2>Order Shipped</h2><p>Your order has been shipped via <strong>${courierName}</strong>.</p><p>Tracking ID: ${trackingId}</p>`,
            });
        }
    }

    // If Delivered, mark timestamp and legacy field
    if (status === 'Delivered') {
        order.isDelivered = true;
        order.deliveredAt = Date.now();

        // Email Trigger: Delivered
        const user = await User.findById(order.user);
        if (user) {
             await sendEmail({
                to: user.email,
                subject: `Order Delivered`,
                text: `Your order has been delivered. Enjoy!`,
                html: `<h2>Delivered</h2><p>Your order has been delivered. We hope you enjoy your spices!</p>`,
            });
        }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});
// ------------------------------------------------

// Get Dashboard Stats (unchanged)
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalUsers = await User.countDocuments();
  const salesData = await Order.aggregate([{ $group: { _id: null, totalSales: { $sum: "$totalPrice" } } }]);
  const totalSales = salesData.length > 0 ? salesData[0].totalSales : 0;
  res.json({ totalOrders, totalUsers, totalSales });
});

export { addOrderItems, getMyOrders, getOrderById, getOrders, updateOrderStatus, getDashboardStats };
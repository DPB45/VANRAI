import asyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js';
import validator from 'validator';
import sendEmail from '../utils/emailUtils.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import mongoose from 'mongoose';

// Flat shipping fee. Kept server-side so it can't be tampered with by the
// client, and defined once here as the single source of truth.
const SHIPPING_PRICE = 50.0;

// Create new order.
//
// SECURITY NOTE: prices are NEVER trusted from the client. The client only
// tells us which product IDs and quantities it wants; we look up the real
// price for each product in the database and compute all totals ourselves.
// This prevents a user from tampering with their cart in localStorage (or
// calling this endpoint directly) to check out at an arbitrary price.
const addOrderItems = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) { res.status(400); throw new Error('No order items'); }
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) { res.status(400); throw new Error('Please fill in all required shipping address fields.'); }
  if (!validator.isNumeric(shippingAddress.postalCode)) { res.status(400); throw new Error('Postal Code must be numeric.'); }

  // Look up every product referenced in the cart in one query. Filter out
  // anything that isn't a well-formed ObjectId first so a malformed/tampered
  // ID can't throw an unhandled CastError.
  const productIds = orderItems
    .map((item) => item._id)
    .filter((id) => mongoose.isValidObjectId(id));
  const products = await Product.find({ _id: { $in: productIds } });
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  const verifiedOrderItems = [];
  let itemsPrice = 0;

  for (const item of orderItems) {
    const product = productMap.get(String(item._id));

    if (!product) {
      res.status(400);
      throw new Error(`One of the items in your cart is no longer available.`);
    }

    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      res.status(400);
      throw new Error(`Invalid quantity for ${product.name}.`);
    }

    if (!product.inStock) {
      res.status(400);
      throw new Error(`${product.name} is currently out of stock.`);
    }

    verifiedOrderItems.push({
      name: product.name,
      qty,
      image: product.imageUrl,
      price: product.price, // <-- real price from the DB, not the client
      product: product._id.toString(),
    });

    itemsPrice += product.price * qty;
  }

  const shippingPrice = SHIPPING_PRICE;
  const totalPrice = itemsPrice + shippingPrice;

  const order = new Order({
    orderItems: verifiedOrderItems,
    user: req.user._id,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    shippingPrice,
    totalPrice,
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

        // This is a Cash-on-Delivery store, so payment is collected at the
        // moment of delivery. Mark the order paid here too instead of
        // leaving isPaid permanently false for every order.
        if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
        }

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
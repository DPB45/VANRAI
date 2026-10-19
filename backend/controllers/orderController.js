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
  const { orderItems, shippingAddress } = req.body;

  if (!orderItems || orderItems.length === 0) { res.status(400); throw new Error('No order items'); }
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.postalCode) { res.status(400); throw new Error('Please fill in all required shipping address fields.'); }
  if (!/^[1-9]\d{5}$/.test(String(shippingAddress.postalCode).trim())) { res.status(400); throw new Error('Please enter a valid 6-digit PIN code.'); }
  if (!/^[6-9]\d{9}$/.test(String(shippingAddress.phone || '').trim())) { res.status(400); throw new Error('Please enter a valid 10-digit mobile number.'); }

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
      // item.name is whatever the client's cart had locally for this product —
      // safe to echo back (it's the user's own submitted data), and much more
      // useful than a generic "one of the items" when they have several in cart.
      throw new Error(`"${item.name || 'An item'}" in your cart is no longer available. Please remove it and try again.`);
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
    // Store is Cash-on-Delivery only; never trust a client-supplied string here.
    paymentMethod: 'COD',
    itemsPrice,
    shippingPrice,
    totalPrice,
  });

  const createdOrder = await order.save();

  const user = await User.findById(req.user._id);
  if (user) {
      await sendEmail({
          to: user.email,
          subject: `Order Confirmation #${createdOrder._id.toString().slice(-8).toUpperCase()}`,
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
    // order.user can be null if the account that placed it has since been
    // deleted (a dangling ref after population) — guard before reading
    // ._id so that case 404s/403s cleanly instead of throwing a 500.
    const isOwner = order.user && order.user._id.toString() === req.user._id.toString();
    if (req.user.isAdmin || isOwner) {
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
const VALID_STATUSES = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered'];

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, trackingId, courierName, trackingUrl } = req.body;

  // Reject anything outside the known workflow instead of blindly saving it.
  if (!VALID_STATUSES.includes(status)) {
    res.status(400);
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  // Tracking links are rendered as <a href> for customers; only allow http(s).
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    res.status(400);
    throw new Error('Tracking URL must start with http:// or https://');
  }

  const order = await Order.findById(req.params.id);

  if (order) {
    const previousStatus = order.orderStatus;
    const statusChanged = previousStatus !== status;
    order.orderStatus = status;

    const user = order.user ? await User.findById(order.user) : null;

    // If status is Shipped, save tracking info
    if (status === 'Shipped') {
        order.trackingInfo = {
            trackingId: trackingId || '',
            courierName: courierName || '',
            trackingUrl: trackingUrl || ''
        };

        // Only email on an actual transition, so re-saving doesn't re-spam the customer.
        if (user && statusChanged) {
             await sendEmail({
                to: user.email,
                subject: `Your Order has Shipped!`,
                text: `Your order is on its way via ${courierName || 'our courier'}. Tracking ID: ${trackingId || 'N/A'}`,
                html: `<h2>Order Shipped</h2><p>Your order has been shipped via <strong>${courierName || 'our courier'}</strong>.</p><p>Tracking ID: ${trackingId || 'N/A'}</p>`,
            });
        }
    }

    if (status === 'Out for Delivery' && user && statusChanged) {
        await sendEmail({
            to: user.email,
            subject: `Your Order is Out for Delivery`,
            text: `Your order is out for delivery today. Please keep cash ready.`,
            html: `<h2>Out for Delivery</h2><p>Your order is out for delivery today. This is a Cash on Delivery order, so please keep the payment ready.</p>`,
        });
    }

    if (status === 'Delivered') {
        order.isDelivered = true;
        if (!order.deliveredAt) order.deliveredAt = Date.now();

        // This is a Cash-on-Delivery store, so payment is collected at the
        // moment of delivery.
        if (!order.isPaid) {
            order.isPaid = true;
            order.paidAt = Date.now();
        }

        if (user && statusChanged) {
             await sendEmail({
                to: user.email,
                subject: `Order Delivered`,
                text: `Your order has been delivered. Enjoy!`,
                html: `<h2>Delivered</h2><p>Your order has been delivered. We hope you enjoy your spices!</p>`,
            });
        }
    } else if (previousStatus === 'Delivered') {
        // Admin moved an order back out of Delivered (e.g. a mis-click):
        // undo the delivered/paid flags so the data stays consistent.
        order.isDelivered = false;
        order.deliveredAt = undefined;
        order.isPaid = false;
        order.paidAt = undefined;
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
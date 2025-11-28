import express from 'express';
import { check, validationResult } from 'express-validator';
const router = express.Router();
import {
    addOrderItems,
    getMyOrders,
    getOrderById,
    getOrders,
    updateOrderStatus, // <-- Import new function
    getDashboardStats
} from '../controllers/orderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) { return next(); }
    const extractedErrors = errors.array().map(err => err.msg);
    return res.status(400).json({ message: extractedErrors[0] });
};

router.route('/')
    .post(protect, [
            check('shippingAddress.fullName', 'Full Name is required').notEmpty(),
            check('shippingAddress.addressLine1', 'Address Line 1 is required').notEmpty(),
            check('shippingAddress.city', 'City is required').notEmpty(),
            check('shippingAddress.state', 'State is required').notEmpty(),
            check('shippingAddress.postalCode', 'Postal Code must be numeric').isNumeric(),
        ], validate, addOrderItems)
    .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/stats').get(protect, admin, getDashboardStats);

router.route('/:id').get(protect, getOrderById);

// --- UPDATED ROUTE ---
router.route('/:id/status')
    .put(protect, admin, updateOrderStatus);
// ---------------------

export default router;
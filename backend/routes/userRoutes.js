import express from 'express';
// 1. Import check for validation chains and validationResult for error checking
import { check, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
const router = express.Router();

// The global limiter in server.js (100 req/15min) is far too loose for
// endpoints that are realistic brute-force targets: a login password guess,
// a 6-digit 2FA code (1,000,000 possibilities), or spamming password-reset
// emails at someone. This caps those specifically, much tighter.
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Too many attempts. Please wait a few minutes and try again.',
});
import {
    registerUser,
    authUser,
    updateUserProfile,
    requestPasswordReset,
    resetPassword,
    getUsers,
    toggleWishlist,
    getWishlist,
    verifyTwoFactorLogin, // <-- Import
    toggleTwoFactor,
    deleteUser,// <-- Import
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// --- Custom middleware to handle and send validation errors ---
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    const extractedErrors = errors.array().map(err => err.msg);
    return res.status(400).json({ message: extractedErrors[0] });
};


// --- PUBLIC ROUTES ---

// 1. Register User
router.post(
    '/register',
    [
        check('name', 'Name is required').notEmpty(),
        check('email', 'Invalid email format').isEmail(),
        check('password', 'Password must be at least 6 characters').isLength({ min: 6 }),
    ],
    validate,
    registerUser
);

// 2. Login User (Step 1)
router.post(
    '/login',
    authLimiter,
    [
        check('email', 'Invalid email format').isEmail(),
        check('password', 'Password is required').notEmpty(),
    ],
    validate,
    authUser
);

// 3. Verify 2FA Code (Step 2 of Login)
router.post('/login/verify2fa', authLimiter, verifyTwoFactorLogin); // <-- NEW ROUTE

// 4. Forgot Password Request
router.post(
    '/forgotpassword',
    authLimiter,
    [check('email', 'Invalid email format').isEmail()],
    validate,
    requestPasswordReset
);

// 5. Reset Password
router.put(
    '/resetpassword/:token',
    [check('password', 'New password must be at least 6 characters').isLength({ min: 6 })],
    validate,
    resetPassword
);

// --- PRIVATE ROUTES ---

// 6. Update Profile
router.route('/profile').put(
    protect,
    [
        check('email', 'Invalid email format for update').optional().isEmail(),
        check('password', 'New password must be at least 6 characters').optional().isLength({ min: 6 }),
    ],
    validate,
    updateUserProfile
);

// 7. Toggle 2FA Setting
router.route('/2fa').put(protect, toggleTwoFactor); // <-- NEW ROUTE

// WISHLIST ROUTES
router.route('/wishlist')
    .put(protect, toggleWishlist)
    .get(protect, getWishlist);

// ADDRESS ROUTES
router.route('/addresses')
    .get(protect, getAddresses)
    .post(protect, addAddress);

router.route('/addresses/:addressId')
    .put(protect, updateAddress)
    .delete(protect, deleteAddress);

// Admin Route: Get all users
router.route('/').get(protect, admin, getUsers);
router.route('/:id') // <-- Add this block
    .delete(protect, admin, deleteUser);
export default router;
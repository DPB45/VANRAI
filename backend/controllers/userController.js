import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import validator from 'validator';
import crypto from 'crypto';
import sendEmail from '../utils/emailUtils.js';

// Helper to generate JWT
const generateToken = (id) => {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
  }
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Helper to generate Password Reset Token
const generateResetToken = () => {
    return crypto.randomBytes(20).toString('hex');
};

// --- AUTH CONTROLLERS ---

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Basic validation (detailed validation handled by routes)
  if (!name || !email || !password) {
     res.status(400);
     throw new Error('Please fill in all fields.');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists with this email.');
  }

  const user = await User.create({ name, email, password });

  if (user) {
    // Send Welcome Email
    await sendEmail({
        to: user.email,
        subject: `Welcome to Vanrai Spices, ${user.name}!`,
        text: `Thank you for registering with us. Your journey to authentic Indian flavors begins now!`,
        html: `<h2>Welcome to Vanrai Spices!</h2><p>Your journey to authentic Indian flavors begins now. We're excited to have you.</p>`,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data during creation.');
  }
});

// @desc    Authenticate user & get token (Login Step 1)
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
      res.status(400);
      throw new Error('Please enter a valid email and password.');
  }

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {

    // 2FA CHECK
    if (user.isTwoFactorEnabled) {
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      user.twoFactorCode = code;
      user.twoFactorCodeExpire = Date.now() + 10 * 60 * 1000; // 10 mins
      await user.save();

      await sendEmail({
        to: user.email,
        subject: 'Your 2FA Login Code',
        text: `Your login code is ${code}`,
        html: `<h2>Vanrai Spices Login</h2><p>Your authentication code is: <b>${code}</b></p><p>This code expires in 10 minutes.</p>`
      });

      res.json({
        twoFactorRequired: true,
        userId: user._id
      });
      return;
    }

    // Standard Login Success
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password.');
  }
});

// @desc    Verify 2FA Code (Login Step 2)
// @route   POST /api/users/login/verify2fa
// @access  Public
const verifyTwoFactorLogin = asyncHandler(async (req, res) => {
  const { userId, code } = req.body;
  const user = await User.findById(userId);

  if (user && user.twoFactorCode === code && user.twoFactorCodeExpire > Date.now()) {
    // Success! Clear code
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpire = undefined;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid or expired code');
  }
});

// --- PROFILE & SETTINGS ---

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
       user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      isTwoFactorEnabled: updatedUser.isTwoFactorEnabled,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// @desc    Toggle 2FA On/Off
// @route   PUT /api/users/2fa
// @access  Private
const toggleTwoFactor = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.isTwoFactorEnabled = !user.isTwoFactorEnabled;
    await user.save();
    res.json({
      message: `2FA turned ${user.isTwoFactorEnabled ? 'ON' : 'OFF'}`,
      isTwoFactorEnabled: user.isTwoFactorEnabled
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

// --- PASSWORD RESET ---

// @desc    Request Password Reset
// @route   POST /api/users/forgotpassword
// @access  Public
const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) {
    const resetToken = generateResetToken();
    const resetUrl = `http://localhost:5173/resetpassword/${resetToken}`;

    // Send Email
    await sendEmail({
        to: user.email,
        subject: `Password Reset Request for Vanrai Spices`,
        text: `Your password reset link is: ${resetUrl}. This link is valid for 1 hour.`,
        html: `<h2>Vanrai Spices Password Reset</h2><p>Click the link below to reset your password:</p><p><a href="${resetUrl}">Reset Password</a></p><p>If you did not request this, please ignore this email.</p>`,
    });
    console.log(`🔑 Password reset link sent to ${user.email}.`);

    res.json({ message: 'Password reset link sent successfully.' });
  } else {
    res.json({ message: 'If a user exists, a password reset link has been sent to their email.' });
  }
});

// @desc    Reset password
// @route   PUT /api/users/resetpassword/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // In a real app, verify token against DB. For simulation:
  if (token === 'valid_reset_token') {
    res.json({ message: 'Password reset successful. Please log in.' });
  } else {
    res.status(400);
    throw new Error('Invalid or expired reset token.');
  }
});

// --- ADMIN ---

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// --- WISHLIST ---

// @desc    Toggle item in wishlist
// @route   PUT /api/users/wishlist
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  if (!productId) {
    res.status(400);
    throw new Error('Product ID is required.');
  }

  const index = user.wishlist.findIndex(
    (id) => id.toString() === productId
  );

  if (index >= 0) {
    user.wishlist.splice(index, 1);
    await user.save();
    res.json({ message: 'Item removed from wishlist.', isAdded: false });
  } else {
    user.wishlist.push(productId);
    await user.save();
    res.json({ message: 'Item added to wishlist.', isAdded: true });
  }
});

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist');
  if (user) {
    res.json(user.wishlist);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});

export {
    registerUser,
    authUser,
    updateUserProfile,
    requestPasswordReset,
    resetPassword,
    getUsers,
    toggleWishlist,
    getWishlist,
    verifyTwoFactorLogin,
    toggleTwoFactor
};
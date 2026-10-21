import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import validator from 'validator';
import crypto from 'crypto';
import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import sendEmail from '../utils/emailUtils.js';

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Accounts created before emails were lowercased are stored exactly as the
// user typed them (e.g. "Dhairya@Gmail.com"). An exact lowercase lookup would
// never match those, locking them out, so fall back to a case-insensitive
// match. This also stops "A@x.com" registering next to an existing "a@x.com".
const findUserByEmail = async (rawEmail) => {
  const normalized = String(rawEmail || '').toLowerCase().trim();
  if (!normalized) return null;
  const exact = await User.findOne({ email: normalized });
  if (exact) return exact;
  return User.findOne({ email: new RegExp(`^${escapeRegExp(normalized)}$`, 'i') });
};

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

  // The schema's lowercase:true only normalizes on save, not on query
  // filters, so this lookup must lowercase explicitly or "A@x.com" would
  // slip past a check for an existing "a@x.com".
  const normalizedEmail = email.toLowerCase().trim();
  const userExists = await findUserByEmail(normalizedEmail);
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

  const user = await findUserByEmail(email);

  if (user && (await user.matchPassword(password))) {

    // 2FA CHECK
    if (user.isTwoFactorEnabled) {
      const code = crypto.randomInt(100000, 1000000).toString();

      user.twoFactorCode = code;
      user.twoFactorCodeExpire = Date.now() + 10 * 60 * 1000; // 10 mins
      user.twoFactorAttempts = 0;
      await user.save();

      const emailSent = await sendEmail({
        to: user.email,
        subject: 'Your 2FA Login Code',
        text: `Your login code is ${code}`,
        html: `<h2>Vanrai Spices Login</h2><p>Your authentication code is: <b>${code}</b></p><p>This code expires in 10 minutes.</p>`
      });

      if (!emailSent) {
        // Don't leave a dangling code the user can never actually receive —
        // and don't tell them a code is on its way when it isn't.
        user.twoFactorCode = undefined;
        user.twoFactorCodeExpire = undefined;
        await user.save();
        res.status(500);
        throw new Error('Failed to send your login code. Please try again.');
      }

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
const MAX_2FA_ATTEMPTS = 5;

const codesMatch = (stored, supplied) => {
  const a = Buffer.from(String(stored || ''));
  const b = Buffer.from(String(supplied || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const verifyTwoFactorLogin = asyncHandler(async (req, res) => {
  const { userId, code } = req.body;
  const user = mongoose.isValidObjectId(userId) ? await User.findById(userId) : null;

  const codeActive = user && user.twoFactorCode && user.twoFactorCodeExpire > Date.now();

  if (codeActive && codesMatch(user.twoFactorCode, code)) {
    // Success! Clear code
    user.twoFactorCode = undefined;
    user.twoFactorCodeExpire = undefined;
    user.twoFactorAttempts = 0;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      token: generateToken(user._id),
    });
    return;
  }

  // Wrong guess against a live code: count it, and burn the code after too many
  // so a 6-digit code can't be ground down across many attempts/IPs.
  if (codeActive) {
    user.twoFactorAttempts = (user.twoFactorAttempts || 0) + 1;
    if (user.twoFactorAttempts >= MAX_2FA_ATTEMPTS) {
      user.twoFactorCode = undefined;
      user.twoFactorCodeExpire = undefined;
      user.twoFactorAttempts = 0;
      await user.save();
      res.status(400);
      throw new Error('Too many incorrect codes. Please log in again to get a new code.');
    }
    await user.save();
  }

  res.status(400);
  throw new Error('Invalid or expired code');
});

// --- PROFILE & SETTINGS ---

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;

    const wantsEmailChange =
      req.body.email && req.body.email.toLowerCase().trim() !== user.email.toLowerCase();

    // Changing credentials requires proving knowledge of the current password,
    // so a stolen/left-open session can't be used to take over the account.
    // (400, not 401: the frontend treats 401 as "session expired" and logs out.)
    if (req.body.password || wantsEmailChange) {
      const ok = req.body.currentPassword && (await user.matchPassword(req.body.currentPassword));
      if (!ok) {
        res.status(400);
        throw new Error('Current password is incorrect.');
      }
    }

    if (req.body.email) {
      const normalizedEmail = req.body.email.toLowerCase().trim();
      if (normalizedEmail !== user.email) {
        const emailTaken = await findUserByEmail(normalizedEmail);
        if (emailTaken) {
          res.status(400);
          throw new Error('That email is already in use by another account.');
        }
        user.email = normalizedEmail;
      }
    }

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

  const user = await findUserByEmail(email);

  if (user) {
    // Generate a raw token to email to the user...
    const resetToken = generateResetToken();

    // ...but only ever store a HASH of it in the database. This way,
    // even if the database is ever exposed, the reset tokens can't be
    // used (same principle as never storing plaintext passwords).
    const hashedToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || 'https://vanrai.vercel.app'}/resetpassword/${resetToken}`;

    // Send Email and CHECK SUCCESS
    const emailSent = await sendEmail({
        to: user.email,
        subject: `Password Reset Request`,
        text: `Reset link: ${resetUrl}. This link expires in 30 minutes.`,
        html: `<p>Click here to reset your password: <a href="${resetUrl}">Reset Password</a></p><p>This link expires in 30 minutes. If you didn't request this, you can safely ignore this email.</p>`,
    });

    // If the email failed to send, roll back the token so it can't be
    // used later without the user actually receiving the link.
    if (!emailSent) {
        // Roll the token back, but still answer exactly as we would for an
        // unknown email — a 500 here would reveal that the account exists.
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
        console.error(`Password reset email failed to send for user ${user._id}`);
    } else {
        console.log(`🔑 Password reset link sent to ${user.email}.`);
    }
  }

  // Always return the same generic message, whether or not the user
  // exists, so this endpoint can't be used to enumerate registered emails.
  res.json({ message: 'If an account with that email exists, a password reset link has been sent.' });
});

// @desc    Reset password
// @route   PUT /api/users/resetpassword/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  // Hash the incoming raw token the same way we hashed it at request time,
  // then look up a user with a matching, still-valid token.
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    res.status(400);
    throw new Error('Invalid or expired reset token. Please request a new link.');
  }

  user.password = password; // hashed automatically by the pre('save') hook
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  res.json({ message: 'Password reset successful. Please log in.' });
});

// --- ADMIN ---

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  // NEVER return the password hash to the client, even to an admin — the
  // admin UI only needs name/email/isAdmin/etc, and shipping hashes over
  // the network is an unnecessary exposure if the response is ever logged,
  // cached, or intercepted.
  const users = await User.find({}).select('-password');
  res.json(users);
});

// --- WISHLIST ---

// @desc    Toggle item in wishlist
// @route   PUT /api/users/wishlist
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const user = req.user;

  if (!productId || !mongoose.isValidObjectId(productId)) {
    res.status(400);
    throw new Error('A valid product ID is required.');
  }

  const productExists = await Product.exists({ _id: productId });
  if (!productExists) {
    res.status(404);
    throw new Error('Product not found.');
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

// @desc    Delete a user (Admin)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user._id.toString() === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own account.');
  }

  if (user.isAdmin) {
    res.status(400);
    throw new Error('Admin accounts cannot be deleted from here.');
  }

  await User.deleteOne({ _id: user._id });
  res.json({ message: 'User removed' });
});

// --- ADDRESSES ---

// @desc    Get logged-in user's saved addresses
// @route   GET /api/users/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json(user.addresses);
});

// @desc    Add a new address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { fullName, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

  if (!fullName || !addressLine1 || !city || !state || !postalCode) {
    res.status(400);
    throw new Error('Please fill in all required address fields.');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // If this new address is marked default, unset default on the others.
  if (isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
  }

  user.addresses.push({
    fullName,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country: country || 'India',
    isDefault: !!isDefault || user.addresses.length === 0, // first address defaults to true
  });

  await user.save();
  res.status(201).json(user.addresses);
});

// @desc    Update an existing address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  const { fullName, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

  address.fullName = fullName || address.fullName;
  address.addressLine1 = addressLine1 || address.addressLine1;
  address.addressLine2 = addressLine2 ?? address.addressLine2;
  address.city = city || address.city;
  address.state = state || address.state;
  address.postalCode = postalCode || address.postalCode;
  address.country = country || address.country;

  if (isDefault) {
    user.addresses.forEach((addr) => { addr.isDefault = false; });
    address.isDefault = true;
  }

  await user.save();
  res.json(user.addresses);
});

// @desc    Delete an address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const address = user.addresses.id(req.params.addressId);
  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  const wasDefault = address.isDefault;
  address.deleteOne();

  // If we removed the default address, promote another one (if any).
  if (wasDefault && user.addresses.length > 0) {
    user.addresses[0].isDefault = true;
  }

  await user.save();
  res.json(user.addresses);
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
    toggleTwoFactor,
    deleteUser,
    getAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
};
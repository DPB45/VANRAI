import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  isDefault: { type: Boolean, default: false },
  phone: { type: String },
});

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // lowercase: true normalizes on save so "A@x.com" and "a@x.com" can't
  // register as two different accounts; trim strips accidental whitespace
  // from a pasted email. Queries still need to lowercase their own input
  // (see authUser/registerUser/requestPasswordReset) since this only
  // applies when a document is written, not to a query's filter.
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, required: true, default: false },

  // --- NEW 2FA FIELDS ---
  isTwoFactorEnabled: { type: Boolean, default: false },
  twoFactorCode: { type: String },
  twoFactorCodeExpire: { type: Date },
  // Failed guesses against the current 2FA code; the code is burned after too many.
  twoFactorAttempts: { type: Number, default: 0 },
  // Bumped whenever the password changes. Tokens carry the version they were
  // issued under, so changing/resetting a password logs out every other session.
  tokenVersion: { type: Number, default: 0 },
  // ----------------------

  // --- PASSWORD RESET (real implementation) ---
  // We store a HASH of the reset token, never the raw token itself,
  // the same way we'd store a password. The raw token only ever goes
  // out in the email link.
  resetPasswordToken: { type: String },
  resetPasswordExpire: { type: Date },
  // ---------------------------------------------

  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],

  addresses: [addressSchema],
}, {
  timestamps: true,
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  if (!this.isNew) this.tokenVersion = (this.tokenVersion || 0) + 1;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
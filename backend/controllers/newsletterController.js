import asyncHandler from 'express-async-handler';
import validator from 'validator';
import Subscriber from '../models/subscriberModel.js';

// @desc    Subscribe an email address to the newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
const subscribeToNewsletter = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    res.status(400);
    throw new Error('Please provide a valid email address.');
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await Subscriber.findOne({ email: normalizedEmail });

  if (existing) {
    // Not an error from the user's point of view - they're already subscribed.
    res.json({ message: "You're already subscribed. Thanks for sticking around!" });
    return;
  }

  await Subscriber.create({ email: normalizedEmail });
  res.status(201).json({ message: 'Thanks for subscribing! Keep an eye on your inbox.' });
});

export { subscribeToNewsletter };

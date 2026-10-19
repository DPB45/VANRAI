import Message from '../models/messageModel.js';
import asyncHandler from 'express-async-handler';
import validator from 'validator';
import sendEmail from '../utils/emailUtils.js'; // <-- 1. Import email utility

// Escapes HTML special characters so user input can never break out of the
// HTML email template below (e.g. injecting extra tags/attributes). Unlike
// the old stripHtml() — whose /<[^>]*>?/gm regex would greedily consume
// everything from a bare "<" to the end of the string when no closing ">"
// followed it (so "price < 100 rupees, please reply" silently became just
// "price ") — this never mutates or truncates the user's actual words. It's
// also applied ONLY when building the HTML email, never to what's stored in
// the database, so the admin inbox (MessageList.jsx) always shows exactly
// what the visitor typed (React already escapes it safely on render).
const escapeHtml = (input) => {
    if (typeof input !== 'string') return input;
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
};

const createMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }
  if (!validator.isEmail(email)) {
    res.status(400);
    throw new Error('Invalid email format.');
  }

  // Store exactly what the visitor typed — no mangling. React escapes it
  // automatically wherever it's rendered in the admin UI, so there's no
  // injection risk from storing it verbatim, and nothing gets eaten.
  const siteOwnerEmail = process.env.EMAIL_USER; // Send to the configured Gmail address

  const newMessage = await Message.create({
    name,
    email,
    phone,
    subject,
    message,
  });

  if (newMessage) {
    // --- 2. EMAIL TRIGGER: Notify Site Owner ---
    // The message itself is already safely saved in the DB at this point
    // regardless of what happens next, so an email outage here shouldn't
    // fail the visitor's submission — but it also shouldn't be silently
    // swallowed, or the site owner has no way to know a notification was
    // missed. sendEmail() already returns false on failure (see
    // requestPasswordReset for the same pattern) instead of throwing, so we
    // just check it and log clearly rather than assuming success.
    const emailSent = await sendEmail({
        to: siteOwnerEmail, // Send to site owner
        subject: `[New Contact] ${subject} from ${name}`,
        text: `New message from ${name} (${email}). Subject: ${subject}. Phone: ${phone || 'N/A'}. Message: ${message}`,
        html: `
            <h2>New Contact Message Received</h2>
            <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone) || 'N/A'}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message)}</p>
        `,
    });

    if (emailSent) {
      console.log('📬 Contact form submitted and email sent to site owner.');
    } else {
      console.error(
        `⚠️  Contact form message ${newMessage._id} was saved, but the site-owner notification email FAILED to send. Check it manually.`
      );
    }
    // ---------------------------------------------

    res.status(201).json({
      _id: newMessage._id,
      name,
      message: 'Message sent successfully!',
    });
  } else {
    res.status(400);
    throw new Error('Invalid message data');
  }
});

// @desc    Get all contact-form messages, newest first (Admin inbox)
// @route   GET /api/messages
// @access  Private/Admin
const getMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({}).sort({ createdAt: -1 });
  res.json(messages);
});

// @desc    Mark a message as read/unread (Admin)
// @route   PUT /api/messages/:id/read
// @access  Private/Admin
const markMessageRead = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  // Body can optionally force a specific state (e.g. "mark all as read"
  // from the list); otherwise this just flips whatever it currently is,
  // which is what a single click on one row should do.
  message.isRead = typeof req.body.isRead === 'boolean' ? req.body.isRead : !message.isRead;
  await message.save();

  res.json(message);
});

// @desc    Delete a message (Admin)
// @route   DELETE /api/messages/:id
// @access  Private/Admin
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await Message.findById(req.params.id);

  if (!message) {
    res.status(404);
    throw new Error('Message not found');
  }

  await Message.deleteOne({ _id: message._id });
  res.json({ message: 'Message deleted' });
});

export { createMessage, getMessages, markMessageRead, deleteMessage };
import Message from '../models/messageModel.js';
import asyncHandler from 'express-async-handler';
import validator from 'validator';
import sendEmail from '../utils/emailUtils.js'; // <-- 1. Import email utility

const stripHtml = (input) => {
    if (typeof input !== 'string') return input;
    return input.replace(/<[^>]*>?/gm, '');
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

  const sanitizedName = stripHtml(name);
  const sanitizedSubject = stripHtml(subject);
  const sanitizedMessage = stripHtml(message);
  const siteOwnerEmail = process.env.EMAIL_USER; // Send to the configured Gmail address

  const newMessage = await Message.create({
    name: sanitizedName,
    email: email,
    phone: stripHtml(phone),
    subject: sanitizedSubject,
    message: sanitizedMessage,
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
        subject: `[New Contact] ${sanitizedSubject} from ${sanitizedName}`,
        text: `New message from ${sanitizedName} (${email}). Subject: ${sanitizedSubject}. Phone: ${phone || 'N/A'}. Message: ${sanitizedMessage}`,
        html: `
            <h2>New Contact Message Received</h2>
            <p><strong>From:</strong> ${sanitizedName} (${email})</p>
            <p><strong>Subject:</strong> ${sanitizedSubject}</p>
            <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
            <hr>
            <p><strong>Message:</strong></p>
            <p>${sanitizedMessage}</p>
        `,
    });

    if (emailSent) {
      console.log(' Contact form submitted and email sent to site owner.');
    } else {
      console.error(
        `⚠️  Contact form message ${newMessage._id} was saved, but the site-owner notification email FAILED to send. Check it manually.`
      );
    }
    // ---------------------------------------------

    res.status(201).json({
      _id: newMessage._id,
      name: sanitizedName,
      message: 'Message sent successfully!',
    });
  } else {
    res.status(400);
    throw new Error('Invalid message data');
  }
});

export { createMessage };
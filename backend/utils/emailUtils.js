import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter object using Port 587 (STARTTLS)
// This is often more reliable on cloud servers like Render than Port 465
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Must be false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    // This helps prevent some SSL handshake errors in cloud environments
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  connectionTimeout: 10000, // 10 seconds
});

/**
 * Sends an email using Nodemailer.
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject line
 * @param {string} text - Plain text body
 * @param {string} html - HTML body (optional)
 */
const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Vanrai Spices Support" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📬 Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    // Log the error but return false so the server doesn't crash
    console.error('❌ Nodemailer Error:', error.message);
    return false;
  }
};

export default sendEmail;
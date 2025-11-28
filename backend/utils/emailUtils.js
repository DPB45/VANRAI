import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create a transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
  service: 'gmail', // Use 'gmail' as the service
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail address
    pass: process.env.EMAIL_PASS, // Your App Password
  },
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
    from: `"Vanrai Spices Support" <${process.env.EMAIL_USER}>`, // Sender address
    to: to, // List of receivers
    subject: subject, // Subject line
    text: text, // Plain text body
    html: html, // HTML body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('📬 Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Nodemailer Error:', error);
    return false;
  }
};

export default sendEmail;
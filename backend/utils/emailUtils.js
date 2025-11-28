import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  // Ensure we are using the correct host for Brevo
  host: 'smtp-relay.brevo.com',
  // Use Port 587 (Standard for Brevo)
  port: 587,
  secure: false, // false for port 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // --- CRITICAL FIXES ---
  // 1. Force IPv4 to prevent cloud network timeouts (fixes ETIMEDOUT)
  family: 4,
  // 2. Enable detailed logging to debug connection steps
  logger: true,
  debug: true,
});

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Vanrai Spices" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  try {
    console.log(`Attempting to send email to ${to}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('📬 Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Nodemailer Error:', error);
    return false;
  }
};

export default sendEmail;
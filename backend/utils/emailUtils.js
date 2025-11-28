import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // Use Gmail preset
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail Address
    pass: process.env.EMAIL_PASS, // Your 16-digit App Password
  },
  // --- CRITICAL FIX FOR RENDER ---
  family: 4, // Force IPv4. This fixes the "Connection timeout" error!
  // -------------------------------
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
    console.log(`Attempting to send email to ${to} via Gmail...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('📬 Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Nodemailer Error:', error);
    return false;
  }
};

export default sendEmail;
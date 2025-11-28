import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // --- CRITICAL FIXES ---
  // 1. Force IPv4 to prevent cloud network timeouts
  family: 4,
  // 2. Allow self-signed certs (helps in some cloud envs)
  tls: {
    rejectUnauthorized: false,
  },
  // 3. Enable detailed logging to debug if it fails
  logger: true,
  debug: true,
});

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
    // Log the full error object for debugging
    console.error('❌ Nodemailer Error:', error);
    return false;
  }
};

export default sendEmail;
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 465, // Secure SSL port (More reliable on Render)
  secure: true, // Must be true for port 465
  auth: {
    user: process.env.EMAIL_USER, // Your Brevo Login (9cc7...)
    pass: process.env.EMAIL_PASS, // Your Brevo Master Password
  },
  connectionTimeout: 20000, // 20 seconds timeout
});

// REPLACE THIS WITH YOUR ACTUAL VERIFIED EMAIL FROM BREVO DASHBOARD
const SENDER_EMAIL = "dhairya4507@gmail.com";

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Vanrai Spices" <${SENDER_EMAIL}>`,
    to: to,
    subject: subject,
    text: text,
    html: html,
  };

  try {
    console.log(`Attempting to send email to ${to} via Brevo (SSL/465)...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('📬 Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Nodemailer Error:', error);
    return false;
  }
};

export default sendEmail;
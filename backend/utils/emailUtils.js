import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Using the built-in 'gmail' service is often more reliable
// for bypassing port blocks on cloud servers.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
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
    console.error('❌ Nodemailer Error:', error.message);
    // We return false so the app continues running even if email fails
    return false;
  }
};

export default sendEmail;
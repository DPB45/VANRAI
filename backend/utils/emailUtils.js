import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // Use Brevo's SMTP server
  port: 587,
  secure: false, // false for port 587
  auth: {
    user: process.env.EMAIL_USER, // Your Brevo Login Email
    pass: process.env.EMAIL_PASS, // Your Brevo SMTP Key
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Vanrai Spices" <${process.env.EMAIL_USER}>`, // Must match your Brevo verified email
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
    console.error('❌ Nodemailer Error:', error);
    return false;
  }
};

export default sendEmail;
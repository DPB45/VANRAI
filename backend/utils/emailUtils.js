import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure Transporter with Brevo SMTP Credentials
const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587, // Try 587 first, if timeout use 2525
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // This must be the Brevo Login (e.g., 9cc7b2001@smtp-brevo.com)
    pass: process.env.EMAIL_PASS, // This must be the Brevo API Key
  },
  tls: {
    rejectUnauthorized: false
  }
});

// REPLACE THIS WITH YOUR ACTUAL VERIFIED EMAIL
const SENDER_EMAIL = "dhairya4507@gmail.com"; // <--- PUT YOUR VERIFIED EMAIL HERE

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    from: `"Vanrai Spices" <${SENDER_EMAIL}>`, // Use the verified email here
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
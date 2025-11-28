import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 2525, // Port 2525 is critical for Render!
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // Your Brevo Login Email
    pass: process.env.EMAIL_PASS, // Your Brevo SMTP Key
  },
  tls: {
    rejectUnauthorized: false, // Helps with some cloud SSL issues
  },
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
    console.log(`Attempting to send email to ${to} via Brevo (Port 2525)...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('📬 Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Nodemailer Error:', error);
    return false;
  }
};

export default sendEmail;
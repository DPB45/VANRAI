import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 2525, // Port 2525 is the KEY to fixing the timeout on Render
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // This will be your Brevo Login ID
    pass: process.env.EMAIL_PASS, // This will be your Brevo API Key
  },
  // Without these, an unreachable SMTP server can hold the request that
  // awaits sendEmail (register, order, 2FA...) open for minutes. Fail fast so
  // those requests get a clean "email failed" result instead of hanging.
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

if (!process.env.SENDER_EMAIL) {
  console.warn('⚠️  SENDER_EMAIL is not set; falling back to the legacy hardcoded sender. Set SENDER_EMAIL to an address verified in Brevo.');
}

const sendEmail = async ({ to, subject, text, html }) => {
  // IMPORTANT: This email MUST be the one you verified in Brevo.
  // Set SENDER_EMAIL in your .env; falls back to the previous hardcoded
  // address only so existing deployments keep working without a config change.
  const senderEmail = process.env.SENDER_EMAIL || "dhairya4507@gmail.com";

  const mailOptions = {
    from: `"Vanrai Spices" <${senderEmail}>`,
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
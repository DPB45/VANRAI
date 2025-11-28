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
});

const sendEmail = async ({ to, subject, text, html }) => {
  // IMPORTANT: This email MUST be the one you verified in Brevo
  const senderEmail = "dhairya4507@gmail.com";

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
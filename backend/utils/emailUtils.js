import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com', // Matches your screenshot
  port: 2525, // Use 2525 to bypass Render's firewall (587 often fails)
  secure: false,
  auth: {
    user: process.env.EMAIL_USER, // Set this to: 9cc7b2001@smtp-brevo.com
    pass: process.env.EMAIL_PASS, // Set this to your Brevo Master Password
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  const mailOptions = {
    // The "From" address can be anything you verified in Brevo,
    // typically your own email or the one provided.
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
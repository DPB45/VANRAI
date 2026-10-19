import React from 'react';
import Meta from '../components/Meta';

// NOTE: This is a plain-language summary written from how this store actually
// works (Cash on Delivery, accounts, order emails). Have it reviewed by a
// qualified professional before relying on it as a legal document.
const PrivacyPolicy = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl">
    <Meta title="Privacy Policy | Vanrai Spices" description="How Vanrai Spices collects and uses your information." />
    <h1 className="text-3xl font-bold text-gray-800 mb-2">Privacy Policy</h1>
    <p className="text-sm text-gray-500 mb-8">Last updated: October 2026</p>
    <div className="prose prose-lg max-w-none">
      <h2>What we collect</h2>
      <p>When you create an account or place an order we store your name, email address, delivery address, mobile number and the contents of your orders. If you use the contact form or subscribe to the newsletter, we store the details you submit there.</p>
      <h2>How we use it</h2>
      <p>We use this information to create and secure your account, deliver your orders, send order and account emails (confirmation, shipping, delivery, password reset and login codes), and reply to your messages. Newsletter emails are only sent if you subscribed.</p>
      <h2>Payments</h2>
      <p>All orders are Cash on Delivery. We do not collect or store any card or bank details.</p>
      <h2>Sharing</h2>
      <p>We do not sell your personal information. Details needed to fulfil an order (name, address, phone) may be shared with the courier delivering it.</p>
      <h2>Your choices</h2>
      <p>You can update your profile and addresses from your account at any time. To have your account or data deleted, contact us using the details on the Contact page.</p>
    </div>
  </div>
);

export default PrivacyPolicy;

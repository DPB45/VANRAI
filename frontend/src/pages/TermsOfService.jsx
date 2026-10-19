import React from 'react';
import Meta from '../components/Meta';

// NOTE: This is a plain-language summary written from how this store actually
// works (Cash on Delivery, accounts, order emails). Have it reviewed by a
// qualified professional before relying on it as a legal document.
const TermsofService = () => (
  <div className="container mx-auto px-4 py-12 max-w-3xl">
    <Meta title="Terms of Service | Vanrai Spices" description="Terms for ordering from Vanrai Spices." />
    <h1 className="text-3xl font-bold text-gray-800 mb-2">Terms of Service</h1>
    <p className="text-sm text-gray-500 mb-8">Last updated: October 2026</p>
    <div className="prose prose-lg max-w-none">
      <h2>Using this site</h2>
      <p>By placing an order you confirm that the information you give us is accurate and that you are authorised to place the order.</p>
      <h2>Orders and pricing</h2>
      <p>Prices are shown in Indian Rupees. The price charged is always the current price on our site at the time you place the order, plus the shipping fee shown at checkout. We may cancel an order if an item is unavailable.</p>
      <h2>Payment</h2>
      <p>Payment is by Cash on Delivery only. Please keep the exact amount ready when your order arrives.</p>
      <h2>Delivery, returns and refunds</h2>
      <p>Delivery timelines are estimates. Our return and refund process is described on the Help Center page.</p>
      <h2>Accounts</h2>
      <p>You are responsible for keeping your login details secure. We may suspend accounts that are misused.</p>
      <h2>Contact</h2>
      <p>Questions about these terms can be sent through the Contact page.</p>
    </div>
  </div>
);

export default TermsofService;

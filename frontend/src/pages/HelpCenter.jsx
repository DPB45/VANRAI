import React from 'react';
import FaqItem from '../components/FaqItem';
import { EnvelopeIcon, PhoneIcon } from '@heroicons/react/24/outline';

// Data for the FAQ items
const faqs = [
  {
    question: 'What makes Vanrai Spices unique?',
    answer: 'Vanrai Spices focuses on using the finest quality, handcrafted ingredients directly from farms. We uphold traditional Indian methods of processing to ensure authentic flavor and aroma in every product, backed by FSSAI certification for purity.',
  },
  {
    question: 'Are your spices 100% natural?',
    answer: 'Yes, all our spices are 100% natural, free from artificial colors, preservatives, and additives. We believe in providing pure and authentic flavors.',
  },
  {
    question: 'How do I place an order?',
    answer: 'Simply browse our shop, add your desired products to the cart, and proceed to checkout. You will be guided through the payment and shipping information steps.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit/debit cards, UPI, net banking, and popular digital wallets for a secure and easy checkout experience.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Delivery times vary based on your location. Typically, orders are delivered within 3-7 business days. You will receive a tracking number via email once your order has been dispatched.',
  },
  {
    question: 'Can I change or cancel my order after it\'s placed?',
    answer: 'Once an order is confirmed, it is processed quickly. Please contact our customer support immediately to see if changes are possible. We cannot guarantee cancellations or modifications after dispatch.',
  },
  {
    question: 'How should I store Vanrai Spices?',
    answer: 'To maintain maximum freshness and flavor, store your spices in an airtight container in a cool, dark, and dry place, away from direct sunlight and moisture.',
  },
  {
    question: 'Do you offer international shipping?',
    answer: 'Currently, we only ship within India. We are working on expanding our services to international customers soon!',
  },
];

// Main Help Center Page
const HelpCenter = () => {
  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4 max-w-4xl">

        <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
          Help Center: FAQs & Policies
        </h1>

        {/* --- 1. FAQs Section --- */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </section>

        {/* --- 2. Return Policy Section --- */}
        <section className="text-gray-700">
          <h2 className="text-3xl font-semibold text-gray-800 mb-6">
            Return Policy
          </h2>
          <div className="prose prose-lg max-w-none">
            <h4 className="font-semibold">Eligibility for Returns</h4>
            <p>
              At Vanrai Spices, your satisfaction is our priority. We accept returns for products purchased directly from our website under the
              following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Damaged or Defective Products:</strong> If you receive a product that is damaged or defective, please notify us within 48 hours
                of receiving it.
              </li>
              <li>
                <strong>Incorrect Items:</strong> If you receive an item different from what you ordered, please contact us immediately.
              </li>
              <li>
                All returned items must be in their original packaging, unopened, unused, and in unused condition within 7 days of delivery.
              </li>
              <li>
                <strong>Non-returnable Items:</strong> Due to health and safety reasons, perishable goods (spices) cannot be returned if opened or used,
                unless they arrived damaged or incorrect.
              </li>
            </ul>

            <h4 className="font-semibold mt-6">How to Initiate a Return</h4>
            <p>To initiate a return, please follow these steps:</p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>Contact our Customer Support team at support@vanraispices.com or call us at +91-9876543210 within the eligible return period.</li>
              <li>Provide your order number, the name of the item(s) you wish to return, and the reason for the return. For damaged/incorrect items, please attach clear photos.</li>
              <li>Our team will review your request and provide you with a Return Authorization (RA) number and instructions on how to send back the product.</li>
              <li>Pack the items securely in their original packaging, including all accessories and documentation. Clearly mark the RA number on the outside of the package.</li>
              <li>Ship the package to the address provided by our support team. Customers are responsible for return shipping costs unless the return is due to our error (damaged, defective, or incorrect item).</li>
            </ol>

            <h4 className="font-semibold mt-6">Refunds and Exchanges</h4>
            <p>Once we receive and inspect the returned item(s), we will process your refund or exchange accordingly:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Refunds:</strong> Approved refunds will be processed within 5-10 business days to the original method of payment. You will
                be notified via email once the refund has been processed.
              </li>
              <li>
                <strong>Exchanges:</strong> If you requested an exchange for an incorrect or damaged item, the replacement will be shipped to you at
                no additional cost, subject to availability.
              </li>
              <li>
                <strong>Partial Refunds:</strong> In some cases, a partial refund may be issued for items not in their original condition or missing parts
                for reasons not due to our error.
              </li>
            </ul>
          </div>
        </section>

        {/* --- 3. "Still Need Help?" Section --- */}
        <section className="mt-16 bg-gray-50 p-8 rounded-lg text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">
            Still Need Help?
          </h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Can't find what you're looking for? Our dedicated customer support team is here to
            assist you with any query.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="mailto:support@vanraispices.com"
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-md hover:bg-gray-100 transition-colors"
            >
              <EnvelopeIcon className="w-5 h-5" />
              Email Us
            </a>
            <a
              href="tel:+919876543210"
              className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-md hover:bg-gray-100 transition-colors"
            >
              <PhoneIcon className="w-5 h-5" />
              Call Us +91-9876543210
            </a>
          </div>
        </section>

      </div>
    </div>
  );
};

export default HelpCenter;
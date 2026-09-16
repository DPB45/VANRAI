import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Reusable newsletter signup form used on Home and Recipes. Posts to
// /api/newsletter/subscribe instead of doing a native (page-reloading)
// form submission with no handler at all.
const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const { data } = await axios.post('/api/newsletter/subscribe', { email: email.trim() });
      toast.success(data.message || 'Thanks for subscribing!');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className={`bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors duration-300 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
    </form>
  );
};

export default NewsletterForm;

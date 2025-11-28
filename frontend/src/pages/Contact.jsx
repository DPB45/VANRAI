import React, { useState } from 'react';
import axios from 'axios';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/solid';

// 1. Import your local map image
// Make sure you have saved your image as 'contact-map.jpg' in the assets folder
import MapImg from '../assets/contact-map.png';

const Input = ({ id, label, type = 'text', placeholder, value, onChange, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={id}
      name={id}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const Textarea = ({ id, label, placeholder, value, onChange, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1">
      {label}
    </label>
    <textarea
      id={id}
      name={id}
      rows="5"
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
      placeholder={placeholder}
      required={required}
    />
  </div>
);

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const config = { headers: { 'Content-Type': 'application/json' } };

      const { data } = await axios.post(
        '/api/messages', // Using relative path now
        formData,
        config
      );

      setStatusMessage({ type: 'success', text: data.message || 'Message sent successfully!' });
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });

    } catch (error) {
      setStatusMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to send message. Please try again.'
      });
      console.error('Contact form error:', error.response || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16">

          {/* --- LEFT: Form --- */}
          <div className="md:col-span-2">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Send Us a Message</h1>
            <p className="text-gray-600 mb-8">
              We'd love to hear from you. Please fill out the form below.
            </p>

            {statusMessage.text && (
              <div className={`mb-6 p-3 rounded-md text-center ${
                statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  id="name" label="Name" placeholder="Your Full Name"
                  value={formData.name} onChange={handleChange}
                />
                <Input
                  id="email" label="Email" type="email" placeholder="your.email@example.com"
                  value={formData.email} onChange={handleChange}
                />
              </div>
              <Input
                id="phone" label="Phone Number (Optional)" type="tel" placeholder="+91 12345 67890"
                value={formData.phone} onChange={handleChange} required={false}
              />
              <Input
                id="subject" label="Subject" placeholder="Inquiry about..."
                value={formData.subject} onChange={handleChange}
              />
              <Textarea
                id="message" label="Message" placeholder="Type your message here..."
                value={formData.message} onChange={handleChange}
              />
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>

          {/* --- RIGHT: Sidebar --- */}
          <div className="md:col-span-1 space-y-8">
            <div className="bg-gray-50 p-6 rounded-lg flex items-start">
              <PhoneIcon className="w-8 h-8 text-red-600 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Customer Care</h3>
                <p className="text-gray-600 mt-1">+91 8767934391</p>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg flex items-start">
              <EnvelopeIcon className="w-8 h-8 text-red-600 mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-xl font-semibold text-gray-800">Email Support</h3>
                <p className="text-gray-600 mt-1">dhairya4507@gmail.com</p>
              </div>
            </div>

            {/* Map Image Section */}
            <div className="rounded-lg overflow-hidden relative border border-gray-200">
              {/* 2. Use the imported image here */}
              <img
                src={MapImg}
                alt="Map of Vanrai Spices "
                className="w-full h-56 object-cover"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <MapPinIcon className="w-10 h-10 text-red-600" />
                <span className="mt-1 bg-white px-3 py-1 rounded-full shadow-md text-sm font-semibold text-gray-800">
                  Vanrai Spices
                </span>
              </div>
            </div>

            <p className="text-center text-gray-600">
              Vanrai Spices , Zare, Sangli, Maharashtra, India
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Contact;
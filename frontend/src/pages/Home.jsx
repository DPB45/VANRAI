import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Meta from '../components/Meta'; // <-- 1. Import Meta Component

// Import icons for "Why Choose Us"
import {
  FireIcon,
  SparklesIcon,
  CheckBadgeIcon,
  ChatBubbleBottomCenterTextIcon,
} from '@heroicons/react/24/outline';

// Import your local images
import HeroBg from '../assets/hero-background.jpg';
import AboutImg from '../assets/about-us-home.jpg';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Fetch Products Data ---
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // API call to fetch products
        const { data } = await axios.get('/api/products');

        // Correctly extracting the array from the paged response
        setProducts(data.products);

      } catch (err) {
        setError('Failed to load products.');
        setProducts([]);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const features = [
    {
      icon: FireIcon,
      title: '100% Natural',
      description: 'Crafted from pure, hand-picked natural ingredients.',
    },
    {
      icon: SparklesIcon,
      title: 'Farm-Lost Ingredients',
      description: 'Sourced directly for superior quality and taste.',
    },
    {
      icon: CheckBadgeIcon,
      title: 'Authentic Taste',
      description: 'Follows timeless recipes that capture true flavors.',
    },
    {
      icon: ChatBubbleBottomCenterTextIcon,
      title: 'FSSAI Certified',
      description: 'Ensuring safety and quality in every single pack.',
    },
  ];

  return (
    <div className="bg-white">

      {/* --- 2. Add SEO Meta Tag --- */}
      <Meta />
      {/* --------------------------- */}

      {/* 1. Hero Section */}
      <section className="relative h-[600px] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${HeroBg})`,
          }}
        ></div>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center container mx-auto px-4">
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            Taste Bhi, Health Bhi —
          </h1>
          <p className="text-4xl md:text-5xl font-bold mb-6">
            Authentic Spices from Vanrai!
          </p>
          <p className="text-lg md:text-xl max-w-2xl mb-8">
            Experience the rich tradition and unparalleled taste of spices sourced directly
            from the heart of nature.
          </p>
          <div className="flex gap-4">
            <Link
              to="/shop"
              className="bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors duration-300"
            >
              Shop Now
            </Link>
            <Link
              to="/shop"
              className="bg-transparent border-2 border-white text-white font-semibold py-3 px-8 rounded-md hover:bg-white hover:text-gray-900 transition-colors duration-300"
            >
              Explore Products
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Bestsellers Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Our Bestsellers
          </h2>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md h-96 animate-pulse p-4">
                      <div className="bg-gray-200 h-48 w-full rounded-md mb-4"></div>
                  </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-center text-red-500">{error}</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {products.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. About Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <img
              src={AboutImg}
              alt="About Vanrai Spices"
              className="rounded-lg shadow-xl w-full"
            />
          </div>
          <div className="text-gray-700">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              About Vanrai Spices
            </h2>
            <p className="mb-4">
              We bring the authentic taste of India to your kitchen. Our journey began with
              a simple mission: to provide pure, aromatic, and flavorful
              spices that reflect our rich culinary heritage.
            </p>
            <p className="mb-4">
              Grounded in tradition, every spice is a commitment to quality.
              We believe in the power of nature and simplicity, ensuring that
              what you get is nothing but the best.
            </p>
            <p>
              Our traditional methods, combined with modern standards,
              guarantee purity. Join us in celebrating flavors that
              have been lost in time, settings "Your Trust Is Our Wealth"
              as the promise we live by every day.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Why Choose Us Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Us
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md">
                <feature.icon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Testimonials Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            What Our Customers Say
          </h2>
          <div className="bg-gray-50 p-8 rounded-lg shadow-lg">
            <blockquote className="text-xl italic text-gray-700 mb-6">
              "Vanrai Spices have transformed my cooking. The aroma and
              freshness are incredible. It’s the real, authentic
              taste I've been looking for everywhere!"
            </blockquote>
            <img
              src="https://i.imgur.com/8081C4A.png" // Placeholder image
              alt="Aditya Sharma"
              className="w-16 h-16 rounded-full mx-auto mb-4"
            />
            <p className="text-lg font-semibold text-gray-800">Aditya Sharma</p>
            <div className="flex justify-center text-yellow-400 mt-1">
              {[...Array(5)].map((_, i) => (
                <span key={i}>&#9733;</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Newsletter Section */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Join Our Spice Community
          </h2>
          <p className="text-gray-600 mb-8">
            Sign up for our newsletter to receive exclusive recipes, new product
            updates, and special offers right in your inbox.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-grow px-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <button
              type="submit"
              className="bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors duration-300"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Home;
import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckBadgeIcon,
  SparklesIcon,
  ArchiveBoxIcon,
  BuildingLibraryIcon,
  GlobeAltIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

// --- 1. Import your new images ---
import AboutJourneyImg from '../assets/about-journey.jpg';
import AboutPromiseImg from '../assets/about-promise.jpg';
// ----------------------------------

// Data for the certification items
const certifications = [
  {
    icon: CheckBadgeIcon,
    title: 'FSSAI Certified',
    description: 'Proudly certified by the Food Safety and Standards Authority of India, ensuring our products meet rigorous safety and quality benchmarks.',
  },
  {
    icon: SparklesIcon,
    title: '100% Natural Purity',
    description: 'Our blends are free from artificial colors, flavors, and preservatives. We bring nature\'s goodness directly to your table.',
  },
  {
    icon: ArchiveBoxIcon,
    title: 'Carefully Packaged',
    description: 'Sealed in airtight, food-grade packaging to preserve the natural oils, aroma, and freshness, ensuring perfect quality on arrival.',
  },
  {
    icon: BuildingLibraryIcon,
    title: 'Traditional Methods',
    description: 'We honor ancient techniques, stone-grinding our spices to retain their authentic natural flavors and benefits without added heat.',
  },
  {
    icon: GlobeAltIcon,
    title: 'Sustainable Sourcing',
    description: 'Committed to ethical practices, we partner directly with farms to ensure fair trade and protect the environment for future generations.',
  },
  {
    icon: ClipboardDocumentCheckIcon,
    title: 'Regular Quality Checks',
    description: 'Each batch is subjected to meticulous quality checks in our in-house lab to promise superior standards and consistency.',
  },
];

// Main AboutUs Page Component
const AboutUs = () => {
  return (
    <div className="bg-white">
      {/* 1. Hero Section */}
      <section className="bg-gray-50 py-20 text-center">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Your Trust Is Our Wealth!
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            At Vanrai Spices, our mission is to deliver the pure, most authentic Indian
            spices, ensuring rich flavor and unparalleled quality in every meal. We believe
            in building lasting relationships founded on purity, trust, and the taste of
            tradition.
          </p>
        </div>
      </section>

      {/* 2. Our Journey of Flavor */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Our Journey of Flavor
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-gray-700 space-y-4">
              <p>
                Vanrai Spices began with a simple yet profound idea: to bring the
                authentic, unadulterated taste of Indian spices to kitchens around
                the world. Born from a passion for quality and a deep respect for the
                culinary heritage of India, we embarked on a journey to source the
                finest raw materials straight from the farms.
              </p>
              <p>
                From the verdant fields where farmers, true artisans to the
                land, cultivate their crops with care, to our facility where we
                meticulously select each ingredient. Our commitment to purity, tradition, and
                flavor is unwavering. We are more than just a spice company; we
                are custodians of an operation. We believe that true flavor comes from
                nature, and our heritage is a treasure worth preserving.
              </p>
            </div>
            <div>
              {/* --- 2. Use the journey image --- */}
              <img
                src={AboutJourneyImg} // <-- UPDATED
                alt="Spice market journey"
                className="rounded-lg shadow-xl w-full"
              />
              {/* ------------------------------- */}
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Vanrai Promise */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            The Vanrai Promise: From Earth to Your Plate
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              {/* --- 3. Use the promise image --- */}
              <img
                src={AboutPromiseImg} // <-- UPDATED
                alt="Hand-picking chillies promise"
                className="rounded-lg shadow-xl w-full"
              />
              {/* ------------------------------ */}
            </div>
            <div className="text-gray-700 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Meticulous Sourcing and Processing
                </h3>
                <p>
                  We've forged strong bonds with local farming communities to ensure
                  premium quality. We partner directly with farmers who
                  share our values of sustainability and ethical growing
                  practices. Our spices are handpicked, meticulously cleaned,
                  dried using natural methods, and processed without any artificial
                  additives or preservatives.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Quality Grinding
                </h3>
                <p>
                  Instead of high-speed grinding, each spice is overseen with
                  utmost care, preserving its aroma and natural bounty. This
                  respect for tradition is what sets Vanrai Spices apart. We
                  are choosing unadulterated purity and flavor.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Certifications & Quality Assurance */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Certifications & Quality Assurance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {certifications.map((item) => (
              <div key={item.title} className="text-center p-6">
                <item.icon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. CTA Section */}
      <section className="py-20 bg-gray-50 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Ready to Explore Authentic Flavors?
          </h2>
          <Link
            to="/shop"
            className="bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors duration-300"
          >
            Explore Our Spices
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
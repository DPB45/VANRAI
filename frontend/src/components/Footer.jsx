import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from 'react-icons/fa6';

const SOCIAL_LINKS = [
  { href: '#', label: 'Facebook', Icon: FaFacebookF },
  { href: '#', label: 'Instagram', Icon: FaInstagram },
  { href: '#', label: 'LinkedIn', Icon: FaLinkedinIn },
  { href: '#', label: 'YouTube', Icon: FaYoutube },
];

// One column of footer nav links, sharing the same heading treatment so
// "Quick Links" / "Company" / "Shop" line up and read as one family.
const FooterColumn = ({ title, links }) => (
  <div>
    <h3 className="font-display text-sm font-semibold tracking-wide text-white">{title}</h3>
    <span className="mt-2 block h-[2px] w-8 rounded-full bg-gradient-to-r from-red-500 to-amber-400" />
    <nav className="mt-4 flex flex-col gap-2.5">
      {links.map((link) => (
        <Link
          key={link.label}
          to={link.to}
          className="text-sm text-stone-400 transition-colors hover:text-amber-400"
        >
          {link.label}
        </Link>
      ))}
    </nav>
  </div>
);

const Footer = () => {
  return (
    <footer className="bg-[#1C1614] text-stone-300">
      {/* Echoes the header's top gradient line, so the two accent colors
          this store is built on bookend the whole page. */}
      <div className="h-[3px] w-full bg-gradient-to-r from-red-700 via-red-500 to-amber-400" />

      <div className="container mx-auto px-4 py-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-12 md:grid-cols-4 lg:grid-cols-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Link to="/" className="group inline-flex items-center gap-2.5">
              <svg
                viewBox="0 0 24 24"
                className="h-7 w-7 flex-shrink-0 text-red-500"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 21C12 21 4 16.5 4 9.5C4 5 7.5 2 12 2C16.5 2 20 5 20 9.5C20 16.5 12 21 12 21Z"
                  fill="currentColor"
                  fillOpacity="0.18"
                />
                <path
                  d="M12 21V6M12 6C9 6 6 4.5 5 2M12 6C15 6 18 4.5 19 2"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="font-display text-xl font-bold text-white">Vanrai Spices</span>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-400">
              Pure, authentic spices sourced directly from Indian farms — carrying the same
              tradition from our fields to your kitchen.
            </p>

            <div className="mt-6 flex gap-3">
              {SOCIAL_LINKS.map((social) => {
                const SocialIcon = social.Icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-stone-300 transition-colors hover:bg-amber-400 hover:text-[#1C1614] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
                  >
                    <SocialIcon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-3">
            <FooterColumn
              title="Quick Links"
              links={[
                { label: 'About Us', to: '/about' },
                { label: 'Contact Us', to: '/contact' },
                { label: 'Help & FAQs', to: '/help' },
                { label: 'Return Policy', to: '/help' },
              ]}
            />
          </div>

          <div className="col-span-1 md:col-span-1 lg:col-span-2">
            <FooterColumn
              title="Company"
              links={[
                { label: 'Our Story', to: '/about' },
                { label: 'Blog & Recipes', to: '/recipes' },
                { label: 'Privacy Policy', to: '/contact' },
                { label: 'Terms of Service', to: '/contact' },
              ]}
            />
          </div>

          <div className="col-span-2 md:col-span-2 lg:col-span-3">
            <FooterColumn
              title="Shop"
              links={[
                { label: 'All Spices', to: '/shop' },
                { label: 'Masalas', to: '/shop?category=Masalas' },
                { label: 'Best Sellers', to: '/shop?sortBy=popularity' },
                { label: 'Herbs', to: '/shop?category=Herbs' },
              ]}
            />
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center gap-4 border-t border-white/10 pt-6 md:flex-row md:justify-between">
          <p className="text-xs text-stone-500">
            © {new Date().getFullYear()} Vanrai Spices. All rights reserved.
          </p>
          <p className="text-xs text-stone-500">Crafted with care, rooted in tradition.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
import Product from '../models/productModel.js';
import asyncHandler from 'express-async-handler';

const getSitemap = asyncHandler(async (req, res) => {
  const products = await Product.find({});
  // Use the same FRONTEND_URL env var the password-reset email builds links
  // from, so this can't drift out of sync with the site's real domain again.
  // Falls back to the actual deployed Vercel domain (matches server.js's
  // CORS allow-list) rather than an unrelated/unowned-looking domain.
  const baseUrl = process.env.FRONTEND_URL || 'https://vanrai.vercel.app';

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>
    <url><loc>${baseUrl}/shop</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
    <url><loc>${baseUrl}/about</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>
    ${products.map(product => `
    <url>
      <loc>${baseUrl}/product/${product._id}</loc>
      <lastmod>${new Date(product.updatedAt).toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`).join('')}
  </urlset>`;

  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

export { getSitemap };
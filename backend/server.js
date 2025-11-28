import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'mongo-sanitize';
import helmet from 'helmet';

import productRoutes from './routes/productRoutes.js';
import userRoutes from './routes/userRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import sitemapRoutes from './routes/sitemapRoutes.js'; // <-- Import
import { seedProducts } from './controllers/productController.js';

dotenv.config();
connectDB();
seedProducts();

const app = express();

// Security
app.use(helmet());
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use(limiter);
app.use((req, res, next) => {
    if (req.body) req.body = mongoSanitize(req.body);
    if (req.query) req.query = mongoSanitize(req.query);
    if (req.params) req.params = mongoSanitize(req.params);
    next();
});

// --- UPDATE CORS TO ALLOW EVERYTHING ---
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => { res.send('API is running...'); });
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/orders', orderRoutes);
app.use('/', sitemapRoutes); // <-- Use Sitemap Route (Root level)

// Error Handling
const notFound = (req, res, next) => { const error = new Error(`Not Found - ${req.originalUrl}`); res.status(404); next(error); };
const errorHandler = (err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({ message: err.message, stack: process.env.NODE_ENV === 'production' ? null : err.stack });
};

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, console.log(`Server running on port ${PORT}`));
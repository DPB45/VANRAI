import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProductReview,
  deleteProduct,
  createProduct, // <-- Ensure this is imported
  updateProduct
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// Review Route
router.route('/:id/reviews').post(protect, createProductReview);

// --- ROOT ROUTE ( /api/products ) ---
router.route('/')
  .get(getProducts)                    // GET = Fetch all
  .post(protect, admin, createProduct); // POST = Create New (This was missing or broken)

// --- ID ROUTE ( /api/products/:id ) ---
router.route('/:id')
  .get(getProductById)                 // GET = Fetch one
  .delete(protect, admin, deleteProduct) // DELETE = Remove one
  .put(protect, admin, updateProduct);   // PUT = Update one

export default router;
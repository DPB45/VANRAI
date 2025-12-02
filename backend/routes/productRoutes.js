import express from 'express';
const router = express.Router();
import {
  getProducts,
  getProductById,
  createProductReview,
  deleteProduct,
  createProduct,
  updateProduct,
  updateProductReview, // <-- Import
  deleteProductReview, // <-- Import
  toggleReviewLike     // <-- Import
} from '../controllers/productController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

// --- Review Routes ---
router.route('/:id/reviews')
    .post(protect, createProductReview)
    .put(protect, updateProductReview)    // <-- New: Edit Review
    .delete(protect, deleteProductReview); // <-- New: Delete Review

router.route('/:id/reviews/:reviewId/like')
    .put(protect, toggleReviewLike);       // <-- New: Like Review

// --- Product Routes ---
router.route('/')
  .get(getProducts)
  .post(protect, admin, createProduct);

router.route('/:id')
  .get(getProductById)
  .delete(protect, admin, deleteProduct)
  .put(protect, admin, updateProduct);

export default router;
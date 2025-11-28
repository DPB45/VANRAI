import mongoose from 'mongoose';

// Define the Review Schema first
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true }, // Reviewer's name
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const productSchema = mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },

  // --- ADDED FIELDS ---
  reviews: [reviewSchema], // Array of review sub-documents
  rating: { type: Number, required: true, default: 0 }, // Overall average rating
  numReviews: { type: Number, required: true, default: 0 }, // Total number of reviews
  // --------------------

  category: { type: String, required: true },
  inStock: { type: Boolean, required: true, default: true },
}, {
  timestamps: true,
});

// --- LOGIC: Calculate Average Rating ---
// Define a static method to recalculate ratings for a product
productSchema.statics.updateAverageRating = async function (productId) {
    const product = await this.findById(productId);

    if (product) {
        if (product.reviews.length === 0) {
            product.rating = 0;
            product.numReviews = 0;
        } else {
            const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
            product.numReviews = product.reviews.length;
            // Calculate average, rounded to 1 decimal place
            product.rating = Math.round((totalRating / product.numReviews) * 10) / 10;
        }
        await product.save();
    }
};
// -------------------------------------

const Product = mongoose.model('Product', productSchema);
export default Product;
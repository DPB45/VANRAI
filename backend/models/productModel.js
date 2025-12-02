import mongoose from 'mongoose';

// Define the Review Schema
const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    // --- NEW FIELD: Likes ---
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Stores User IDs to prevent duplicate likes
      },
    ],
    // ------------------------
  },
  {
    timestamps: true,
  }
);

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },

  reviews: [reviewSchema], // Array of reviews

  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  inStock: { type: Boolean, required: true, default: true },
  user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
  },
}, {
  timestamps: true,
});

// --- Static Method: Calculate Average Rating ---
productSchema.statics.updateAverageRating = async function (productId) {
    const product = await this.findById(productId);
    if (product) {
        if (product.reviews.length === 0) {
            product.rating = 0;
            product.numReviews = 0;
        } else {
            const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
            product.numReviews = product.reviews.length;
            // Calculate average and round to 1 decimal place
            product.rating = Math.round((totalRating / product.numReviews) * 10) / 10;
        }
        await product.save();
    }
};

const Product = mongoose.model('Product', productSchema);
export default Product;
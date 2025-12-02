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
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
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

  reviews: [reviewSchema],

  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  inStock: { type: Boolean, required: true, default: true },

  // --- THE FIX IS HERE ---
  user: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // <-- Changed to false to prevent errors on existing products
      ref: 'User',
  },
  // ----------------------
}, {
  timestamps: true,
});

productSchema.statics.updateAverageRating = async function (productId) {
    const product = await this.findById(productId);
    if (product) {
        if (product.reviews.length === 0) {
            product.rating = 0;
            product.numReviews = 0;
        } else {
            const totalRating = product.reviews.reduce((acc, item) => item.rating + acc, 0);
            product.numReviews = product.reviews.length;
            product.rating = Math.round((totalRating / product.numReviews) * 10) / 10;
        }
        await product.save();
    }
};

const Product = mongoose.model('Product', productSchema);
export default Product;
import Product from '../models/productModel.js';
import asyncHandler from 'express-async-handler';

// --- Seeding Data (Optional) ---
const sampleProducts = [
  { name: 'Kanda Lasoon Masala', description: 'Spicy onion garlic mix.', price: 120.00, imageUrl: '/images/kanda-lasoon-masala.jpg', rating: 4.5, category: 'Masalas', inStock: true },
  // ... add other samples if you wish ...
];

export const seedProducts = asyncHandler(async () => {
    if (process.env.NODE_ENV !== 'production') {
        const count = await Product.countDocuments();
        if (count === 0) {
            // await Product.insertMany(sampleProducts); // Uncomment to seed
            console.log('📦 Database ready.');
        }
    }
});

// --- PRODUCT CRUD ---

// @desc    Fetch all products (Search & Pagination)
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = 8;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword ? { name: { $regex: req.query.keyword, $options: 'i' } } : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort({ rating: -1 });

    res.json({ products, page, pages: Math.ceil(count / pageSize), totalProducts: count });
});

// @desc    Fetch single product
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product (Admin)
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample Name',
    price: 0,
    user: req.user._id,
    imageUrl: '/images/placeholder.jpg',
    category: 'Sample Category',
    description: 'Sample description',
    inStock: true,
    rating: 0,
    numReviews: 0,
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product (Admin)
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, imageUrl, inStock } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price ?? product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.imageUrl = imageUrl || product.imageUrl;
    product.inStock = inStock ?? product.inStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product (Admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (product) {
    await Product.deleteOne({ _id: product._id });
    res.json({ message: 'Product removed' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// --- REVIEW FUNCTIONS ---

// @desc    Create a new review
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Product already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment: comment,
      user: req.user._id,
    };

    product.reviews.push(review);
    await product.save();
    // Update stats
    await Product.updateAverageRating(req.params.id);

    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Update a review
// @route   PUT /api/products/:id/reviews
const updateProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    const review = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (review) {
      review.rating = Number(rating);
      review.comment = comment;

      await product.save();
      await Product.updateAverageRating(req.params.id);
      res.json({ message: 'Review updated' });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a review
// @route   DELETE /api/products/:id/reviews
const deleteProductReview = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const initialLength = product.reviews.length;
    // Filter out the user's review
    product.reviews = product.reviews.filter(
      (r) => r.user.toString() !== req.user._id.toString()
    );

    if (product.reviews.length === initialLength) {
        res.status(404);
        throw new Error('Review not found');
    }

    await product.save();
    await Product.updateAverageRating(req.params.id);
    res.json({ message: 'Review deleted' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Like or Unlike a review
// @route   PUT /api/products/:id/reviews/:reviewId/like
const toggleReviewLike = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    const review = product.reviews.id(req.params.reviewId);

    if (review) {
      const isLiked = review.likes.includes(req.user._id);

      if (isLiked) {
        // Unlike
        review.likes = review.likes.filter(id => id.toString() !== req.user._id.toString());
      } else {
        // Like
        review.likes.push(req.user._id);
      }

      await product.save();
      res.json({ message: isLiked ? 'Unliked' : 'Liked', likes: review.likes });
    } else {
      res.status(404);
      throw new Error('Review not found');
    }
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});


export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    createProductReview,
    updateProductReview, // <-- New
    deleteProductReview, // <-- New
    toggleReviewLike     // <-- New
};
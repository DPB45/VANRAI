import mongoose from 'mongoose';
import Product from '../models/productModel.js';
import asyncHandler from 'express-async-handler';

// --- Seeding Data (Optional) ---
const sampleProducts = [
  { name: 'Kanda Lasoon Masala', description: 'Spicy onion garlic mix.', price: 120.00, imageUrl: '/images/kanda-lasoon-masala.jpg', rating: 4.5, category: 'Masalas', inStock: true },
  // ... add other samples if you wish ...
];

// Escapes regex metacharacters (., *, +, ?, (, ), etc.) in user-supplied
// search text before it's used in a $regex filter. Without this, a crafted
// keyword like "(a+)+$" can make MongoDB's regex engine do catastrophic
// backtracking on every document scanned — a classic ReDoS that can hang
// the query (and the connection pool) for every other request.
const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Express's query-string parser turns a repeated param (?category=A&category=B)
// into an array instead of a string. Several spots below used to call
// string methods (like .split) directly on req.query.<field>, which threw
// a TypeError — and therefore a 500 — the moment a param was repeated or a
// browser/proxy sent it twice. This normalizes either shape to one string.
const firstQueryValue = (value) => {
  const first = Array.isArray(value) ? value[0] : value;
  // ?keyword[a]=1 parses to an object; only plain strings are usable here.
  return typeof first === 'string' ? first : undefined;
};

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

// @desc    Fetch all products (Search, Filtering, Sorting & Pagination)
const getProducts = asyncHandler(async (req, res) => {
    // Allow callers (e.g. the admin product list) to ask for a larger page,
    // capped so the endpoint can't be abused to pull the entire catalog in
    // one uncapped request.
    const requestedPageSize = Number(req.query.pageSize) || 8;
    const pageSize = Math.min(Math.max(requestedPageSize, 1), 200);
    const page = Math.max(1, Math.floor(Number(firstQueryValue(req.query.pageNumber))) || 1);

    // Batch lookup (used by the cart to refresh prices/stock in ONE request
    // instead of one request per cart line): /api/products?ids=a,b,c
    const idsParam = firstQueryValue(req.query.ids);
    if (idsParam) {
        const ids = idsParam.split(',').map((i) => i.trim()).filter(Boolean).slice(0, 50);
        if (!ids.every((id) => mongoose.isValidObjectId(id))) {
            res.status(400);
            throw new Error('Invalid product id in ids.');
        }
        const found = await Product.find({ _id: { $in: ids } }).select('-reviews');
        return res.json({ products: found, page: 1, pages: 1, totalProducts: found.length });
    }

    const filter = {};

    const keyword = firstQueryValue(req.query.keyword);
    if (keyword) {
        filter.name = { $regex: escapeRegExp(keyword), $options: 'i' };
    }

    const categoryParam = firstQueryValue(req.query.category);
    if (categoryParam) {
        const categories = categoryParam
            .split(',')
            .map((c) => c.trim())
            .filter(Boolean);
        if (categories.length > 0) {
            filter.category = { $in: categories };
        }
    }

    const maxPriceParam = firstQueryValue(req.query.maxPrice);
    if (maxPriceParam) {
        const maxPrice = Number(maxPriceParam);
        if (!Number.isNaN(maxPrice)) {
            filter.price = { $lte: maxPrice };
        }
    }

    const inStockParam = firstQueryValue(req.query.inStock);
    if (inStockParam === 'true') {
        filter.inStock = true;
    } else if (inStockParam === 'false') {
        filter.inStock = false;
    }

    // Sorting
    let sort = { rating: -1 }; // Default: "Popularity"
    switch (req.query.sortBy) {
        case 'priceAsc':
            sort = { price: 1 };
            break;
        case 'priceDesc':
            sort = { price: -1 };
            break;
        case 'title':
            sort = { name: 1 };
            break;
        default:
            break;
    }

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
        .limit(pageSize)
        .skip(pageSize * (page - 1))
        .sort(sort);

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
  const { name, price, description, category, imageUrl, inStock, weight } = req.body;

  const product = new Product({
    name: name || 'Sample Name',
    price: price ?? 0,
    user: req.user._id,
    imageUrl: imageUrl || '/images/placeholder.png',
    category: category || 'Sample Category',
    description: description || 'Sample description',
    inStock: inStock ?? false, // new products stay unbuyable until an admin explicitly marks them in stock
    weight: weight || '',
    rating: 0,
    numReviews: 0,
  });
  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Update a product (Admin)
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, imageUrl, inStock, weight } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price ?? product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.imageUrl = imageUrl || product.imageUrl;
    product.inStock = inStock ?? product.inStock;
    product.weight = weight ?? product.weight;

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
  const numericRating = Number(rating);

  if (!rating || Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    res.status(400);
    throw new Error('Rating must be a number between 1 and 5.');
  }
  if (typeof comment !== 'string' || !comment.trim()) {
    res.status(400);
    throw new Error('Please write a short comment with your rating.');
  }
  if (comment.length > 1000) {
    res.status(400);
    throw new Error('Comments can be at most 1000 characters.');
  }

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
      rating: numericRating,
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
  const numericRating = Number(rating);

  if (!rating || Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    res.status(400);
    throw new Error('Rating must be a number between 1 and 5.');
  }
  if (typeof comment !== 'string' || !comment.trim()) {
    res.status(400);
    throw new Error('Please write a short comment with your rating.');
  }
  if (comment.length > 1000) {
    res.status(400);
    throw new Error('Comments can be at most 1000 characters.');
  }

  const product = await Product.findById(req.params.id);

  if (product) {
    const review = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (review) {
      review.rating = numericRating;
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
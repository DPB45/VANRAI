import Product from '../models/productModel.js';
import asyncHandler from 'express-async-handler';

// --- Seeding Data (Optional) ---
const sampleProducts = [
  { name: 'Kanda Lasoon Masala', description: 'Spicy onion garlic mix.', price: 120.00, imageUrl: '/images/kanda-lasoon-masala.jpg', rating: 4.5, category: 'Masalas', inStock: true },
  // ... other samples ...
];

export const seedProducts = asyncHandler(async () => {
    if (process.env.NODE_ENV !== 'production') {
        const count = await Product.countDocuments();
        if (count === 0) {
            await Product.insertMany(sampleProducts);
            console.log('📦 Database seeded with sample products.');
        }
    }
});

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
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
// @route   GET /api/products/:id
// @access  Public
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
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = new Product({
    name: 'Sample Name',
    price: 0,
    user: req.user._id,
    imageUrl: '/images/placeholder.jpg', // Ensure you have a placeholder image or this string matches a real file
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
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, price, description, category, imageUrl, inStock } = req.body;
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = name || product.name;
    product.price = price !== undefined ? price : product.price;
    product.description = description || product.description;
    product.category = category || product.category;
    product.imageUrl = imageUrl || product.imageUrl;
    product.inStock = inStock !== undefined ? inStock : product.inStock;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Delete a product (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
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

// @desc    Create a new review
// @route   POST /api/products/:id/reviews
// @access  Private
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
    product.numReviews = product.reviews.length;
    product.rating =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// --- EXPORT ALL FUNCTIONS ---
export {
    getProducts,
    getProductById,
    createProduct,      // <-- This was missing
    updateProduct,      // <-- This was likely missing
    deleteProduct,      // <-- This was likely missing
    createProductReview
};
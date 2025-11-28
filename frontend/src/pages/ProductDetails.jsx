import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PlusIcon, MinusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import RelatedProductCard from '../components/RelatedProductCard';
import { useCart } from '../context/CartContext';
import { useUser } from '../context/UserContext';
import toast from 'react-hot-toast';
import Meta from '../components/Meta'; // <-- Import Meta

const TabButton = ({ title, activeTab, setActiveTab }) => (
    <button
        onClick={() => setActiveTab(title)}
        className={`py-3 px-6 text-base font-semibold border-b-2 transition-colors duration-150 ease-in-out
      ${activeTab === title ? 'border-red-600 text-gray-800' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}
    `}
    >
        {title}
    </button>
);

const renderRating = (rating) => {
    let stars = [];
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    for (let i = 0; i < fullStars; i++) stars.push(<span key={`f-${i}`} className="text-yellow-400">&#9733;</span>);
    for (let i = 0; i < emptyStars; i++) stars.push(<span key={`e-${i}`} className="text-gray-300">&#9733;</span>);
    return stars;
};

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('Description');

    const [reviewRating, setReviewRating] = useState(0);
    const [reviewComment, setReviewComment] = useState('');
    const [reviewLoading, setReviewLoading] = useState(false);
    const [submittedReview, setSubmittedReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const { addToCart } = useCart();
    const { userInfo } = useUser();
    const navigate = useNavigate();

    const fetchProductDetails = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data: productData } = await axios.get(`/api/products/${id}`);
            setProduct(productData);

            const { data } = await axios.get(`/api/products`);
            const allProductsArray = data.products;
            setRelatedProducts(allProductsArray.filter((p) => p._id !== id).slice(0, 4));

        } catch (err) {
            setError('Failed to load product details.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchProductDetails();
        if (product && userInfo) {
            setSubmittedReview(product.reviews.some(r => r.user.toString() === userInfo._id));
        }
    }, [id, submittedReview]);

    const submitReviewHandler = async (e) => {
        e.preventDefault();
        setReviewError('');
        if (reviewRating === 0 || reviewComment === '') { setReviewError('Please select a rating and enter a comment.'); return; }
        setReviewLoading(true);
        try {
            const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
            await axios.post(`/api/products/${id}/reviews`, { rating: reviewRating, comment: reviewComment }, config);
            setReviewComment(''); setReviewRating(0); setReviewLoading(false); setSubmittedReview(true);
            toast.success('Thank you for your review!');
        } catch (error) {
            setReviewError(error.response?.data?.message || 'Failed to submit review.');
            setReviewLoading(false);
        }
    };

    const handleQuantityChange = (amount) => { setQuantity((prev) => Math.max(1, prev + amount)); };
    const handleAddToCart = () => { if (product) { addToCart(product, quantity); toast.success(`${quantity} x ${product.name} added to cart!`); } };
    const handleBuyNow = () => { if (product) { addToCart(product, quantity); navigate('/checkout'); } };

    if (loading) return <p className="text-center py-20">Loading product...</p>;
    if (error) return <p className="text-center py-20 text-red-500 bg-red-100 p-4 rounded">{error}</p>;
    if (!product) return <p className="text-center py-20">Product not found.</p>;

    return (
        <div className="container mx-auto px-4 py-12">
            {/* --- DYNAMIC SEO META TAGS --- */}
            <Meta title={`${product.name} | Vanrai Spices`} description={product.description} />
            {/* ----------------------------- */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div><img src={product.imageUrl} alt={product.name} className="w-full h-auto object-cover rounded-lg shadow-lg"/></div>
                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">{product.name}</h1>
                    <div className="flex items-center mb-4">{renderRating(product.rating)}<span className="text-gray-600 text-sm ml-2">({product.rating})</span></div>
                    <p className="text-3xl font-bold text-gray-900 mb-4">₹{product.price.toFixed(2)}</p>
                    <p className="text-gray-600 mb-6">{product.description}</p>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border border-gray-300 rounded-md">
                            <button onClick={() => handleQuantityChange(-1)} className="p-3 text-gray-700 hover:bg-gray-100 rounded-l-md disabled:opacity-50" disabled={quantity === 1}><MinusIcon className="w-5 h-5" /></button>
                            <span className="px-5 text-lg font-semibold w-16 text-center">{quantity}</span>
                            <button onClick={() => handleQuantityChange(1)} className="p-3 text-gray-700 hover:bg-gray-100 rounded-r-md"><PlusIcon className="w-5 h-5" /></button>
                        </div>
                        <button onClick={handleAddToCart} className="flex-grow bg-red-600 text-white font-semibold py-3 px-8 rounded-md hover:bg-red-700 transition-colors">Add to Cart</button>
                        <button onClick={handleBuyNow} className="bg-white border border-gray-300 text-gray-700 font-semibold py-3 px-8 rounded-md hover:bg-gray-50 transition-colors">Buy Now</button>
                    </div>
                </div>
            </div>

            <div className="mt-20">
                <div className="border-b border-gray-200 flex justify-center space-x-4">
                    <TabButton title="Description" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton title="Ingredients" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton title="Nutritional Info" activeTab={activeTab} setActiveTab={setActiveTab} />
                    <TabButton title="Customer Reviews" activeTab={activeTab} setActiveTab={setActiveTab} />
                </div>
                <div className="py-8 max-w-3xl mx-auto text-center text-gray-600">
                    {activeTab === 'Description' && <p>{product.description} A premium spice blend for your kitchen.</p>}
                    {activeTab === 'Ingredients' && <p>Corinder, Cumin, Chili, Turmeric, Salt, Spices.</p>}
                    {activeTab === 'Nutritional Info' && <p>Energy: 350 kcal, Protein: 12g, Carbs: 60g.</p>}
                    {activeTab === 'Customer Reviews' && (
                        <div className="text-left space-y-8">
                            <h3 className="text-xl font-bold text-gray-800">Customer Reviews ({product.numReviews})</h3>
                            <div className="border-b pb-4">
                                <h4 className="text-lg font-semibold mb-3">Write a Review</h4>
                                {!userInfo ? (<p className="text-red-500">Please <Link to="/login" className="underline">log in</Link> to submit a review.</p>) : submittedReview ? (<p className="text-green-600">You have already reviewed this product.</p>) : (
                                    <form onSubmit={submitReviewHandler} className="space-y-4">
                                        {reviewError && <div className="p-2 bg-red-100 text-red-600 text-sm rounded">{reviewError}</div>}
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Rating</label><select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} className="w-full border border-gray-300 rounded-md py-2 px-3" required><option value="0">Select...</option><option value="1">1 - Poor</option><option value="2">2 - Fair</option><option value="3">3 - Good</option><option value="4">4 - Very Good</option><option value="5">5 - Excellent</option></select></div>
                                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Comment</label><textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows="3" className="w-full border border-gray-300 rounded-md py-2 px-3 focus:ring-red-500" required></textarea></div>
                                        <button type="submit" disabled={reviewLoading} className={`bg-red-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-red-700 ${reviewLoading ? 'opacity-50' : ''}`}>{reviewLoading ? 'Submitting...' : 'Submit Review'}</button>
                                    </form>
                                )}
                            </div>
                            {product.reviews.length === 0 ? (<p className="text-gray-500">No reviews yet.</p>) : (
                                <div className="space-y-6">
                                    {product.reviews.map((review) => (
                                        <div key={review._id} className="border-b pb-4">
                                            <div className="flex items-center space-x-2 mb-1"><span className="font-semibold text-gray-800">{review.name}</span><span className="text-sm text-gray-500">on {new Date(review.createdAt).toLocaleDateString()}</span></div>
                                            <div className="mb-2">{renderRating(review.rating)}</div>
                                            <p className="text-gray-700">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Related Products</h2>
                <div className="relative">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                        {relatedProducts.map((prod) => (<RelatedProductCard key={prod._id} product={prod} />))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
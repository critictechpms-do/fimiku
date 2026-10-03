'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Heart, Sparkles, RefreshCw, Star, Check, ArrowLeft, Plus, Minus, ShoppingBag, Droplets } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart, ProductType } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { getProductImage } from '@/lib/productImages';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const { addToCart, toggleWishlist, isInWishlist, showToast } = useCart();
  const { isAuthenticated } = useAuth();

  const fetchProduct = async () => {
    try {
      const res = await api.get(`/products/${params.id}/`);
      setProduct(res.data);
    } catch (err) {
      console.error('Failed to load product detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    showToast(`🛍️ Added ${quantity} item(s) to bag`);
  };

  const handleBuyNow = async () => {
    if (!product) return;
    await addToCart(product, quantity);
    router.push('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    if (!isAuthenticated) {
      showToast('⚠️ Please sign in to write a product review.');
      return;
    }

    setSubmittingReview(true);
    try {
      await api.post('/reviews/', {
        product_id: product.id,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      showToast('⭐ Thank you for your review!');
      setReviewComment('');
      fetchProduct();
    } catch (err: any) {
      showToast('⚠️ Could not submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div className="py-32 text-center text-xs text-fimiku-grayText">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="max-w-xl mx-auto py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-fimiku-darkText">Product Not Found</h2>
        <p className="text-xs text-fimiku-secondaryText">The silicone essential you are looking for might have moved.</p>
        <Link href="/shop" className="inline-block px-6 py-2.5 bg-fimiku-cta text-white text-xs font-semibold rounded-full">
          Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 py-8 space-y-12 pb-36 md:pb-24 bg-fimiku-softLavender">
      
      {/* Back Button */}
      <Link href="/shop" className="inline-flex items-center gap-1.5 text-xs font-semibold text-fimiku-secondaryText hover:text-fimiku-primary transition">
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
      </Link>

      {/* Main Product Layout */}
      <div className="grid md:grid-cols-2 gap-10 items-start">
        
        {/* Product Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-3xl bg-white overflow-hidden border border-fimiku-lightBorder shadow-sm">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="w-full h-full object-contain p-4"
            />
            <button
              onClick={() => toggleWishlist(product)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 hover:bg-white text-fimiku-darkText shadow-md transition"
            >
              <Heart
                className={`w-5 h-5 ${
                  isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-fimiku-grayText'
                }`}
              />
            </button>
            <span className="absolute bottom-4 left-4 bg-white text-fimiku-darkText text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-fimiku-lightBorder">
              Age: {product.target_age || 'All Ages'}
            </span>
          </div>
        </div>

        {/* Product Information & Purchase Controls */}
        <div className="space-y-6">
          
          <div className="space-y-2">
            <span className="text-xs font-bold text-fimiku-cta uppercase tracking-wider">
              {product.category?.name || '100% Food-Grade Silicone'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-fimiku-darkText">{product.name}</h1>
            
            {/* Reviews Summary */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(product.average_rating || 5) ? 'fill-amber-400' : 'text-gray-200'}`} />
                ))}
              </div>
              <span className="text-xs font-semibold text-fimiku-darkText">{product.average_rating || 5.0}</span>
              <span className="text-xs text-fimiku-grayText">({product.reviews_count || product.reviews?.length || 1} parent reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-baseline gap-3 p-4 bg-white rounded-2xl border border-fimiku-lightBorder shadow-sm">
            <span className="text-2xl sm:text-3xl font-bold text-fimiku-darkText">
              ₹{product.discount_price || product.price}
            </span>
            {product.discount_price && (
              <>
                <span className="text-sm text-fimiku-grayText line-through">₹{product.price}</span>
                <span className="text-xs bg-fimiku-veryLightLavender text-fimiku-cta border border-fimiku-lightPurple/40 font-bold px-2.5 py-0.5 rounded-full">
                  Save ₹{Number(product.price) - Number(product.discount_price)}
                </span>
              </>
            )}
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-fimiku-secondaryText leading-relaxed">
            {product.description}
          </p>

          {/* Material & Feature Bullets */}
          <div className="space-y-3 bg-white p-5 rounded-2xl border border-fimiku-lightBorder shadow-sm">
            <h3 className="text-xs font-bold text-fimiku-darkText uppercase tracking-wide">Product Highlights</h3>
            <p className="text-xs text-fimiku-secondaryText font-medium">🌿 <strong>Material:</strong> {product.material || '100% Food-Grade Platinum Silicone'}</p>
            {product.features && product.features.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {product.features.map((feat: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 text-xs text-fimiku-secondaryText">
                    <Check className="w-3.5 h-3.5 text-fimiku-cta flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-fimiku-darkText">Quantity:</span>
              <div className="flex items-center border border-fimiku-lightBorder rounded-full bg-white px-2 py-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 text-fimiku-grayText hover:text-fimiku-darkText"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-fimiku-darkText">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                  className="p-1 text-fimiku-grayText hover:text-fimiku-darkText"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-fimiku-grayText">
                {product.stock > 0 ? `(${product.stock} in stock)` : 'Available'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-4 bg-white border border-fimiku-lightBorder text-fimiku-darkText font-semibold text-xs sm:text-sm rounded-full hover:bg-fimiku-veryLightLavender transition shadow-sm flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-fimiku-cta" /> Add to Bag
              </button>
              <button
                onClick={handleBuyNow}
                className="py-3.5 px-4 bg-fimiku-cta hover:bg-fimiku-primary text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-md"
              >
                Buy Now
              </button>
            </div>
          </div>

          {/* Brand Assurance Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-fimiku-lightBorder text-[11px] text-fimiku-secondaryText">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-fimiku-cta" />
              <span>100% Certified Platinum Silicone</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-fimiku-primary" />
              <span>Dishwasher & Sterilizer Safe</span>
            </div>
          </div>

        </div>

      </div>

      {/* Customer Reviews Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-fimiku-lightBorder shadow-sm space-y-8">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-fimiku-darkText">Parent Reviews & Feedback</h2>
          <p className="text-xs text-fimiku-secondaryText">Real experiences from parents using Fimiku essentials</p>
        </div>

        {/* Existing Reviews */}
        <div className="space-y-4 divide-y divide-fimiku-lightBorder">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev: any) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-fimiku-darkText">{rev.user_name || 'Verified Parent'}</span>
                  <div className="flex text-amber-400">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-fimiku-secondaryText leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-fimiku-grayText py-2">No reviews yet for this product. Be the first to review!</p>
          )}
        </div>

        {/* Write a Review */}
        <form onSubmit={handleReviewSubmit} className="pt-6 border-t border-fimiku-lightBorder space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-fimiku-darkText">Leave a Review</h3>
          <div className="flex items-center gap-3">
            <span className="text-xs text-fimiku-secondaryText">Rating:</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setReviewRating(star)}
                  className={`p-1 ${star <= reviewRating ? 'text-amber-400' : 'text-gray-300'}`}
                >
                  <Star className="w-4 h-4 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={3}
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Share how this product helped your little one..."
            className="w-full p-3.5 text-xs bg-fimiku-softLavender border border-fimiku-lightBorder rounded-2xl focus:outline-none focus:border-fimiku-primary text-fimiku-darkText resize-none"
          />

        </form>
      </div>

      {/* Mobile Sticky Add-to-Bag Bar */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-fimiku-lightBorder p-3 px-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)] flex items-center justify-between gap-3 animate-fade-in">
        <div>
          <div className="text-sm font-bold text-fimiku-darkText">
            ₹{product.discount_price || product.price}
          </div>
          <span className="text-[10px] text-fimiku-cta font-semibold">Free Express Delivery</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleWishlist(product)}
            className="p-2.5 rounded-full border border-fimiku-lightBorder bg-white text-fimiku-darkText shadow-sm"
          >
            <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-red-500 text-red-500' : 'text-fimiku-grayText'}`} />
          </button>
          <button
            onClick={handleAddToCart}
            className="py-2.5 px-5 bg-fimiku-cta hover:bg-fimiku-primary text-white font-bold text-xs rounded-full transition shadow-md flex items-center justify-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>
        </div>
      </div>

    </div>
  );
}

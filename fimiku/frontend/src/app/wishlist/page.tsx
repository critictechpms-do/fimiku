'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2, ArrowRight, ShieldCheck, Sparkles, Star, PackageOpen } from 'lucide-react';
import { useCart, ProductType } from '@/context/CartContext';
import { api } from '@/lib/api';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart, showToast } = useCart();
  const [wishlistProducts, setWishlistProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlistItems = async () => {
    try {
      setLoading(true);
      const res = await api.get('/wishlist/');
      if (res.data && res.data.products) {
        setWishlistProducts(res.data.products);
      } else {
        setWishlistProducts([]);
      }
    } catch (err) {
      console.error('Error fetching wishlist products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlistItems();
  }, [wishlist.length]);

  const handleRemove = async (prod: ProductType) => {
    await toggleWishlist(prod);
    setWishlistProducts((prev) => prev.filter((p) => p.id !== prod.id));
  };

  const handleAddToCart = async (prod: ProductType) => {
    const success = await addToCart(prod);
    if (success) {
      showToast(`✨ ${prod.name} added to your bag!`);
    }
  };

  return (
    <div className="min-h-screen bg-fimiku-softLavender flex flex-col selection:bg-fimiku-lightPurple/30">
      <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 py-10 w-full flex-grow">
        {/* Header Breadcrumbs & Title */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs text-fimiku-grayText mb-3">
            <Link href="/" className="hover:text-fimiku-primary transition">Home</Link>
            <span>/</span>
            <span className="text-fimiku-darkText font-medium">My Favourites</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-fimiku-lightBorder shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-fimiku-veryLightLavender flex items-center justify-center border border-fimiku-lightPurple/40 text-fimiku-cta">
                <Heart className="w-7 h-7 fill-fimiku-cta text-fimiku-cta" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-fimiku-darkText tracking-tight">
                  My Favourites
                </h1>
                <p className="text-xs sm:text-sm text-fimiku-secondaryText mt-0.5">
                  Your curated collection of safe, platinum food-grade silicone toys
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-2 bg-fimiku-veryLightLavender text-fimiku-cta text-xs font-bold rounded-full border border-fimiku-lightPurple/30">
                {wishlistProducts.length} {wishlistProducts.length === 1 ? 'Item' : 'Items'} Saved
              </span>
              <Link
                href="/shop"
                className="px-5 py-2 bg-fimiku-softLavender hover:bg-fimiku-lavenderCard text-fimiku-darkText text-xs font-semibold rounded-full border border-fimiku-lightBorder transition flex items-center gap-1.5"
              >
                <span>Browse Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-4 border border-fimiku-lightBorder animate-pulse space-y-3">
                <div className="w-full aspect-square bg-fimiku-veryLightLavender rounded-2xl"></div>
                <div className="h-4 bg-fimiku-veryLightLavender rounded w-3/4"></div>
                <div className="h-4 bg-fimiku-veryLightLavender rounded w-1/2"></div>
                <div className="h-10 bg-fimiku-veryLightLavender rounded-full mt-4"></div>
              </div>
            ))}
          </div>
        ) : wishlistProducts.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-fimiku-lightBorder p-12 text-center max-w-2xl mx-auto shadow-card space-y-6 animate-fade-in">
            <div className="w-20 h-20 bg-fimiku-veryLightLavender rounded-full flex items-center justify-center mx-auto text-fimiku-cta border border-fimiku-lightPurple/30">
              <PackageOpen className="w-10 h-10 text-fimiku-cta" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-fimiku-darkText">
                Your Favourites list is empty
              </h2>
              <p className="text-xs sm:text-sm text-fimiku-secondaryText max-w-md mx-auto leading-relaxed">
                You haven&apos;t saved any silicone essentials yet. Click the heart icon on any product in our store to save it here for later.
              </p>
            </div>
            <div className="pt-2">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-fimiku-cta hover:bg-fimiku-primary text-white text-xs sm:text-sm font-semibold rounded-full transition shadow-md hover:shadow-lg"
              >
                <span>Explore All Toys</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {wishlistProducts.map((product) => {
              const hasDiscount = product.discount_price && Number(product.discount_price) < Number(product.price);
              const displayPrice = product.final_price || product.discount_price || product.price;

              return (
                <div
                  key={product.id}
                  className="group bg-white rounded-3xl border border-fimiku-lightBorder hover:border-fimiku-lightPurple/60 hover:shadow-floating transition-all duration-300 flex flex-col justify-between overflow-hidden relative p-3 sm:p-4"
                >
                  <div>
                    {/* Top Badges & Remove Button */}
                    <div className="relative aspect-square bg-fimiku-veryLightLavender/50 rounded-2xl overflow-hidden flex items-center justify-center p-2 mb-3">
                      <Link href={`/product/${product.id}`} className="w-full h-full relative block">
                        <Image
                          src={product.image_url || '/placeholder.png'}
                          alt={product.name}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>

                      {/* Discount Badge */}
                      {hasDiscount && (
                        <span className="absolute top-2 left-2 bg-fimiku-paleAqua text-fimiku-deep text-[9px] sm:text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                          SALE
                        </span>
                      )}

                      {/* Remove from Wishlist Button */}
                      <button
                        onClick={() => handleRemove(product)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-500 rounded-full transition shadow-sm border border-fimiku-lightBorder"
                        title="Remove from Favourites"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Card Info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1 text-[10px] sm:text-[11px] text-fimiku-grayText">
                        <span className="truncate">{product.category_name || 'Silicone Toy'}</span>
                        <div className="flex items-center text-amber-500 gap-0.5 flex-shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span className="font-semibold text-fimiku-darkText">{product.average_rating || 5.0}</span>
                        </div>
                      </div>

                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-bold text-xs sm:text-sm text-fimiku-darkText group-hover:text-fimiku-primary transition line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-fimiku-lightBorder/70 mt-3 space-y-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xs sm:text-sm font-bold text-fimiku-darkText">
                        ₹{Number(displayPrice).toFixed(0)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-fimiku-grayText line-through">
                          ₹{Number(product.price).toFixed(0)}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 bg-fimiku-cta hover:bg-fimiku-primary text-white text-[11px] font-semibold rounded-full transition flex items-center justify-center gap-1 shadow-sm"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>Add to Bag</span>
                      </button>
                      <Link
                        href={`/product/${product.id}`}
                        className="w-full py-2 bg-fimiku-veryLightLavender hover:bg-fimiku-lavenderCard text-fimiku-cta text-[11px] font-semibold rounded-full transition flex items-center justify-center border border-fimiku-lightPurple/40"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Value Prop Banner */}
        <div className="mt-16 bg-white rounded-3xl p-8 border border-fimiku-lightBorder shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-12 h-12 rounded-2xl bg-fimiku-veryLightLavender flex items-center justify-center text-fimiku-cta border border-fimiku-lightPurple/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-fimiku-darkText">100% Certified Safe</h4>
              <p className="text-xs text-fimiku-secondaryText">BPA, PVC & Phthalate free European LFGB grade silicone</p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-12 h-12 rounded-2xl bg-fimiku-veryLightLavender flex items-center justify-center text-fimiku-cta border border-fimiku-lightPurple/30">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-fimiku-darkText">Gentle on Little Gums</h4>
              <p className="text-xs text-fimiku-secondaryText">Hypoallergenic & soothing textures for every milestone</p>
            </div>
            <div className="flex flex-col items-center space-y-2 p-2">
              <div className="w-12 h-12 rounded-2xl bg-fimiku-veryLightLavender flex items-center justify-center text-fimiku-cta border border-fimiku-lightPurple/30">
                <Heart className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-fimiku-darkText">Parent-Approved Quality</h4>
              <p className="text-xs text-fimiku-secondaryText">Dishwasher, freezer & sterilizer safe for effortless cleaning</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

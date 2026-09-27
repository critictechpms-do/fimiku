'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Heart, Star, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart, ProductType } from '@/context/CartContext';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';

  const [products, setProducts] = useState<ProductType[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [search, setSearch] = useState(initialSearch);
  const [sortBy, setSortBy] = useState('');

  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  useEffect(() => {
    const catFromUrl = searchParams.get('category') || '';
    const searchFromUrl = searchParams.get('search') || '';
    setSelectedCategory(catFromUrl);
    if (searchFromUrl) setSearch(searchFromUrl);
  }, [searchParams]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories/');
        setCategories(res.data.results || res.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params: Record<string, string> = {};
        if (selectedCategory) params.category = selectedCategory;
        if (search.trim()) params.search = search.trim();
        if (sortBy) params.sort = sortBy;

        const res = await api.get('/products/', { params });
        const data = res.data.results || res.data || [];
        setProducts(data);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchProducts, 250);
    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, search, sortBy]);

  return (
    <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 py-8 space-y-6 pb-20 bg-fimiku-softLavender">
      
      {/* Page Title & Search Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 2xl:p-10 border border-fimiku-lightBorder shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-baseline gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-fimiku-cta font-bold">100% Food-Grade Silicone</span>
            <h1 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-fimiku-darkText mt-1">Baby & Child Essentials</h1>
            <p className="text-xs sm:text-sm text-fimiku-secondaryText mt-0.5">
              Engineered for gentle teething, safe meal times, and joyful bath play
            </p>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-fimiku-grayText absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search teethers, bath toys..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-full text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
              />
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-full text-xs text-fimiku-darkText focus:outline-none focus:border-fimiku-primary cursor-pointer"
              >
                <option value="">Sort By (Featured)</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
              selectedCategory === ''
                ? 'bg-fimiku-cta text-white shadow-sm'
                : 'bg-fimiku-softLavender text-fimiku-darkText border border-fimiku-lightBorder hover:bg-fimiku-veryLightLavender'
            }`}
          >
            All Toys ({products.length})
          </button>

          {[
            { name: "Teething Toys", slug: "teethers" },
            { name: "Bath Toys", slug: "bath" },
            { name: "Feeding Accessories", slug: "feeding" },
            { name: "Sensory Learning", slug: "sensory" },
            { name: "Baby Play", slug: "baby-play" },
            { name: "Kitchen Silicone", slug: "kitchen" },
          ].map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat.slug
                  ? 'bg-fimiku-cta text-white shadow-sm'
                  : 'bg-fimiku-softLavender text-fimiku-darkText border border-fimiku-lightBorder hover:bg-fimiku-veryLightLavender'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid (Matching PDF Page 2 style) */}
      {loading ? (
        <div className="py-24 text-center text-xs text-fimiku-grayText">Loading Fimiku catalog items...</div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl border border-fimiku-lightBorder p-8 space-y-4 shadow-sm">
          <p className="text-base font-bold text-fimiku-darkText">No products found</p>
          <p className="text-xs text-fimiku-secondaryText">Try adjusting your search terms or category selection.</p>
          <button
            onClick={() => {
              setSelectedCategory('');
              setSearch('');
            }}
            className="px-6 py-2.5 bg-fimiku-cta text-white text-xs font-semibold rounded-full hover:bg-fimiku-primary transition"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6 2xl:gap-8">
          {products.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-3xl p-4 border border-fimiku-lightBorder shadow-sm hover:shadow-card transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Category Pill with Green Indicator */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-fimiku-secondaryText">
                  <span className="w-2 h-2 rounded-full bg-fimiku-softGreen border border-emerald-400"></span>
                  <span className="truncate">{prod.category?.name || "Feeding Accessories"}</span>
                </div>

                {/* Product Image */}
                <div className="relative aspect-square rounded-2xl bg-fimiku-softLavender overflow-hidden flex items-center justify-center">
                  <Link href={`/product/${prod.id}`} className="w-full h-full">
                    <img
                      src={prod.image_url || "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600"}
                      alt={prod.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                    />
                  </Link>
                  <button
                    onClick={() => toggleWishlist(prod)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition ${
                      isInWishlist(prod.id) ? 'text-red-500 fill-red-500' : 'text-fimiku-grayText hover:text-fimiku-cta'
                    }`}
                    title="Toggle Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(prod.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Title */}
                <Link href={`/product/${prod.id}`}>
                  <h3 className="font-bold text-xs sm:text-sm text-fimiku-darkText line-clamp-2 hover:text-fimiku-primary transition">
                    {prod.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-fimiku-grayText font-medium">({prod.reviews_count || 1})</span>
                </div>
              </div>

              {/* Price & Add to Cart */}
              <div className="pt-4 flex items-center justify-between border-t border-fimiku-lightBorder mt-3">
                <div>
                  <div className="text-sm sm:text-base font-bold text-fimiku-darkText">
                    ₹{prod.discount_price || prod.price}
                  </div>
                  {prod.discount_price && (
                    <div className="text-[11px] text-fimiku-grayText line-through -mt-1">
                      ₹{prod.price}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => addToCart(prod)}
                  className="p-2.5 rounded-2xl bg-fimiku-veryLightLavender hover:bg-fimiku-cta text-fimiku-cta hover:text-white transition shadow-sm border border-fimiku-lightPurple/40"
                  title="Add to Cart"
                >
                  <ShoppingBag className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center text-xs text-fimiku-grayText">Loading Fimiku Catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}

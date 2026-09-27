'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  Feather, 
  ArrowRight, 
  Heart, 
  Star, 
  Check, 
  X, 
  ShoppingBag, 
  Droplets, 
  Flame, 
  Smile, 
  Shield, 
  Leaf, 
  Gift, 
  ChevronDown, 
  ChevronUp, 
  Layers,
  Award,
  CheckCircle2,
  AlertTriangle,
  MessageSquareQuote,
  Baby,
  Truck,
  Headphones
} from 'lucide-react';
import { api } from '@/lib/api';
import { useCart, ProductType } from '@/context/CartContext';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/products/');
        const data = res.data.results || res.data;
        if (Array.isArray(data) && data.length > 0) {
          setFeaturedProducts(data.slice(0, 4));
        } else {
          setFeaturedProducts(mockBestSellers);
        }
      } catch (err) {
        console.error('Failed to load products, using default showcase:', err);
        setFeaturedProducts(mockBestSellers);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-20 pb-20 bg-transparent">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-6 sm:pt-10 px-4 sm:px-6 2xl:px-10">
        <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto">
          {/* Main Floating Hero Card */}
          <div className="bg-white/90 backdrop-blur-md rounded-[36px] sm:rounded-[44px] p-6 sm:p-10 2xl:p-14 border border-purple-100/80 shadow-[0_15px_40px_-5px_rgba(142,87,245,0.08)] animate-fade-in relative overflow-hidden">
            
            {/* Ambient decorative background blobs inside card */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-pink-200/30 via-purple-200/20 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-200/20 to-pink-100/20 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              
              {/* Left Column: Hero Content */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Premium Baby Products Pill */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F2EAFF] text-fimiku-cta text-xs font-bold tracking-wide uppercase border border-purple-200/60 shadow-sm">
                  <Heart className="w-3.5 h-3.5 fill-fimiku-cta" /> Premium Baby Products
                </div>

                {/* Main Headline */}
                <h1 className="text-3xl sm:text-5xl 2xl:text-6xl font-bold text-fimiku-darkText tracking-tight leading-[1.18]">
                  The Safest Choice for <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-[#8E57F5] via-[#A855F7] to-[#EC4899] bg-clip-text text-transparent">
                    Happy Little Ones
                  </span>
                </h1>

                {/* Description */}
                <p className="text-fimiku-secondaryText text-xs sm:text-sm md:text-base max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  Premium food-grade silicone toys, utensils and accessories designed for your baby&apos;s ultimate comfort.
                </p>

                {/* Hero CTA Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-1">
                  <Link
                    href="/shop"
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-[#9764FA] to-[#BA75F9] hover:from-[#8B5CF6] hover:to-[#A855F7] text-white text-xs sm:text-sm font-semibold rounded-full transition shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="#bestsellers"
                    className="w-full sm:w-auto px-8 py-3.5 bg-white text-fimiku-darkText border border-purple-100 hover:bg-[#F6EFFD] text-xs sm:text-sm font-semibold rounded-full transition shadow-sm flex items-center justify-center"
                  >
                    View Best Sellers
                  </Link>
                </div>

                {/* 4 Feature Badges */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3">
                  <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-[#F5EFFF] text-[11px] sm:text-xs font-semibold text-fimiku-cta border border-purple-200/50">
                    <Check className="w-3.5 h-3.5 text-fimiku-cta" /> BPA Free
                  </div>
                  <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-[#FDF0F6] text-[11px] sm:text-xs font-semibold text-pink-600 border border-pink-200/50">
                    <Check className="w-3.5 h-3.5 text-pink-600" /> Phthalate Free
                  </div>
                  <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-[#F5EFFF] text-[11px] sm:text-xs font-semibold text-fimiku-cta border border-purple-200/50">
                    <Check className="w-3.5 h-3.5 text-fimiku-cta" /> Food Grade
                  </div>
                  <div className="inline-flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-[#FDF0F6] text-[11px] sm:text-xs font-semibold text-pink-600 border border-pink-200/50">
                    <Check className="w-3.5 h-3.5 text-pink-600" /> Easy to Clean
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Visual */}
              <div className="lg:col-span-5 relative flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-[4/3] sm:aspect-square rounded-[32px] overflow-hidden bg-gradient-to-tr from-[#F4EDFE] via-[#FAF5FE] to-[#FCEEF5] p-3 shadow-inner border border-purple-100/60 flex items-center justify-center group">
                  <img
                    src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=700"
                    alt="Baby holding soft silicone teether"
                    className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition duration-500"
                  />
                  
                  {/* Floating Little Smiles Badge */}
                  <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3.5 py-2 border border-purple-100 shadow-sm flex items-center gap-2 text-left">
                    <Sparkles className="w-4 h-4 text-fimiku-cta" />
                    <div>
                      <p className="text-[10px] font-bold text-fimiku-darkText leading-tight">Little smiles</p>
                      <p className="text-[9px] text-fimiku-cta font-medium">Big joy</p>
                    </div>
                  </div>

                  {/* Floating 100% Safe Badge */}
                  <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl px-3.5 py-2 border border-purple-100 shadow-sm flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span className="text-[10px] font-bold text-fimiku-darkText">100% Non-Toxic</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Trust Badges Bar */}
          <div className="mt-6 bg-white/80 backdrop-blur-sm rounded-3xl p-4 sm:p-5 border border-purple-100/80 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FDF0F6] flex items-center justify-center text-pink-500 border border-pink-200/50 flex-shrink-0">
                <Heart className="w-4 h-4 fill-pink-500" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs sm:text-sm text-fimiku-darkText">Safe Materials</p>
                <p className="text-[10px] text-fimiku-grayText">For baby&apos;s health</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#F4EDFE] flex items-center justify-center text-fimiku-cta border border-purple-200/50 flex-shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs sm:text-sm text-fimiku-darkText">Fast Shipping</p>
                <p className="text-[10px] text-fimiku-grayText">To your doorstep</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#FDF0F6] flex items-center justify-center text-pink-500 border border-pink-200/50 flex-shrink-0">
                <RefreshCw className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs sm:text-sm text-fimiku-darkText">Easy Returns</p>
                <p className="text-[10px] text-fimiku-grayText">Hassle-free shopping</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 rounded-2xl bg-[#F4EDFE] flex items-center justify-center text-fimiku-cta border border-purple-200/50 flex-shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs sm:text-sm text-fimiku-darkText">Dedicated Support</p>
                <p className="text-[10px] text-fimiku-grayText">We&apos;re here to help</p>
              </div>
            </div>
          </div>

          {/* Quick Category Navigation Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 sm:gap-3 overflow-x-auto py-4 mt-2 no-scrollbar">
            {[
              { name: "Teething Toys", href: "/shop?category=teethers" },
              { name: "Bath Toys", href: "/shop?category=bath" },
              { name: "Feeding Accessories", href: "/shop?category=feeding" },
              { name: "Sensory Play", href: "/shop?category=sensory" },
              { name: "Baby Play", href: "/shop?category=baby-play" },
              { name: "Kitchen Silicone", href: "/shop?category=kitchen" },
            ].map((cat, idx) => (
              <Link
                key={idx}
                href={cat.href}
                className="whitespace-nowrap px-5 py-2 rounded-full bg-white/90 hover:bg-[#F4EDFE] border border-purple-100 text-xs sm:text-sm font-medium text-fimiku-darkText transition shadow-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 2. BEST SELLERS SECTION */}
      <section id="bestsellers" className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2">
          <div>
            <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-fimiku-darkText flex items-center gap-2">
              <Flame className="w-6 h-6 text-amber-500 fill-amber-500" /> Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-fimiku-grayText">Most loved by kids and parents alike</p>
          </div>
          <Link
            href="/shop"
            className="text-xs sm:text-sm font-bold text-fimiku-cta hover:text-fimiku-primary flex items-center gap-1 transition"
          >
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 2xl:gap-8">
          {featuredProducts.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-3xl p-4 sm:p-5 border border-fimiku-lightBorder shadow-sm hover:shadow-card transition flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Category Pill with Green Dot */}
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-fimiku-secondaryText">
                  <span className="w-2 h-2 rounded-full bg-fimiku-softGreen border border-emerald-400"></span>
                  <span className="truncate">{prod.category?.name || "Feeding Accessories"}</span>
                </div>

                {/* Product Image */}
                <div className="relative aspect-square rounded-2xl bg-fimiku-softLavender overflow-hidden flex items-center justify-center">
                  <img
                    src={getProductImage(prod)}
                    alt={prod.name}
                    className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
                  />
                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(prod)}
                    className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm transition ${
                      isInWishlist(prod.id) ? 'text-red-500 fill-red-500' : 'text-fimiku-grayText hover:text-fimiku-cta'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(prod.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Product Title */}
                <Link href={`/product/${prod.id}`}>
                  <h3 className="font-bold text-xs sm:text-sm text-fimiku-darkText line-clamp-2 hover:text-fimiku-primary transition">
                    {prod.name}
                  </h3>
                </Link>

                {/* Ratings */}
                <div className="flex items-center gap-1 text-amber-400 text-xs">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-fimiku-grayText font-medium">({prod.reviews_count || 1})</span>
                </div>
              </div>

              {/* Price & Add to Cart Button */}
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
      </section>

      {/* 3. SHOP BY CATEGORY */}
      <section className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 space-y-6">
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-fimiku-cta uppercase tracking-wide">
            <Gift className="w-4 h-4 text-pink-500" /> Explore Collections
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-fimiku-darkText">Shop by Category</h2>
          <p className="text-xs sm:text-sm text-fimiku-secondaryText">Explore our most loved collections for your little one</p>
        </div>

        {/* 4 Main Pastel Category Cards matching Image 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "0 – 12 Months",
              subtitle: "Teethers, pacifiers, feeding essentials",
              href: "/shop?category=teethers",
              bg: "bg-gradient-to-b from-[#F3EEFF] to-[#FAF8FF]",
              border: "border-purple-200/60",
              btnBg: "bg-gradient-to-r from-[#9764FA] to-[#BA75F9]",
              img: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=500"
            },
            {
              title: "1 – 2 Years",
              subtitle: "Bowls, cups, plates, cutlery & more",
              href: "/shop?category=feeding",
              bg: "bg-gradient-to-b from-[#FDF0F6] to-[#FFF9FB]",
              border: "border-pink-200/60",
              btnBg: "bg-gradient-to-r from-[#EC4899] to-[#F472B6]",
              img: "https://images.unsplash.com/photo-1584839619925-3e41416f393f?auto=format&fit=crop&q=80&w=500"
            },
            {
              title: "3+ Years",
              subtitle: "Creative play & learning toys",
              href: "/shop?category=sensory",
              bg: "bg-gradient-to-b from-[#F3EEFF] to-[#FAF8FE]",
              border: "border-purple-200/60",
              btnBg: "bg-gradient-to-r from-[#9764FA] to-[#BA75F9]",
              img: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=500"
            },
            {
              title: "Baby Care",
              subtitle: "Bath time, hygiene & daily care",
              href: "/shop?category=bath",
              bg: "bg-gradient-to-b from-[#FDF0F4] to-[#FFF9FA]",
              border: "border-pink-200/60",
              btnBg: "bg-gradient-to-r from-[#EC4899] to-[#F472B6]",
              img: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=500"
            },
          ].map((cat, idx) => (
            <div
              key={idx}
              className={`${cat.bg} rounded-[32px] p-6 border ${cat.border} shadow-[0_8px_30px_rgb(142,87,245,0.05)] hover:shadow-floating transition-all duration-300 flex flex-col items-center justify-between text-center group`}
            >
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden mb-4 p-2 bg-white/70 backdrop-blur-sm shadow-inner flex items-center justify-center">
                <img
                  src={cat.img}
                  alt={cat.title}
                  className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="space-y-1.5 mb-5">
                <h3 className="font-bold text-base sm:text-lg text-fimiku-darkText group-hover:text-fimiku-primary transition">
                  {cat.title}
                </h3>
                <p className="text-xs text-fimiku-secondaryText line-clamp-1">
                  {cat.subtitle}
                </p>
              </div>
              <Link
                href={cat.href}
                className={`w-full py-2.5 ${cat.btnBg} hover:opacity-90 text-white font-semibold text-xs rounded-full transition shadow-sm hover:shadow-md flex items-center justify-center gap-1.5`}
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 4. THE FIMIKU PROMISE / WHY PARENTS TRUST US */}
      <section className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1.5 rounded-full bg-[#F2EAFF] text-fimiku-cta text-xs font-bold tracking-wider uppercase border border-purple-200/60">
            THE FIMIKU PROMISE
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-fimiku-darkText">Why Parents Trust Us?</h2>
          <p className="text-xs sm:text-sm text-fimiku-secondaryText max-w-lg mx-auto leading-relaxed">
            More than just toys—we provide peace of mind for you and joy for your baby.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Medical Grade Safety",
              desc: "100% food-grade silicone, FDA approved, and totally free from BPA, Phthalates, and PVC. Safe enough to chew all day!",
              icon: ShieldCheck,
              iconColor: "text-fimiku-cta",
              bgColor: "bg-purple-100/70"
            },
            {
              title: "Growth Focused",
              desc: "Designed with pediatric experts to actively stimulate sensory development, motor skills, and creative play in every stage.",
              icon: Sparkles,
              iconColor: "text-pink-600",
              bgColor: "bg-pink-100/70"
            },
            {
              title: "Eco-Friendly Choice",
              desc: "Durable, mold-resistant, and endlessly reusable. Better for your baby's future, and better for the planet than plastics.",
              icon: Leaf,
              iconColor: "text-emerald-600",
              bgColor: "bg-emerald-100/70"
            },
            {
              title: "Boil & Bite Ready",
              desc: "Extremely heat resistant. Simply toss them in the dishwasher or boil them to sterilize. Say goodbye to hidden mold!",
              icon: Flame,
              iconColor: "text-amber-500",
              bgColor: "bg-amber-100/70"
            },
            {
              title: "Instant Soothing Relief",
              desc: "The perfect soft-yet-firm texture to massage tender gums and provide immediate relief during difficult teething phases.",
              icon: Smile,
              iconColor: "text-fimiku-cta",
              bgColor: "bg-purple-100/70"
            },
            {
              title: "Built to Last",
              desc: "Our toys won't break, crack, or fade. They are designed to withstand years of play and can be passed down to siblings.",
              icon: Shield,
              iconColor: "text-pink-600",
              bgColor: "bg-pink-100/70"
            },
          ].map((pillar, idx) => (
            <div
              key={idx}
              className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 sm:p-8 border border-purple-100/70 shadow-sm hover:shadow-card transition text-center space-y-3 flex flex-col items-center justify-center"
            >
              <div className={`w-12 h-12 mx-auto rounded-2xl ${pillar.bgColor} flex items-center justify-center border border-purple-200/40 shadow-sm`}>
                <pillar.icon className={`w-6 h-6 ${pillar.iconColor}`} />
              </div>
              <h3 className="font-bold text-base sm:text-lg text-fimiku-darkText">{pillar.title}</h3>
              <p className="text-xs sm:text-sm text-fimiku-secondaryText max-w-sm mx-auto leading-relaxed">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. SILICONE VS PLASTIC */}
      <section className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-fimiku-darkText">Silicone vs. Plastic</h2>
          <p className="text-xs sm:text-sm text-fimiku-secondaryText">Why we choose silicone for your little one</p>
        </div>

        {/* Comparison Cards Grid */}
        <div className="grid md:grid-cols-2 gap-6 items-stretch">
          {/* Soft Purple Card: Premium Silicone */}
          <div className="bg-gradient-to-b from-[#F3EEFF] to-[#FAF8FF] rounded-[32px] p-6 sm:p-8 border border-purple-200/70 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#EADBFE] text-fimiku-cta font-bold text-xs sm:text-sm border border-purple-200">
                <CheckCircle2 className="w-4 h-4 text-fimiku-cta" />
                <span>Premium Silicone</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-fimiku-darkText">
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-200/80 flex items-center justify-center flex-shrink-0 text-fimiku-cta">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>100% Non-Toxic & BPA-Free</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-200/80 flex items-center justify-center flex-shrink-0 text-fimiku-cta">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Soft, Safe & Ultra Durable</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-200/80 flex items-center justify-center flex-shrink-0 text-fimiku-cta">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Heat & Cold Resistant (Dishwasher/Sterilizer Safe)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-purple-200/80 flex items-center justify-center flex-shrink-0 text-fimiku-cta">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Easy to Clean & Naturally Bacteria Resistant</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Soft Pink Card: Traditional Plastic */}
          <div className="bg-gradient-to-b from-[#FDF0F4] to-[#FFF9FA] rounded-[32px] p-6 sm:p-8 border border-pink-200/70 shadow-sm space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFE2EC] text-pink-700 font-bold text-xs sm:text-sm border border-pink-200">
                <X className="w-4 h-4 text-pink-600" />
                <span>Traditional Plastic</span>
              </div>
              <ul className="space-y-3 text-xs sm:text-sm text-fimiku-darkText">
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-200/80 flex items-center justify-center flex-shrink-0 text-pink-600">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>May contain harmful chemicals (BPA / Phthalates)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-200/80 flex items-center justify-center flex-shrink-0 text-pink-600">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Less durable & wears out faster</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-200/80 flex items-center justify-center flex-shrink-0 text-pink-600">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Can release microplastics when heated</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-pink-200/80 flex items-center justify-center flex-shrink-0 text-pink-600">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Scratches easily (hides food bacteria)</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 7. BORN FROM A MOTHER'S LOVE */}
      <section className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10">
        <div className="bg-white rounded-[32px] p-6 sm:p-10 2xl:p-12 border border-fimiku-lightBorder shadow-card grid lg:grid-cols-2 gap-8 items-center">
          <div className="w-full aspect-[4/3] lg:aspect-auto lg:h-[380px] rounded-2xl overflow-hidden shadow-inner">
            <img
              src="https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=900"
              alt="Mother and baby bonding with Fimiku silicone teether"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="space-y-4 text-left">
            <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-fimiku-darkText">Born from a Mother&apos;s Love</h2>
            <p className="text-xs sm:text-sm md:text-base text-fimiku-secondaryText leading-relaxed">
              Fimiku started with a simple question: <em>&ldquo;Can we make toys that are as safe as they are fun?&rdquo;</em>
            </p>
            <p className="text-xs sm:text-sm md:text-base text-fimiku-secondaryText leading-relaxed">
              Founded in Chennai, our vision is to eliminate harmful plastics from playrooms across India by offering premium, pure silicone alternatives. We hold ourselves to the ultimate standard: if it isn&apos;t safe enough for our own children, it will never reach yours.
            </p>
            <div className="pt-2">
              <Link
                href="/about"
                className="px-8 py-3 bg-fimiku-cta hover:bg-fimiku-primary text-white text-xs sm:text-sm font-semibold rounded-full transition shadow-md inline-block"
              >
                Our Full Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. WHAT PARENTS SAY */}
      <section className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-fimiku-darkText flex items-center justify-center gap-2">
            <MessageSquareQuote className="w-6 h-6 text-fimiku-cta" /> What Parents Say
          </h2>
          <p className="text-xs sm:text-sm text-fimiku-secondaryText">Real reviews from real families</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote: "My daughter absolutely loves the silicone teethers from Fimiku. Quality is amazing and I have peace of mind!",
              name: "Priya S.",
              role: "6-month-old Mom",
              avatar: "P"
            },
            {
              quote: "Bought the bath toy set for my son. It's so easy to clean and sterilize compared to plastic toys.",
              name: "Rahul M.",
              role: "Father, Bengaluru",
              avatar: "R"
            },
            {
              quote: "The sensory blocks are so soft and vibrant. Best baby purchase this year!",
              name: "Ananya K.",
              role: "Mom of twins",
              avatar: "A"
            }
          ].map((rev, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-fimiku-veryLightLavender flex items-center justify-center text-fimiku-cta font-serif font-bold text-lg">
                    &ldquo;
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-fimiku-darkText italic leading-relaxed">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <div className="w-9 h-9 rounded-full bg-fimiku-veryLightLavender border border-fimiku-lightPurple/40 text-fimiku-cta font-bold text-xs flex items-center justify-center">
                  {rev.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-fimiku-darkText">{rev.name}</h4>
                  <p className="text-[11px] text-fimiku-grayText">{rev.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 9. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 2xl:px-10 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-fimiku-darkText">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Are Fimiku toys 100% safe for newborns?",
              a: "Yes! All our products are made from 100% food-grade silicone, which is BPA-free, PVC-free, and Phthalate-free."
            },
            {
              q: "How do I clean and sterilize silicone toys?",
              a: "Simply wash with warm soapy water, place in the dishwasher top rack, or boil in water for 3-5 minutes to sterilize."
            },
            {
              q: "What is your shipping policy across India?",
              a: "We offer express shipping across India with standard delivery within 3-5 business days."
            },
            {
              q: "Can silicone toys degrade or harbor mold?",
              a: "Unlike plastic toys with hollow crevices, non-porous pure silicone does not harbor mold or degrade over time."
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-fimiku-lightBorder overflow-hidden shadow-sm"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full px-6 py-4 text-left font-bold text-xs sm:text-sm text-fimiku-darkText flex items-center justify-between gap-4 hover:bg-fimiku-veryLightLavender transition"
              >
                <span>{item.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-fimiku-cta flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-fimiku-grayText flex-shrink-0" />
                )}
              </button>
              {openFaq === idx && (
                <div className="px-6 pb-4 pt-1 text-xs text-fimiku-secondaryText leading-relaxed border-t border-fimiku-lightBorder/50">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 10. GET EXCLUSIVE TOY DEALS / NEWSLETTER */}
      <section className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 2xl:px-10">
        <div className="bg-white rounded-3xl p-6 sm:p-10 2xl:p-12 border border-fimiku-lightBorder shadow-card text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-fimiku-veryLightLavender flex items-center justify-center border border-fimiku-lightPurple/40">
            <Gift className="w-6 h-6 text-fimiku-cta" />
          </div>
          <h2 className="text-2xl sm:text-3xl 2xl:text-4xl font-bold text-fimiku-darkText">
            Get Exclusive Toy Deals!
          </h2>
          <p className="text-xs sm:text-sm text-fimiku-secondaryText max-w-md mx-auto leading-relaxed">
            Subscribe and be the first to know about new arrivals, offers and kid-friendly tips.
          </p>

          {subscribed ? (
            <div className="p-3.5 rounded-2xl bg-fimiku-softGreen border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Thank you for subscribing to Fimiku exclusive deals!
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex max-w-md mx-auto gap-2 pt-2">
              <input
                type="email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-fimiku-softLavender rounded-full border border-fimiku-lightBorder text-xs text-fimiku-darkText focus:outline-none focus:border-fimiku-primary shadow-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-fimiku-cta hover:bg-fimiku-primary text-white text-xs font-semibold rounded-full transition shadow-md"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </section>

    </div>
  );
}

const mockBestSellers: ProductType[] = [
  {
    id: 1,
    name: "3 in 1 Pet slow feeder bowl",
    slug: "3-in-1-pet-slow-feeder-bowl",
    description: "Premium food-grade silicone multi-purpose feeder.",
    price: 1422.00,
    discount_price: 711.02,
    image_url: "https://images.unsplash.com/photo-1584839619925-3e41416f393f?auto=format&fit=crop&q=80&w=600",
    category: { id: 1, name: "Feeding Accessories", slug: "feeding" },
    stock: 50,
    is_active: true,
    is_featured: true,
    reviews_count: 2,
    average_rating: 5,
  },
  {
    id: 2,
    name: "SILICONE KITCHEN MAT",
    slug: "silicone-kitchen-mat",
    description: "Multi-purpose silicone kitchen drying and heat mat.",
    price: 1544.00,
    discount_price: 772.38,
    image_url: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&q=80&w=600",
    category: { id: 2, name: "Kitchen Silicone", slug: "kitchen" },
    stock: 45,
    is_active: true,
    is_featured: true,
    reviews_count: 1,
    average_rating: 5,
  },
  {
    id: 3,
    name: "SILICONE BABY FEEDING SET",
    slug: "silicone-baby-feeding-set",
    description: "Soft food-grade suction bowl, bib, and spoon set.",
    price: 1723.00,
    discount_price: 861.50,
    image_url: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&q=80&w=600",
    category: { id: 1, name: "Feeding Accessories", slug: "feeding" },
    stock: 30,
    is_active: true,
    is_featured: true,
    reviews_count: 0,
    average_rating: 5,
  },
  {
    id: 4,
    name: "SILICONE FOLDABLE TUB",
    slug: "silicone-foldable-tub",
    description: "Space-saving collapsible silicone infant bath tub.",
    price: 2200.00,
    discount_price: 1089.34,
    image_url: "https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80&w=600",
    category: { id: 3, name: "Bath Toys", slug: "bath" },
    stock: 20,
    is_active: true,
    is_featured: true,
    reviews_count: 1,
    average_rating: 5,
  }
];

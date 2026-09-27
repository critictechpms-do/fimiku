'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, Tag, Check, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { api } from '@/lib/api';

export default function CartPage() {
  const router = useRouter();
  const { cart, updateQuantity, removeFromCart, clearCart, showToast } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [discountInfo, setDiscountInfo] = useState<{ code: string; discount_amount: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setValidatingCoupon(true);
    try {
      const res = await api.post('/coupons/validate/', {
        code: couponCode.trim(),
        total: cart.total,
      });
      if (res.data?.valid) {
        setDiscountInfo({
          code: res.data.code,
          discount_amount: res.data.discount_amount,
        });
        showToast(`🎟️ Coupon '${res.data.code}' applied successfully!`);
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Invalid coupon code';
      showToast(`⚠️ ${msg}`);
      setDiscountInfo(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const finalTotal = discountInfo ? Math.max(0, cart.total - discountInfo.discount_amount) : cart.total;

  if (cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-28 text-center space-y-6 bg-fimiku-softLavender pb-32">
        <div className="p-6 bg-fimiku-veryLightLavender rounded-full w-fit mx-auto text-fimiku-cta border border-fimiku-lightPurple/40">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-bold text-fimiku-darkText">Your Shopping Bag is Empty</h1>
        <p className="text-xs sm:text-sm text-fimiku-secondaryText max-w-md mx-auto leading-relaxed">
          Discover our direct-from-manufacturer 100% food-grade silicone baby essentials for pure peace of mind.
        </p>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-fimiku-cta hover:bg-fimiku-primary text-white text-xs font-semibold rounded-full transition shadow-md"
        >
          Explore Collection <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 py-10 space-y-8 pb-24 bg-fimiku-softLavender">
      
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-fimiku-darkText">Your Shopping Bag</h1>
        <p className="text-xs text-fimiku-secondaryText mt-1">
          {cart.item_count} {cart.item_count === 1 ? 'essential' : 'essentials'} selected for your little one
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Item List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-fimiku-lightBorder divide-y divide-fimiku-lightBorder/60 shadow-sm">
            {cart.items.map((item) => (
              <div key={item.id} className="py-5 first:pt-0 last:pb-0 flex gap-4 sm:gap-6 items-center">
                
                {/* Thumbnail */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-fimiku-softLavender overflow-hidden flex-shrink-0 border border-fimiku-lightBorder">
                  <img
                    src={item.product.image_url}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1">
                  <Link href={`/product/${item.product.id}`}>
                    <h3 className="font-bold text-xs sm:text-sm text-fimiku-darkText hover:text-fimiku-primary transition">
                      {item.product.name}
                    </h3>
                  </Link>
                  <p className="text-[11px] text-fimiku-grayText">Unit Price: ₹{item.product.final_price || item.product.price}</p>
                  
                  {/* Quantity Adjustment */}
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex items-center border border-fimiku-lightBorder rounded-full px-2 py-0.5 bg-fimiku-softLavender">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-fimiku-grayText hover:text-fimiku-darkText"
                        title="Decrease"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-3 text-xs font-bold text-fimiku-darkText">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-fimiku-grayText hover:text-fimiku-darkText"
                        title="Increase"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-1.5 text-fimiku-grayText hover:text-red-500 rounded-full transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Subtotal */}
                <div className="text-right">
                  <span className="text-sm font-bold text-fimiku-darkText">₹{item.subtotal}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-xs pt-2">
            <Link href="/shop" className="text-fimiku-cta hover:underline font-semibold">
              ← Continue Shopping
            </Link>
            <button onClick={clearCart} className="text-fimiku-grayText hover:text-red-500">
              Clear Entire Bag
            </button>
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-6">
          
          <div className="p-6 sm:p-8 bg-white rounded-3xl border border-fimiku-lightBorder shadow-card space-y-6">
            <h3 className="font-bold text-lg text-fimiku-darkText">Order Summary</h3>
            
            {/* Subtotals */}
            <div className="space-y-3 text-xs text-fimiku-secondaryText border-b border-fimiku-lightBorder pb-4">
              <div className="flex justify-between">
                <span>Bag Subtotal</span>
                <span className="font-semibold text-fimiku-darkText">₹{cart.total}</span>
              </div>
              
              {discountInfo && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({discountInfo.code})</span>
                  <span>- ₹{discountInfo.discount_amount}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span>Shipping</span>
                <span className="text-fimiku-cta font-bold uppercase text-[10px] bg-fimiku-veryLightLavender px-2 py-0.5 rounded-full border border-fimiku-lightPurple/40">
                  FREE PREPAID
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-baseline font-bold text-base text-fimiku-darkText">
              <span>Total to Pay</span>
              <span className="text-xl font-bold text-fimiku-cta">₹{finalTotal}</span>
            </div>

            {/* Coupon Box */}
            <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2">
              <label className="text-[11px] font-semibold text-fimiku-secondaryText flex items-center gap-1">
                <Tag className="w-3 h-3 text-fimiku-cta" /> Have a Promo Code? (Try: FIMIKU10)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-3 py-2 text-xs bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                />
                <button
                  type="submit"
                  disabled={validatingCoupon}
                  className="px-4 py-2 bg-fimiku-cta hover:bg-fimiku-primary text-white text-xs font-semibold rounded-xl transition"
                >
                  Apply
                </button>
              </div>
            </form>

            {/* Checkout Button */}
            <button
              onClick={() => {
                if (discountInfo) {
                  localStorage.setItem('fimiku_discount', JSON.stringify(discountInfo));
                } else {
                  localStorage.removeItem('fimiku_discount');
                }
                router.push('/checkout');
              }}
              className="w-full py-3.5 bg-fimiku-cta hover:bg-fimiku-primary text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-md flex items-center justify-center gap-2"
            >
              Proceed to Secure Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <div className="text-[11px] text-center text-fimiku-grayText">
              🔒 256-bit Encrypted Checkout • Razorpay Secured
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

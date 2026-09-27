'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import { ShieldCheck, CheckCircle2, ArrowRight, Lock, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

export default function CheckoutPage() {
  const { cart, fetchCart, showToast } = useCart();
  const { user } = useAuth();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    shipping_address: '',
    city: '',
    state: '',
    postal_code: '',
  });

  const [discountInfo, setDiscountInfo] = useState<{ code: string; discount_amount: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any | null>(null);

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        full_name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username,
        email: user.email || '',
      }));
    }

    const savedDiscount = localStorage.getItem('fimiku_discount');
    if (savedDiscount) {
      try {
        setDiscountInfo(JSON.parse(savedDiscount));
      } catch {
        // Ignore JSON parse error
      }
    }
  }, [user]);

  const discountAmount = discountInfo?.discount_amount || 0;
  const finalAmount = Math.max(0, cart.total - discountAmount);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const initiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.items.length === 0) {
      showToast('⚠️ Your shopping bag is empty.');
      return;
    }

    setLoading(true);
    try {
      const orderPayload = {
        ...form,
        discount_amount: discountAmount,
        items: cart.items.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          price: parseFloat(String(item.product.final_price || item.product.price)),
          quantity: item.quantity,
        })),
      };

      const res = await api.post('/payment/create-order/', orderPayload);
      const { razorpay_order_id, amount, currency, key_id, order_id, is_mock } = res.data;

      // If in mock / test sandbox simulation mode:
      if (is_mock || typeof (window as any).Razorpay === 'undefined') {
        const verifyRes = await api.post('/payment/verify/', {
          razorpay_order_id: razorpay_order_id,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'test_signature_mock',
        });

        if (verifyRes.data.status) {
          setOrderComplete(verifyRes.data.order || { id: order_id, total_amount: finalAmount, full_name: form.full_name });
          localStorage.removeItem('fimiku_discount');
          await fetchCart();
        }
        return;
      }

      // Live / Sandbox Razorpay Checkout Modal
      const options = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'Fimiku Baby Care',
        description: `Order #${order_id}`,
        order_id: razorpay_order_id,
        handler: async function (response: any) {
          try {
            const verifyRes = await api.post('/payment/verify/', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.status) {
              setOrderComplete(verifyRes.data.order || { id: order_id, total_amount: finalAmount, full_name: form.full_name });
              localStorage.removeItem('fimiku_discount');
              await fetchCart();
            }
          } catch {
            alert('Payment verification failed. Please check with customer care.');
          }
        },
        prefill: {
          name: form.full_name,
          email: form.email,
          contact: form.phone,
        },
        theme: {
          color: '#8044F0',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to create order. Please try again.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (orderComplete) {
    const itemsList = orderComplete.items || cart.items.map((i) => ({
      product_name: i.product.name,
      quantity: i.quantity,
      price: i.product.final_price || i.product.price,
      subtotal: i.subtotal,
      image_url: i.product.image_url,
    }));

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in bg-fimiku-softLavender">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-fimiku-lightBorder shadow-card space-y-6">
          
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-fimiku-cta font-bold">Payment Verified & Confirmed</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-fimiku-darkText mt-1">Thank You For Your Order!</h2>
              <p className="text-xs sm:text-sm text-fimiku-secondaryText max-w-lg mx-auto mt-1 leading-relaxed">
                Order <strong className="text-fimiku-darkText">#FIMIKU-{orderComplete.id}</strong> has been successfully placed. We are preparing your safe silicone essentials for shipment.
              </p>
            </div>
          </div>

          {/* Ordered Items Breakdown */}
          <div className="bg-fimiku-softLavender/50 rounded-2xl p-5 border border-fimiku-lightBorder space-y-4">
            <h3 className="font-bold text-xs sm:text-sm text-fimiku-darkText">
              Ordered Items ({itemsList.length})
            </h3>
            
            <div className="divide-y divide-fimiku-lightBorder">
              {itemsList.map((item: any, idx: number) => (
                <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    {item.image_url && (
                      <div className="w-12 h-12 rounded-xl bg-white overflow-hidden relative flex-shrink-0 border border-fimiku-lightBorder">
                        <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <p className="font-bold text-xs text-fimiku-darkText">{item.product_name}</p>
                      <p className="text-[11px] text-fimiku-grayText">Qty: {item.quantity} × ₹{item.price}</p>
                    </div>
                  </div>
                  <span className="font-bold text-xs text-fimiku-darkText">₹{item.subtotal || (Number(item.price) * Number(item.quantity))}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-fimiku-lightBorder flex justify-between items-center text-xs">
              <span className="font-semibold text-fimiku-secondaryText">Total Paid (Prepaid)</span>
              <span className="text-base font-bold text-fimiku-cta">₹{orderComplete.total_amount || finalAmount}</span>
            </div>
          </div>

          {/* Shipping Details */}
          <div className="p-4 bg-white rounded-2xl text-xs text-fimiku-secondaryText space-y-1.5 border border-fimiku-lightBorder">
            <p className="font-bold text-fimiku-darkText mb-1">📦 Delivery Address</p>
            <p><strong>Recipient:</strong> {orderComplete.full_name || form.full_name}</p>
            <p><strong>Address:</strong> {orderComplete.shipping_address || form.shipping_address}, {orderComplete.city || form.city}, {orderComplete.state || form.state} - {orderComplete.postal_code || form.postal_code}</p>
            <p><strong>Phone:</strong> {orderComplete.phone || form.phone}</p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/orders"
              className="px-8 py-3.5 bg-fimiku-cta hover:bg-fimiku-primary text-white text-xs sm:text-sm font-semibold rounded-full transition shadow-md flex items-center justify-center gap-2"
            >
              <span>View In My Orders</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/shop"
              className="px-8 py-3.5 bg-fimiku-veryLightLavender hover:bg-fimiku-lavenderCard text-fimiku-cta text-xs sm:text-sm font-semibold rounded-full transition border border-fimiku-lightPurple/40 text-center"
            >
              Continue Shopping
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 py-8 space-y-8 pb-24 bg-fimiku-softLavender">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-fimiku-darkText">Secure Checkout</h1>
        <p className="text-xs text-fimiku-secondaryText mt-1">Provide delivery address for your baby essentials</p>
      </div>

      <form onSubmit={initiatePayment} className="grid lg:grid-cols-3 gap-8 items-start">
        
        {/* Delivery Address Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder space-y-6 shadow-sm">
          <h3 className="font-bold text-base sm:text-lg text-fimiku-darkText">1. Shipping Address</h3>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-fimiku-darkText">Full Name *</label>
              <input
                required
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="Parent's Name"
                className="w-full mt-1 p-3 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-fimiku-darkText">Phone Number *</label>
              <input
                required
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile number"
                className="w-full mt-1 p-3 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-fimiku-darkText">Email Address (For Order Updates) *</label>
            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full mt-1 p-3 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-fimiku-darkText">Street Address & Apartment *</label>
            <textarea
              required
              rows={3}
              name="shipping_address"
              value={form.shipping_address}
              onChange={handleChange}
              placeholder="House/Flat No, Landmark, Street name"
              className="w-full mt-1 p-3 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText resize-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-fimiku-darkText">City *</label>
              <input
                required
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full mt-1 p-3 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-fimiku-darkText">State *</label>
              <input
                required
                type="text"
                name="state"
                value={form.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full mt-1 p-3 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-fimiku-darkText">PIN Code *</label>
              <input
                required
                type="text"
                name="postal_code"
                value={form.postal_code}
                onChange={handleChange}
                placeholder="PIN"
                className="w-full mt-1 p-3 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
              />
            </div>
          </div>
        </div>

        {/* Order Summary & Payment Button */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-fimiku-lightBorder shadow-card space-y-6">
          <h3 className="font-bold text-base sm:text-lg text-fimiku-darkText">2. Order Summary</h3>

          <div className="divide-y divide-fimiku-lightBorder max-h-52 overflow-y-auto text-xs text-fimiku-secondaryText">
            {cart.items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between items-center">
                <span className="line-clamp-1 flex-1 pr-2">{item.product.name} × {item.quantity}</span>
                <span className="font-semibold text-fimiku-darkText">₹{item.subtotal}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 pt-3 border-t border-fimiku-lightBorder text-xs text-fimiku-secondaryText">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-fimiku-darkText">₹{cart.total}</span>
            </div>

            {discountInfo && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Coupon ({discountInfo.code})</span>
                <span>- ₹{discountInfo.discount_amount}</span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span>Shipping</span>
              <span className="text-fimiku-cta font-bold text-[10px] bg-fimiku-veryLightLavender px-2 py-0.5 rounded-full border border-fimiku-lightPurple/40">
                FREE PREPAID
              </span>
            </div>

            <div className="flex justify-between font-bold text-base text-fimiku-darkText pt-2 border-t border-fimiku-lightBorder">
              <span>Total Payable</span>
              <span className="text-xl font-bold text-fimiku-cta">₹{finalAmount}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || cart.items.length === 0}
            className="w-full py-3.5 bg-fimiku-cta hover:bg-fimiku-primary text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4 text-white" />
            {loading ? 'Securing Razorpay Session...' : `Pay ₹${finalAmount} & Complete Order`}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-fimiku-grayText">
            <ShieldCheck className="w-3.5 h-3.5 text-fimiku-cta" /> Safe & Certified Baby Care Guarantee
          </div>
        </div>

      </form>
    </div>
  );
}

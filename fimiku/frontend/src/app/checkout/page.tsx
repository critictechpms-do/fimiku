'use client';

import React, { useState, useEffect } from 'react';
import Script from 'next/script';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Lock,
  Smartphone,
  CreditCard,
  Wallet,
  Landmark,
  Banknote,
  ChevronRight,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentMethod = 'upi' | 'card' | 'wallet' | 'netbanking' | 'cod';

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

  const [discountInfo, setDiscountInfo] = useState<{
    code: string;
    discount_amount: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState<any | null>(null);

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('upi');

  useEffect(() => {
    if (user) {
      setForm((prev) => ({
        ...prev,
        full_name:
          `${user.first_name || ''} ${user.last_name || ''}`.trim() ||
          user.username,
        email: user.email || '',
      }));
    }

    const savedDiscount = localStorage.getItem('fimiku_discount');

    if (savedDiscount) {
      try {
        setDiscountInfo(JSON.parse(savedDiscount));
      } catch {
        // Ignore invalid discount
      }
    }
  }, [user]);

  const discountAmount = discountInfo?.discount_amount || 0;
  const finalAmount = Math.max(0, cart.total - discountAmount);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const getPaymentMethodName = () => {
    switch (paymentMethod) {
      case 'upi':
        return 'UPI / GPay';
      case 'card':
        return 'Credit / Debit Card';
      case 'wallet':
        return 'Wallet';
      case 'netbanking':
        return 'Net Banking';
      case 'cod':
        return 'Cash on Delivery';
      default:
        return 'Online Payment';
    }
  };

  const initiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.items.length === 0) {
      showToast('⚠️ Your shopping bag is empty.');
      return;
    }

    if (!form.phone || form.phone.replace(/\D/g, '').length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    setLoading(true);

    try {
      const orderPayload = {
        ...form,
        discount_amount: discountAmount,
        payment_method: paymentMethod,
        items: cart.items.map((item) => ({
          product_id: item.product.id,
          name: item.product.name,
          price: parseFloat(
            String(item.product.final_price || item.product.price)
          ),
          quantity: item.quantity,
        })),
      };

      /*
       * CASH ON DELIVERY
       *
       * This uses a separate backend endpoint so COD is NOT
       * incorrectly marked as PAID.
       */
      if (paymentMethod === 'cod') {
        const codRes = await api.post(
          '/payment/create-cod-order/',
          orderPayload
        );

        if (codRes.data) {
          const codOrder =
            codRes.data.order || {
              id: codRes.data.order_id,
              total_amount: finalAmount,
              full_name: form.full_name,
              phone: form.phone,
              shipping_address: form.shipping_address,
              city: form.city,
              state: form.state,
              postal_code: form.postal_code,
              payment_method: 'COD',
              payment_status: 'COD',
              order_status: 'PROCESSING',
            };

          setOrderComplete(codOrder);

          localStorage.removeItem('fimiku_discount');

          await fetchCart();
        }

        return;
      }

      /*
       * ONLINE PAYMENT
       */
      const res = await api.post(
        '/payment/create-order/',
        orderPayload
      );

      const {
        razorpay_order_id,
        amount,
        currency,
        key_id,
        order_id,
        is_mock,
      } = res.data;

      /*
       * MOCK / TEST MODE
       */
      if (
        is_mock ||
        typeof window.Razorpay === 'undefined'
      ) {
        const verifyRes = await api.post('/payment/verify/', {
          razorpay_order_id,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: 'test_signature_mock',
        });

        if (verifyRes.data.status) {
          setOrderComplete(
            verifyRes.data.order || {
              id: order_id,
              total_amount: finalAmount,
              full_name: form.full_name,
              phone: form.phone,
              shipping_address: form.shipping_address,
              city: form.city,
              state: form.state,
              postal_code: form.postal_code,
              payment_method: getPaymentMethodName(),
              payment_status: 'PAID',
            }
          );

          localStorage.removeItem('fimiku_discount');

          await fetchCart();
        }

        return;
      }

      /*
       * RAZORPAY CHECKOUT
       *
       * Razorpay securely handles:
       * - UPI / GPay
       * - Cards
       * - Wallets
       * - Net Banking
       *
       * We do NOT collect raw card numbers/CVV ourselves.
       */
      const options: any = {
        key: key_id,
        amount: amount,
        currency: currency,
        name: 'Fimiku Baby Care',
        description: `Order #${order_id}`,
        order_id: razorpay_order_id,

        prefill: {
          name: form.full_name,
          email: form.email,
          contact: form.phone,
        },

        notes: {
          payment_method: paymentMethod,
          customer_name: form.full_name,
          customer_phone: form.phone,
        },

        theme: {
          color: '#8044F0',
        },

        handler: async function (response: any) {
          setLoading(true);

          try {
            const verifyRes = await api.post('/payment/verify/', {
              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature,
            });

            if (verifyRes.data.status) {
              setOrderComplete(
                verifyRes.data.order || {
                  id: order_id,
                  total_amount: finalAmount,
                  full_name: form.full_name,
                  phone: form.phone,
                  shipping_address: form.shipping_address,
                  city: form.city,
                  state: form.state,
                  postal_code: form.postal_code,
                  payment_method: getPaymentMethodName(),
                  payment_status: 'PAID',
                  razorpay_payment_id:
                    response.razorpay_payment_id,
                }
              );

              localStorage.removeItem(
                'fimiku_discount'
              );

              await fetchCart();
            } else {
              alert(
                'Payment was received but verification failed. Please contact customer care.'
              );
            }
          } catch (error) {
            console.error(
              'Payment verification error:',
              error
            );

            alert(
              'Payment verification failed. Please contact customer care.'
            );
          } finally {
            setLoading(false);
          }
        },

        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      /*
       * Tell Razorpay which payment method the customer selected.
       */
      if (paymentMethod === 'upi') {
        options.method = {
          upi: true,
          card: false,
          wallet: false,
          netbanking: false,
        };
      }

      if (paymentMethod === 'card') {
        options.method = {
          upi: false,
          card: true,
          wallet: false,
          netbanking: false,
        };
      }

      if (paymentMethod === 'wallet') {
        options.method = {
          upi: false,
          card: false,
          wallet: true,
          netbanking: false,
        };
      }

      if (paymentMethod === 'netbanking') {
        options.method = {
          upi: false,
          card: false,
          wallet: false,
          netbanking: true,
        };
      }

      const rzp = new window.Razorpay(options);

      rzp.on(
        'payment.failed',
        function (response: any) {
          console.error(
            'Razorpay payment failed:',
            response
          );

          setLoading(false);

          alert(
            response?.error?.description ||
              'Payment failed. Please try again.'
          );
        }
      );

      rzp.open();
    } catch (err: any) {
      console.error('Checkout error:', err);

      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Failed to create order. Please try again.';

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  /*
   * SUCCESS PAGE
   */
  if (orderComplete) {
    const itemsList =
      orderComplete.items ||
      cart.items.map((i) => ({
        product_name: i.product.name,
        quantity: i.quantity,
        price:
          i.product.final_price ||
          i.product.price,
        subtotal: i.subtotal,
        image_url: i.product.image_url,
      }));

    const isCOD =
      orderComplete.payment_method === 'COD' ||
      orderComplete.payment_method ===
        'Cash on Delivery' ||
      paymentMethod === 'cod';

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in bg-fimiku-softLavender">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-fimiku-lightBorder shadow-card space-y-6">

          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs uppercase tracking-widest text-fimiku-cta font-bold">
                {isCOD
                  ? 'Order Confirmed'
                  : 'Payment Verified & Confirmed'}
              </span>

              <h2 className="text-2xl sm:text-3xl font-bold text-fimiku-darkText mt-1">
                Thank You For Your Order!
              </h2>

              <p className="text-xs sm:text-sm text-fimiku-secondaryText max-w-lg mx-auto mt-1 leading-relaxed">
                Order{' '}
                <strong className="text-fimiku-darkText">
                  #FIMIKU-{orderComplete.id}
                </strong>{' '}
                has been successfully placed.
                We are preparing your safe silicone
                essentials for shipment.
              </p>
            </div>
          </div>

          {/* PAYMENT STATUS */}
          <div className="bg-fimiku-softLavender/50 rounded-2xl p-5 border border-fimiku-lightBorder">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] text-fimiku-secondaryText">
                  Payment Method
                </p>

                <p className="font-bold text-sm text-fimiku-darkText mt-1">
                  {isCOD
                    ? 'Cash on Delivery'
                    : getPaymentMethodName()}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[11px] text-fimiku-secondaryText">
                  Payment Status
                </p>

                <p className="font-bold text-sm text-emerald-600 mt-1">
                  {isCOD ? 'COD CONFIRMED' : 'PAID'}
                </p>
              </div>
            </div>
          </div>

          {/* ORDERED ITEMS */}
          <div className="bg-fimiku-softLavender/50 rounded-2xl p-5 border border-fimiku-lightBorder space-y-4">
            <h3 className="font-bold text-xs sm:text-sm text-fimiku-darkText">
              Ordered Items ({itemsList.length})
            </h3>

            <div className="divide-y divide-fimiku-lightBorder">
              {itemsList.map(
                (item: any, idx: number) => (
                  <div
                    key={idx}
                    className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      {item.image_url && (
                        <div className="w-12 h-12 rounded-xl bg-white overflow-hidden relative flex-shrink-0 border border-fimiku-lightBorder">
                          <img
                            src={item.image_url}
                            alt={item.product_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div>
                        <p className="font-bold text-xs text-fimiku-darkText">
                          {item.product_name}
                        </p>

                        <p className="text-[11px] text-fimiku-grayText">
                          Qty: {item.quantity} × ₹
                          {item.price}
                        </p>
                      </div>
                    </div>

                    <span className="font-bold text-xs text-fimiku-darkText">
                      ₹
                      {item.subtotal ||
                        Number(item.price) *
                          Number(item.quantity)}
                    </span>
                  </div>
                )
              )}
            </div>

            <div className="pt-3 border-t border-fimiku-lightBorder flex justify-between items-center text-xs">
              <span className="font-semibold text-fimiku-secondaryText">
                {isCOD
                  ? 'Amount Payable on Delivery'
                  : 'Total Paid'}
              </span>

              <span className="text-base font-bold text-fimiku-cta">
                ₹
                {orderComplete.total_amount ||
                  finalAmount}
              </span>
            </div>
          </div>

          {/* SHIPPING */}
          <div className="p-4 bg-white rounded-2xl text-xs text-fimiku-secondaryText space-y-1.5 border border-fimiku-lightBorder">
            <p className="font-bold text-fimiku-darkText mb-1">
              📦 Delivery Address
            </p>

            <p>
              <strong>Recipient:</strong>{' '}
              {orderComplete.full_name ||
                form.full_name}
            </p>

            <p>
              <strong>Address:</strong>{' '}
              {orderComplete.shipping_address ||
                form.shipping_address}
              , {orderComplete.city || form.city},{' '}
              {orderComplete.state || form.state} -{' '}
              {orderComplete.postal_code ||
                form.postal_code}
            </p>

            <p>
              <strong>Phone:</strong>{' '}
              {orderComplete.phone || form.phone}
            </p>
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

      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* HEADER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-bold text-fimiku-darkText">
          Secure Checkout
        </h1>

        <p className="text-xs text-fimiku-secondaryText mt-1">
          Provide delivery details and select your
          preferred payment method.
        </p>
      </div>

      <form
        onSubmit={initiatePayment}
        className="grid lg:grid-cols-3 gap-8 items-start"
      >

        {/* SHIPPING ADDRESS */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder space-y-6 shadow-sm">

          <h3 className="font-bold text-base sm:text-lg text-fimiku-darkText">
            1. Shipping Address
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">

            <div>
              <label className="text-xs font-semibold text-fimiku-darkText">
                Full Name *
              </label>

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
              <label className="text-xs font-semibold text-fimiku-darkText">
                Phone Number *
              </label>

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
            <label className="text-xs font-semibold text-fimiku-darkText">
              Email Address (For Order Updates) *
            </label>

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
            <label className="text-xs font-semibold text-fimiku-darkText">
              Street Address & Apartment *
            </label>

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
              <label className="text-xs font-semibold text-fimiku-darkText">
                City *
              </label>

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
              <label className="text-xs font-semibold text-fimiku-darkText">
                State *
              </label>

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
              <label className="text-xs font-semibold text-fimiku-darkText">
                PIN Code *
              </label>

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

          {/* PAYMENT METHOD */}
          <div className="pt-4 border-t border-fimiku-lightBorder">

            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-base sm:text-lg text-fimiku-darkText">
                  2. Payment Method
                </h3>

                <p className="text-[11px] text-fimiku-secondaryText mt-1">
                  Choose how you want to pay.
                </p>
              </div>

              <Lock className="w-5 h-5 text-fimiku-cta" />
            </div>

            <div className="space-y-3">

              {/* UPI */}
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-4 ${
                  paymentMethod === 'upi'
                    ? 'border-fimiku-cta bg-fimiku-veryLightLavender ring-2 ring-fimiku-cta/10'
                    : 'border-fimiku-lightBorder bg-white hover:bg-fimiku-softLavender'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-fimiku-softLavender flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-fimiku-cta" />
                </div>

                <div className="flex-1">
                  <p className="font-bold text-sm text-fimiku-darkText">
                    GPay / UPI
                  </p>

                  <p className="text-[11px] text-fimiku-secondaryText mt-0.5">
                    UPI, Google Pay and other UPI apps
                  </p>
                </div>

                <ChevronRight
                  className={`w-5 h-5 ${
                    paymentMethod === 'upi'
                      ? 'text-fimiku-cta'
                      : 'text-fimiku-grayText'
                  }`}
                />
              </button>

              {/* CARD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-4 ${
                  paymentMethod === 'card'
                    ? 'border-fimiku-cta bg-fimiku-veryLightLavender ring-2 ring-fimiku-cta/10'
                    : 'border-fimiku-lightBorder bg-white hover:bg-fimiku-softLavender'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-fimiku-softLavender flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-fimiku-cta" />
                </div>

                <div className="flex-1">
                  <p className="font-bold text-sm text-fimiku-darkText">
                    Credit / Debit Card
                  </p>

                  <p className="text-[11px] text-fimiku-secondaryText mt-0.5">
                    Visa, Mastercard, RuPay and more
                  </p>
                </div>

                <ChevronRight
                  className={`w-5 h-5 ${
                    paymentMethod === 'card'
                      ? 'text-fimiku-cta'
                      : 'text-fimiku-grayText'
                  }`}
                />
              </button>

              {/* WALLET */}
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-4 ${
                  paymentMethod === 'wallet'
                    ? 'border-fimiku-cta bg-fimiku-veryLightLavender ring-2 ring-fimiku-cta/10'
                    : 'border-fimiku-lightBorder bg-white hover:bg-fimiku-softLavender'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-fimiku-softLavender flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-fimiku-cta" />
                </div>

                <div className="flex-1">
                  <p className="font-bold text-sm text-fimiku-darkText">
                    Wallets
                  </p>

                  <p className="text-[11px] text-fimiku-secondaryText mt-0.5">
                    Pay using supported digital wallets
                  </p>
                </div>

                <ChevronRight
                  className={`w-5 h-5 ${
                    paymentMethod === 'wallet'
                      ? 'text-fimiku-cta'
                      : 'text-fimiku-grayText'
                  }`}
                />
              </button>

              {/* NET BANKING */}
              <button
                type="button"
                onClick={() =>
                  setPaymentMethod('netbanking')
                }
                className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-4 ${
                  paymentMethod === 'netbanking'
                    ? 'border-fimiku-cta bg-fimiku-veryLightLavender ring-2 ring-fimiku-cta/10'
                    : 'border-fimiku-lightBorder bg-white hover:bg-fimiku-softLavender'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-fimiku-softLavender flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-fimiku-cta" />
                </div>

                <div className="flex-1">
                  <p className="font-bold text-sm text-fimiku-darkText">
                    Net Banking
                  </p>

                  <p className="text-[11px] text-fimiku-secondaryText mt-0.5">
                    Pay directly through your bank
                  </p>
                </div>

                <ChevronRight
                  className={`w-5 h-5 ${
                    paymentMethod === 'netbanking'
                      ? 'text-fimiku-cta'
                      : 'text-fimiku-grayText'
                  }`}
                />
              </button>

              {/* COD */}
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-4 ${
                  paymentMethod === 'cod'
                    ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-500/10'
                    : 'border-fimiku-lightBorder bg-white hover:bg-fimiku-softLavender'
                }`}
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <Banknote className="w-5 h-5 text-emerald-600" />
                </div>

                <div className="flex-1">
                  <p className="font-bold text-sm text-fimiku-darkText">
                    Cash on Delivery
                  </p>

                  <p className="text-[11px] text-fimiku-secondaryText mt-0.5">
                    Pay when your order arrives
                  </p>
                </div>

                <ChevronRight
                  className={`w-5 h-5 ${
                    paymentMethod === 'cod'
                      ? 'text-emerald-600'
                      : 'text-fimiku-grayText'
                  }`}
                />
              </button>

            </div>

            {/* SELECTED PAYMENT INFO */}
            <div
              className={`mt-4 rounded-2xl p-4 text-xs ${
                paymentMethod === 'cod'
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-fimiku-veryLightLavender border border-fimiku-lightPurple/30'
              }`}
            >
              {paymentMethod === 'upi' && (
                <>
                  <p className="font-bold text-fimiku-darkText">
                    GPay / UPI selected
                  </p>

                  <p className="text-fimiku-secondaryText mt-1">
                    After clicking the payment button,
                    Razorpay will open a secure UPI
                    payment screen. You can use Google
                    Pay or another supported UPI app.
                  </p>
                </>
              )}

              {paymentMethod === 'card' && (
                <>
                  <p className="font-bold text-fimiku-darkText">
                    Card payment selected
                  </p>

                  <p className="text-fimiku-secondaryText mt-1">
                    Your card number, expiry date and CVV
                    will be entered securely inside
                    Razorpay Checkout.
                  </p>
                </>
              )}

              {paymentMethod === 'wallet' && (
                <>
                  <p className="font-bold text-fimiku-darkText">
                    Wallet selected
                  </p>

                  <p className="text-fimiku-secondaryText mt-1">
                    Razorpay will show the supported
                    wallet options available for your
                    payment.
                  </p>
                </>
              )}

              {paymentMethod === 'netbanking' && (
                <>
                  <p className="font-bold text-fimiku-darkText">
                    Net Banking selected
                  </p>

                  <p className="text-fimiku-secondaryText mt-1">
                    Select your bank securely inside
                    Razorpay Checkout.
                  </p>
                </>
              )}

              {paymentMethod === 'cod' && (
                <>
                  <p className="font-bold text-emerald-700">
                    Cash on Delivery selected
                  </p>

                  <p className="text-emerald-700/80 mt-1">
                    No online payment is required. Pay
                    the order amount when the package is
                    delivered.
                  </p>
                </>
              )}
            </div>

          </div>
        </div>

        {/* ORDER SUMMARY */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-fimiku-lightBorder shadow-card space-y-6 lg:sticky lg:top-6">

          <h3 className="font-bold text-base sm:text-lg text-fimiku-darkText">
            3. Order Summary
          </h3>

          <div className="divide-y divide-fimiku-lightBorder max-h-52 overflow-y-auto text-xs text-fimiku-secondaryText">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="py-2.5 flex justify-between items-center"
              >
                <span className="line-clamp-1 flex-1 pr-2">
                  {item.product.name} × {item.quantity}
                </span>

                <span className="font-semibold text-fimiku-darkText">
                  ₹{item.subtotal}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 pt-3 border-t border-fimiku-lightBorder text-xs text-fimiku-secondaryText">

            <div className="flex justify-between">
              <span>Subtotal</span>

              <span className="font-semibold text-fimiku-darkText">
                ₹{cart.total}
              </span>
            </div>

            {discountInfo && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>
                  Coupon ({discountInfo.code})
                </span>

                <span>
                  - ₹{discountInfo.discount_amount}
                </span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Shipping</span>

              <span className="text-fimiku-cta font-bold text-[10px] bg-fimiku-veryLightLavender px-2 py-0.5 rounded-full border border-fimiku-lightPurple/40">
                FREE
              </span>
            </div>

            <div className="flex justify-between">
              <span>Payment</span>

              <span className="font-semibold text-fimiku-darkText">
                {getPaymentMethodName()}
              </span>
            </div>

            <div className="flex justify-between font-bold text-base text-fimiku-darkText pt-2 border-t border-fimiku-lightBorder">
              <span>Total Payable</span>

              <span className="text-xl font-bold text-fimiku-cta">
                ₹{finalAmount}
              </span>
            </div>
          </div>

          {/* MAIN BUTTON */}
          <button
            type="submit"
            disabled={
              loading || cart.items.length === 0
            }
            className={`w-full py-4 text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2 ${
              paymentMethod === 'cod'
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-fimiku-cta hover:bg-fimiku-primary'
            }`}
          >
            {paymentMethod === 'cod' ? (
              <Banknote className="w-4 h-4" />
            ) : (
              <Lock className="w-4 h-4" />
            )}

            {loading
              ? 'Processing...'
              : paymentMethod === 'cod'
              ? `Place COD Order • ₹${finalAmount}`
              : `Pay ₹${finalAmount} Securely`}
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-fimiku-grayText">
            <ShieldCheck className="w-3.5 h-3.5 text-fimiku-cta" />
            Secure payment powered by Razorpay
          </div>

          <div className="text-center text-[10px] text-fimiku-grayText leading-relaxed">
            Your payment information is securely
            processed. Fimiku does not store your
            card number or CVV.
          </div>

        </div>
      </form>
    </div>
  );
}
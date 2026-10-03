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
  Loader2,
} from 'lucide-react';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

type PaymentMethod =
  | 'upi'
  | 'card'
  | 'wallet'
  | 'netbanking'
  | 'cod';

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

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('upi');

  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] =
    useState<any | null>(null);

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

    const savedDiscount =
      localStorage.getItem('fimiku_discount');

    if (savedDiscount) {
      try {
        setDiscountInfo(JSON.parse(savedDiscount));
      } catch {
        // Ignore invalid discount data
      }
    }
  }, [user]);

  const discountAmount =
    discountInfo?.discount_amount || 0;

  const finalAmount = Math.max(
    0,
    Number(cart.total || 0) - Number(discountAmount || 0)
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // -------------------------------------------------------
  // GET COMPLETE ORDER DETAILS
  // -------------------------------------------------------

  const getCompletedOrder = async (
    orderId: string,
    fallbackData: any = {}
  ) => {
    try {
      const orderResponse = await api.get(
        `/orders/${orderId}/`
      );

      if (orderResponse?.data) {
        return orderResponse.data;
      }
    } catch (error) {
      console.error(
        'Could not fetch completed order:',
        error
      );
    }

    return {
      ...fallbackData,
      id: orderId,
      total_amount:
        fallbackData.total_amount || finalAmount,
      full_name:
        fallbackData.full_name || form.full_name,
      email:
        fallbackData.email || form.email,
      phone:
        fallbackData.phone || form.phone,
      shipping_address:
        fallbackData.shipping_address ||
        form.shipping_address,
      city:
        fallbackData.city || form.city,
      state:
        fallbackData.state || form.state,
      postal_code:
        fallbackData.postal_code ||
        form.postal_code,
      items: fallbackData.items || [],
    };
  };

  // -------------------------------------------------------
  // COMPLETE ORDER
  // -------------------------------------------------------

  const completeOrder = async (
    orderId: string,
    fallbackData: any = {}
  ) => {
    const completeData =
      await getCompletedOrder(
        String(orderId),
        fallbackData
      );

    setOrderComplete(completeData);

    localStorage.removeItem(
      'fimiku_discount'
    );

    // Clear cart only AFTER we have fetched
    // the completed order details.
    try {
      await fetchCart();
    } catch (error) {
      console.error(
        'Cart refresh failed:',
        error
      );
    }
  };

  // -------------------------------------------------------
  // RAZORPAY PAYMENT
  // -------------------------------------------------------

  const startRazorpayPayment = async (
    orderData: any
  ) => {
    const {
      razorpay_order_id,
      amount,
      currency,
      key_id,
      order_id,
      is_mock,
    } = orderData;

    // ---------------------------------------------------
    // MOCK MODE
    // ---------------------------------------------------

    if (
      is_mock ||
      typeof (window as any).Razorpay ===
        'undefined'
    ) {
      try {
        const verifyRes = await api.post(
          '/payment/verify/',
          {
            razorpay_order_id:
              razorpay_order_id,
            razorpay_payment_id:
              `pay_test_${Date.now()}`,
            razorpay_signature:
              'test_signature_mock',
          }
        );

        if (
          verifyRes.data &&
          verifyRes.data.status
        ) {
          await completeOrder(
            verifyRes.data.order_id ||
              order_id,
            {
              ...verifyRes.data.order,
              total_amount:
                verifyRes.data.order
                  ?.total_amount ||
                finalAmount,
            }
          );
        }
      } catch (error: any) {
        console.error(
          'Mock payment verification error:',
          error
        );

        alert(
          error?.response?.data?.error ||
            'Payment verification failed.'
        );
      }

      return;
    }

    // ---------------------------------------------------
    // RAZORPAY METHOD CONFIGURATION
    // ---------------------------------------------------

    const methodConfig: any = {
      display: {
        sequence: [
          'block',
          'upi',
          'card',
          'wallet',
          'netbanking',
        ],
        preferences: {
          show_default_blocks: false,
        },
        blocks: {},
      },
    };

    if (paymentMethod === 'upi') {
      methodConfig.display.blocks.upi = {
        name: 'UPI / GPay',
        instruments: [
          {
            method: 'upi',
          },
        ],
      };
    }

    if (paymentMethod === 'card') {
      methodConfig.display.blocks.card = {
        name: 'Credit / Debit Card',
        instruments: [
          {
            method: 'card',
          },
        ],
      };
    }

    if (paymentMethod === 'wallet') {
      methodConfig.display.blocks.wallet = {
        name: 'Wallets',
        instruments: [
          {
            method: 'wallet',
          },
        ],
      };
    }

    if (paymentMethod === 'netbanking') {
      methodConfig.display.blocks.netbanking = {
        name: 'Net Banking',
        instruments: [
          {
            method: 'netbanking',
          },
        ],
      };
    }

    const options: any = {
      key: key_id,
      amount: amount,
      currency: currency,
      name: 'Fimiku Baby Care',
      description: `Order #${order_id}`,
      order_id: razorpay_order_id,

      config: methodConfig,

      prefill: {
        name: form.full_name,
        email: form.email,
        contact: form.phone,
      },

      notes: {
        order_id: String(order_id),
        payment_method: paymentMethod,
      },

      theme: {
        color: '#8044F0',
      },

      handler: async function (
        response: any
      ) {
        try {
          setLoading(true);

          const verifyRes =
            await api.post(
              '/payment/verify/',
              {
                razorpay_order_id:
                  response.razorpay_order_id,

                razorpay_payment_id:
                  response.razorpay_payment_id,

                razorpay_signature:
                  response.razorpay_signature,
              }
            );

          if (
            verifyRes.data &&
            verifyRes.data.status
          ) {
            await completeOrder(
              verifyRes.data.order_id ||
                order_id,
              {
                ...verifyRes.data.order,
                total_amount:
                  verifyRes.data.order
                    ?.total_amount ||
                  finalAmount,
              }
            );
          } else {
            alert(
              'Payment verification failed.'
            );
          }
        } catch (error: any) {
          console.error(
            'Payment verification error:',
            error
          );

          alert(
            error?.response?.data?.error ||
              'Payment verification failed. Please check with customer care.'
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

    try {
      const Razorpay =
        (window as any).Razorpay;

      const rzp =
        new Razorpay(options);

      rzp.on(
        'payment.failed',
        function (
          response: any
        ) {
          console.error(
            'Razorpay payment failed:',
            response
          );

          alert(
            response?.error?.description ||
              'Payment failed. Please try again.'
          );

          setLoading(false);
        }
      );

      rzp.open();
    } catch (error) {
      console.error(
        'Razorpay opening error:',
        error
      );

      alert(
        'Unable to open payment window. Please try again.'
      );

      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // PLACE ORDER
  // -------------------------------------------------------

  const initiatePayment = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (cart.items.length === 0) {
      showToast(
        '⚠️ Your shopping bag is empty.'
      );
      return;
    }

    setLoading(true);

    try {
      // -------------------------------------------------
      // BUILD ORDER ITEMS
      // -------------------------------------------------

      const orderItems =
        cart.items.map((item) => ({
          product_id:
            item.product.id,

          name:
            item.product.name,

          price: parseFloat(
            String(
              item.product.final_price ||
                item.product.price
            )
          ),

          quantity:
            item.quantity,
        }));

      const orderPayload = {
        ...form,

        discount_amount:
          discountAmount,

        items: orderItems,
      };

      // -------------------------------------------------
      // CASH ON DELIVERY
      // -------------------------------------------------

      if (paymentMethod === 'cod') {
        try {
          const codResponse =
            await api.post(
              '/payment/create-cod-order/',
              orderPayload
            );

          const codData =
            codResponse.data;

          if (
            codData &&
            (
              codData.order_id ||
              codData.id
            )
          ) {
            await completeOrder(
              codData.order_id ||
                codData.id,
              {
                ...codData,

                payment_method:
                  'Cash on Delivery',

                payment_status:
                  'COD',

                total_amount:
                  codData.total_amount ||
                  finalAmount,
              }
            );

            return;
          }

          alert(
            codData?.error ||
              'Could not create COD order.'
          );

          return;
        } catch (error: any) {
          console.error(
            'COD order error:',
            error
          );

          alert(
            error?.response?.data?.error ||
              'Could not create Cash on Delivery order.'
          );

          return;
        }
      }

      // -------------------------------------------------
      // ONLINE PAYMENT
      // -------------------------------------------------

      const res =
        await api.post(
          '/payment/create-order/',
          orderPayload
        );

      const paymentData =
        res.data;

      if (
        !paymentData ||
        !paymentData.razorpay_order_id
      ) {
        throw new Error(
          paymentData?.error ||
            'Invalid payment order response.'
        );
      }

      await startRazorpayPayment(
        paymentData
      );
    } catch (err: any) {
      console.error(
        'Checkout error:',
        err
      );

      const msg =
        err?.response?.data?.error ||
        err?.message ||
        'Failed to create order. Please try again.';

      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------
  // SUCCESS PAGE
  // -------------------------------------------------------

  if (orderComplete) {
    const itemsList =
      Array.isArray(
        orderComplete.items
      )
        ? orderComplete.items
        : [];

    const isCOD =
      orderComplete.payment_method ===
        'Cash on Delivery' ||
      orderComplete.payment_status ===
        'COD';

    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 animate-fade-in bg-fimiku-softLavender">

        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-fimiku-lightBorder shadow-card space-y-6">

          {/* SUCCESS HEADER */}

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
                  #FIMIKU-
                  {orderComplete.id}
                </strong>{' '}
                has been successfully placed.
                We are preparing your safe
                silicone essentials for shipment.
              </p>

            </div>
          </div>

          {/* PAYMENT METHOD */}

          <div className="p-4 bg-fimiku-softLavender/50 rounded-2xl border border-fimiku-lightBorder">

            <div className="flex items-center justify-between">

              <span className="text-xs font-semibold text-fimiku-secondaryText">
                Payment Method
              </span>

              <span className="text-xs font-bold text-fimiku-darkText">
                {isCOD
                  ? 'Cash on Delivery'
                  : 'Online Payment'}
              </span>

            </div>

            {isCOD && (
              <p className="text-xs text-fimiku-cta font-semibold mt-2">
                Amount to pay on delivery: ₹
                {Number(
                  orderComplete.total_amount ||
                    finalAmount
                ).toFixed(0)}
              </p>
            )}

          </div>

          {/* ORDERED ITEMS */}

          <div className="bg-fimiku-softLavender/50 rounded-2xl p-5 border border-fimiku-lightBorder space-y-4">

            <h3 className="font-bold text-xs sm:text-sm text-fimiku-darkText">
              Ordered Items ({itemsList.length})
            </h3>

            {itemsList.length === 0 ? (

              <div className="py-4 text-center text-xs text-fimiku-grayText">
                Order items could not be loaded.
                <br />
                Please check My Orders for the complete order.
              </div>

            ) : (

              <div className="divide-y divide-fimiku-lightBorder">

                {itemsList.map(
                  (
                    item: any,
                    idx: number
                  ) => (

                    <div
                      key={
                        item.id ||
                        idx
                      }
                      className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
                    >

                      <div className="flex items-center gap-3">

                        {item.image_url && (
                          <div className="w-12 h-12 rounded-xl bg-white overflow-hidden relative flex-shrink-0 border border-fimiku-lightBorder">

                            <img
                              src={
                                item.image_url
                              }
                              alt={
                                item.product_name ||
                                item.name ||
                                'Product'
                              }
                              className="w-full h-full object-cover"
                            />

                          </div>
                        )}

                        <div>

                          <p className="font-bold text-xs text-fimiku-darkText">
                            {item.product_name ||
                              item.name ||
                              'Product'}
                          </p>

                          <p className="text-[11px] text-fimiku-grayText">
                            Qty:{' '}
                            {item.quantity}{' '}
                            × ₹
                            {Number(
                              item.price || 0
                            ).toFixed(0)}
                          </p>

                        </div>

                      </div>

                      <span className="font-bold text-xs text-fimiku-darkText">
                        ₹
                        {Number(
                          item.subtotal ??
                            Number(
                              item.price ||
                                0
                            ) *
                              Number(
                                item.quantity ||
                                  0
                              )
                        ).toFixed(0)}
                      </span>

                    </div>

                  )
                )}

              </div>

            )}

            {/* TOTAL */}

            <div className="pt-3 border-t border-fimiku-lightBorder flex justify-between items-center text-xs">

              <span className="font-semibold text-fimiku-secondaryText">
                {isCOD
                  ? 'Total Amount'
                  : 'Total Paid'}
              </span>

              <span className="text-base font-bold text-fimiku-cta">
                ₹
                {Number(
                  orderComplete.total_amount ||
                    finalAmount
                ).toFixed(0)}
              </span>

            </div>

          </div>

          {/* SHIPPING DETAILS */}

          <div className="p-4 bg-white rounded-2xl text-xs text-fimiku-secondaryText space-y-1.5 border border-fimiku-lightBorder">

            <p className="font-bold text-fimiku-darkText mb-1">
              📦 Delivery Address
            </p>

            <p>
              <strong>
                Recipient:
              </strong>{' '}
              {orderComplete.full_name ||
                form.full_name}
            </p>

            <p>
              <strong>
                Address:
              </strong>{' '}
              {orderComplete.shipping_address ||
                form.shipping_address}
              ,{' '}
              {orderComplete.city ||
                form.city}
              ,{' '}
              {orderComplete.state ||
                form.state}{' '}
              -{' '}
              {orderComplete.postal_code ||
                form.postal_code}
            </p>

            <p>
              <strong>
                Phone:
              </strong>{' '}
              {orderComplete.phone ||
                form.phone}
            </p>

          </div>

          {/* BUTTONS */}

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">

            <Link
              href="/orders"
              className="px-8 py-3.5 bg-fimiku-cta hover:bg-fimiku-primary text-white text-xs sm:text-sm font-semibold rounded-full transition shadow-md flex items-center justify-center gap-2"
            >
              <span>
                View In My Orders
              </span>

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

  // -------------------------------------------------------
  // CHECKOUT PAGE
  // -------------------------------------------------------

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
          Provide delivery address and choose your payment method.
        </p>

      </div>

      <form
        onSubmit={initiatePayment}
        className="grid lg:grid-cols-3 gap-8 items-start"
      >

        {/* =================================================
            SHIPPING ADDRESS
        ================================================= */}

        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder space-y-6 shadow-sm">

          <h3 className="font-bold text-base sm:text-lg text-fimiku-darkText">
            1. Shipping Address
          </h3>

          <div className="grid sm:grid-cols-2 gap-4">

            {/* NAME */}

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

            {/* PHONE */}

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

          {/* EMAIL */}

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

          {/* ADDRESS */}

          <div>

            <label className="text-xs font-semibold text-fimiku-darkText">
              Street Address & Apartment *
            </label>

            <textarea
              required
              rows={3}
              name="shipping_address"
              value={
                form.shipping_address
              }
              onChange={handleChange}
              placeholder="House/Flat No, Landmark, Street name"
              className="w-full mt-1 p-3 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText resize-none"
            />

          </div>

          {/* CITY STATE PIN */}

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
                value={
                  form.postal_code
                }
                onChange={handleChange}
                placeholder="PIN"
                className="w-full mt-1 p-3 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-xl text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
              />

            </div>

          </div>

        </div>

        {/* =================================================
            ORDER SUMMARY
        ================================================= */}

        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-fimiku-lightBorder shadow-card space-y-6">

          <h3 className="font-bold text-base sm:text-lg text-fimiku-darkText">
            2. Order Summary
          </h3>

          {/* CART ITEMS */}

          <div className="divide-y divide-fimiku-lightBorder max-h-52 overflow-y-auto text-xs text-fimiku-secondaryText">

            {cart.items.map(
              (item) => (

                <div
                  key={item.id}
                  className="py-2.5 flex justify-between items-center"
                >

                  <span className="line-clamp-1 flex-1 pr-2">
                    {item.product.name} ×{' '}
                    {item.quantity}
                  </span>

                  <span className="font-semibold text-fimiku-darkText">
                    ₹
                    {item.subtotal}
                  </span>

                </div>

              )
            )}

          </div>

          {/* PRICE */}

          <div className="space-y-2.5 pt-3 border-t border-fimiku-lightBorder text-xs text-fimiku-secondaryText">

            <div className="flex justify-between">

              <span>
                Subtotal
              </span>

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
                  - ₹
                  {discountInfo.discount_amount}
                </span>

              </div>

            )}

            <div className="flex justify-between items-center">

              <span>
                Shipping
              </span>

              <span className="text-fimiku-cta font-bold text-[10px] bg-fimiku-veryLightLavender px-2 py-0.5 rounded-full border border-fimiku-lightPurple/40">
                FREE
              </span>

            </div>

            <div className="flex justify-between font-bold text-base text-fimiku-darkText pt-2 border-t border-fimiku-lightBorder">

              <span>
                Total Payable
              </span>

              <span className="text-xl font-bold text-fimiku-cta">
                ₹{finalAmount}
              </span>

            </div>

          </div>

          {/* =================================================
              PAYMENT METHODS
          ================================================= */}

          <div className="space-y-3">

            <h3 className="font-bold text-sm text-fimiku-darkText">
              3. Payment Method
            </h3>

            {/* UPI */}

            <button
              type="button"
              onClick={() =>
                setPaymentMethod('upi')
              }
              className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                paymentMethod === 'upi'
                  ? 'border-fimiku-cta bg-fimiku-veryLightLavender shadow-sm'
                  : 'border-fimiku-lightBorder bg-white hover:border-fimiku-primary'
              }`}
            >

              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-green-600" />
              </div>

              <div className="flex-1">

                <p className="font-bold text-xs text-fimiku-darkText">
                  GPay / UPI
                </p>

                <p className="text-[10px] text-fimiku-grayText">
                  Google Pay, PhonePe, Paytm & other UPI apps
                </p>

              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  paymentMethod === 'upi'
                    ? 'border-fimiku-cta bg-fimiku-cta'
                    : 'border-gray-300'
                }`}
              />

            </button>

            {/* CARD */}

            <button
              type="button"
              onClick={() =>
                setPaymentMethod('card')
              }
              className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                paymentMethod === 'card'
                  ? 'border-fimiku-cta bg-fimiku-veryLightLavender shadow-sm'
                  : 'border-fimiku-lightBorder bg-white hover:border-fimiku-primary'
              }`}
            >

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-blue-600" />
              </div>

              <div className="flex-1">

                <p className="font-bold text-xs text-fimiku-darkText">
                  Credit / Debit Card
                </p>

                <p className="text-[10px] text-fimiku-grayText">
                  Visa, Mastercard, RuPay & more
                </p>

              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  paymentMethod === 'card'
                    ? 'border-fimiku-cta bg-fimiku-cta'
                    : 'border-gray-300'
                }`}
              />

            </button>

            {/* WALLET */}

            <button
              type="button"
              onClick={() =>
                setPaymentMethod('wallet')
              }
              className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                paymentMethod === 'wallet'
                  ? 'border-fimiku-cta bg-fimiku-veryLightLavender shadow-sm'
                  : 'border-fimiku-lightBorder bg-white hover:border-fimiku-primary'
              }`}
            >

              <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-600" />
              </div>

              <div className="flex-1">

                <p className="font-bold text-xs text-fimiku-darkText">
                  Wallets
                </p>

                <p className="text-[10px] text-fimiku-grayText">
                  Paytm and supported wallets
                </p>

              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  paymentMethod === 'wallet'
                    ? 'border-fimiku-cta bg-fimiku-cta'
                    : 'border-gray-300'
                }`}
              />

            </button>

            {/* NET BANKING */}

            <button
              type="button"
              onClick={() =>
                setPaymentMethod(
                  'netbanking'
                )
              }
              className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                paymentMethod ===
                'netbanking'
                  ? 'border-fimiku-cta bg-fimiku-veryLightLavender shadow-sm'
                  : 'border-fimiku-lightBorder bg-white hover:border-fimiku-primary'
              }`}
            >

              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-orange-600" />
              </div>

              <div className="flex-1">

                <p className="font-bold text-xs text-fimiku-darkText">
                  Net Banking
                </p>

                <p className="text-[10px] text-fimiku-grayText">
                  Pay securely through your bank
                </p>

              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  paymentMethod ===
                  'netbanking'
                    ? 'border-fimiku-cta bg-fimiku-cta'
                    : 'border-gray-300'
                }`}
              />

            </button>

            {/* COD */}

            <button
              type="button"
              onClick={() =>
                setPaymentMethod('cod')
              }
              className={`w-full p-4 rounded-2xl border text-left transition flex items-center gap-3 ${
                paymentMethod === 'cod'
                  ? 'border-fimiku-cta bg-fimiku-veryLightLavender shadow-sm'
                  : 'border-fimiku-lightBorder bg-white hover:border-fimiku-primary'
              }`}
            >

              <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                <Banknote className="w-5 h-5 text-yellow-600" />
              </div>

              <div className="flex-1">

                <p className="font-bold text-xs text-fimiku-darkText">
                  Cash on Delivery
                </p>

                <p className="text-[10px] text-fimiku-grayText">
                  Pay when your order arrives
                </p>

              </div>

              <div
                className={`w-4 h-4 rounded-full border-2 ${
                  paymentMethod === 'cod'
                    ? 'border-fimiku-cta bg-fimiku-cta'
                    : 'border-gray-300'
                }`}
              />

            </button>

          </div>

          {/* SELECTED PAYMENT MESSAGE */}

          <div className="p-3 rounded-xl bg-fimiku-softLavender border border-fimiku-lightBorder">

            <p className="text-[11px] text-fimiku-secondaryText">

              Selected:{' '}

              <span className="font-bold text-fimiku-darkText">

                {paymentMethod ===
                  'upi' &&
                  'GPay / UPI'}

                {paymentMethod ===
                  'card' &&
                  'Credit / Debit Card'}

                {paymentMethod ===
                  'wallet' &&
                  'Wallets'}

                {paymentMethod ===
                  'netbanking' &&
                  'Net Banking'}

                {paymentMethod ===
                  'cod' &&
                  'Cash on Delivery'}

              </span>

            </p>

          </div>

          {/* PLACE ORDER */}

          <button
            type="submit"
            disabled={
              loading ||
              cart.items.length === 0
            }
            className="w-full py-3.5 bg-fimiku-cta hover:bg-fimiku-primary text-white font-semibold text-xs sm:text-sm rounded-full transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
          >

            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />

                Processing...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-white" />

                {paymentMethod ===
                'cod'
                  ? `Place COD Order • ₹${finalAmount}`
                  : `Pay ₹${finalAmount} & Complete Order`}
              </>
            )}

          </button>

          {/* SECURITY */}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-fimiku-grayText">

            <ShieldCheck className="w-3.5 h-3.5 text-fimiku-cta" />

            Safe & Secure Checkout

          </div>

        </div>

      </form>

    </div>
  );
}
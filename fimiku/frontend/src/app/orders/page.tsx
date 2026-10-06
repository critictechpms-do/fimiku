'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Search,
  ArrowRight,
  ShieldCheck,
  ShoppingBag,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface OrderItem {
  id: number | string;
  product?: number | string;
  product_name: string;
  price: string | number;
  quantity: number;
  subtotal: string | number;
  image_url?: string;
  product_slug?: string;
}

interface Order {
  id: number | string;
  full_name: string;
  email: string;
  phone: string;
  shipping_address: string;
  city: string;
  state: string;
  postal_code: string;
  total_amount: string | number;
  discount_amount: string | number;
  payment_status: string;
  order_status: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  items: OrderItem[];
  created_at: string;
}

export default function OrdersPage() {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
  } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [emailSearched, setEmailSearched] = useState(false);

  // =========================================================
  // FETCH ORDERS
  // =========================================================

  const fetchOrders = async (emailOverride?: string) => {
    setLoading(true);

    try {
      let url = '/orders/';

      const emailToUse =
        emailOverride?.trim() ||
        (isAuthenticated && user?.email
          ? user.email.trim()
          : searchEmail.trim());

      if (emailToUse) {
        url += `?email=${encodeURIComponent(emailToUse)}`;
      }

      console.log('[Orders] Fetching:', url);

      const response = await api.get(url);

      /*
       * Backend may return:
       *
       * [
       *   {...}
       * ]
       *
       * OR:
       *
       * {
       *   results: [...]
       * }
       */

      const data =
        response.data?.results ??
        response.data ??
        [];

      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        setOrders([]);
      }

      console.log('[Orders] Loaded:', data);
    } catch (error: any) {
      console.error('[Orders] Failed to load orders:', error);

      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD AUTHENTICATED USER ORDERS
  // =========================================================

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (isAuthenticated && user?.email) {
      fetchOrders(user.email);
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, user?.email]);

  // =========================================================
  // GUEST EMAIL SEARCH
  // =========================================================

  const handleGuestSearch = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const email = searchEmail.trim();

    if (!email) {
      return;
    }

    setEmailSearched(true);

    fetchOrders(email);
  };

  // =========================================================
  // STATUS BADGE
  // =========================================================

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Delivered
          </span>
        );

      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
            <Truck className="w-3.5 h-3.5" />
            Out for Delivery
          </span>
        );

      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            Packaging & Quality Check
          </span>
        );

      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" />
            Cancelled
          </span>
        );

      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-fimiku-veryLightLavender text-fimiku-cta text-xs font-bold rounded-full border border-fimiku-lightPurple/40">
            <Clock className="w-3.5 h-3.5" />
            Order Placed
          </span>
        );
    }
  };

  // =========================================================
  // FORMAT MONEY
  // =========================================================

  const formatMoney = (value: string | number | undefined) => {
    const amount = Number(value ?? 0);

    if (Number.isNaN(amount)) {
      return '0.00';
    }

    return amount.toFixed(2);
  };

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formatDate = (dateString: string) => {
    if (!dateString) {
      return '-';
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // =========================================================
  // TOTAL QUANTITY
  // =========================================================

  const getTotalQuantity = (items: OrderItem[] = []) => {
    return items.reduce(
      (total, item) => total + Number(item.quantity || 0),
      0
    );
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-fimiku-softLavender py-8">
      <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 space-y-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div>
          <div className="flex items-center gap-2 text-xs text-fimiku-grayText mb-3">
            <Link
              href="/"
              className="hover:text-fimiku-primary transition"
            >
              Home
            </Link>

            <span>/</span>

            <span className="text-fimiku-darkText font-medium">
              My Orders
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-fimiku-lightBorder shadow-card">

            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-2xl bg-fimiku-veryLightLavender flex items-center justify-center border border-fimiku-lightPurple/40">
                <Package className="w-7 h-7 text-fimiku-cta" />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-fimiku-darkText tracking-tight">
                  Your Orders & Shipments
                </h1>

                <p className="text-xs sm:text-sm text-fimiku-secondaryText mt-0.5">
                  Track delivery progress, view purchased quantities,
                  and see your complete order history
                </p>
              </div>

            </div>

            {isAuthenticated && (
              <button
                onClick={() => fetchOrders(user?.email)}
                disabled={loading}
                className="px-4 py-2 bg-fimiku-veryLightLavender hover:bg-fimiku-lavenderCard text-fimiku-cta text-xs font-semibold rounded-full border border-fimiku-lightPurple/30 transition flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    loading ? 'animate-spin' : ''
                  }`}
                />

                <span>Refresh Orders</span>
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            GUEST EMAIL SEARCH
        ====================================================== */}

        {!isAuthenticated && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder shadow-sm space-y-4">

            <div className="max-w-xl">

              <h2 className="text-base sm:text-lg font-bold text-fimiku-darkText">
                Track Orders by Email Address
              </h2>

              <p className="text-xs text-fimiku-secondaryText mt-1">
                Placed an order as a guest? Enter the same email
                address used during checkout to see your purchases.
              </p>

            </div>

            <form
              onSubmit={handleGuestSearch}
              className="flex flex-col sm:flex-row gap-3 max-w-xl"
            >

              <div className="relative flex-1">

                <Search className="w-4 h-4 text-fimiku-grayText absolute left-3.5 top-3.5" />

                <input
                  type="email"
                  required
                  value={searchEmail}
                  onChange={(event) =>
                    setSearchEmail(event.target.value)
                  }
                  placeholder="Enter order email address"
                  className="w-full pl-10 pr-4 py-3 bg-fimiku-softLavender border border-fimiku-lightBorder rounded-2xl text-xs focus:outline-none focus:border-fimiku-primary text-fimiku-darkText"
                />

              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-fimiku-cta hover:bg-fimiku-primary text-white text-xs font-semibold rounded-2xl transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <span>Find Orders</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          </div>
        )}

        {/* =====================================================
            LOADING
        ====================================================== */}

        {loading ? (
          <div className="space-y-6">

            {[1, 2].map((item) => (
              <div
                key={item}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder animate-pulse space-y-4"
              >
                <div className="h-6 bg-fimiku-veryLightLavender rounded w-1/4" />

                <div className="h-20 bg-fimiku-veryLightLavender rounded-2xl" />

                <div className="h-4 bg-fimiku-veryLightLavender rounded w-1/2" />
              </div>
            ))}

          </div>
        ) : orders.length === 0 ? (

          /* ===================================================
             EMPTY STATE
          ==================================================== */

          <div className="bg-white rounded-3xl border border-fimiku-lightBorder p-12 text-center max-w-2xl mx-auto shadow-card space-y-6">

            <div className="w-20 h-20 bg-fimiku-veryLightLavender rounded-full flex items-center justify-center mx-auto text-fimiku-cta border border-fimiku-lightPurple/30">
              <ShoppingBag className="w-10 h-10 text-fimiku-cta" />
            </div>

            <div className="space-y-2">

              <h2 className="text-xl sm:text-2xl font-bold text-fimiku-darkText">
                {emailSearched
                  ? 'No orders found for this email'
                  : 'No orders found'}
              </h2>

              <p className="text-xs sm:text-sm text-fimiku-secondaryText max-w-md mx-auto leading-relaxed">
                {emailSearched
                  ? 'Please verify the email address used during checkout.'
                  : "You haven't placed any orders with Fimiku yet. Explore our gentle food-grade silicone collection."}
              </p>

            </div>

            <div className="pt-2">

              <Link
                href="/shop"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-fimiku-cta hover:bg-fimiku-primary text-white text-xs sm:text-sm font-semibold rounded-full transition shadow-md"
              >
                <span>Explore All Toys</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

            </div>

          </div>

        ) : (

          /* ===================================================
             ORDERS
          ==================================================== */

          <div className="space-y-6">

            {orders.map((order) => {

              const items = Array.isArray(order.items)
                ? order.items
                : [];

              const totalQuantity = getTotalQuantity(items);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-fimiku-lightBorder shadow-card overflow-hidden transition hover:border-fimiku-lightPurple/50"
                >

                  {/* =================================================
                      ORDER HEADER
                  ================================================== */}

                  <div className="p-6 bg-fimiku-softLavender/60 border-b border-fimiku-lightBorder">

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                      <div className="flex flex-wrap items-center gap-4 sm:gap-6">

                        {/* ORDER ID */}

                        <div>
                          <span className="text-fimiku-grayText text-[11px] block">
                            Order Reference
                          </span>

                          <span className="font-bold text-fimiku-darkText text-sm sm:text-base">
                            #FIMIKU-{order.id}
                          </span>
                        </div>

                        {/* DATE */}

                        <div>
                          <span className="text-fimiku-grayText text-[11px] block">
                            Date Placed
                          </span>

                          <span className="font-semibold text-fimiku-darkText text-xs sm:text-sm">
                            {formatDate(order.created_at)}
                          </span>
                        </div>

                        {/* TOTAL ITEMS */}

                        <div>
                          <span className="text-fimiku-grayText text-[11px] block">
                            Products
                          </span>

                          <span className="font-bold text-fimiku-darkText text-sm">
                            {items.length}
                          </span>
                        </div>

                        {/* TOTAL QUANTITY */}

                        <div>
                          <span className="text-fimiku-grayText text-[11px] block">
                            Total Quantity
                          </span>

                          <span className="font-bold text-fimiku-cta text-sm">
                            {totalQuantity} item
                            {totalQuantity !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {/* TOTAL AMOUNT */}

                        <div>
                          <span className="text-fimiku-grayText text-[11px] block">
                            Total Amount
                          </span>

                          <span className="font-bold text-fimiku-cta text-sm">
                            ₹{formatMoney(order.total_amount)}
                          </span>
                        </div>

                      </div>

                      {/* STATUS */}

                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.order_status)}
                      </div>

                    </div>
                  </div>

                  {/* =================================================
                      ORDER ITEMS
                  ================================================== */}

                  <div className="p-6 sm:p-8 space-y-6">

                    <div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">

                        <h3 className="font-bold text-sm text-fimiku-darkText">
                          Items in this order
                        </h3>

                        <span className="text-xs font-semibold text-fimiku-cta">
                          {totalQuantity} total item
                          {totalQuantity !== 1 ? 's' : ''}
                        </span>

                      </div>

                      <div className="divide-y divide-fimiku-lightBorder/80">

                        {items.map((item) => (

                          <div
                            key={item.id}
                            className="py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
                          >

                            {/* PRODUCT */}

                            <div className="flex items-center gap-4 min-w-0">

                              {/* IMAGE */}

                              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-fimiku-veryLightLavender rounded-2xl overflow-hidden flex-shrink-0 border border-fimiku-lightBorder">

                                {item.image_url ? (
                                  <img
                                    src={item.image_url}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-8 h-8 text-fimiku-cta/40" />
                                  </div>
                                )}

                              </div>

                              {/* PRODUCT DETAILS */}

                              <div className="space-y-1.5 min-w-0">

                                <h4 className="font-bold text-xs sm:text-sm text-fimiku-darkText">
                                  {item.product_name}
                                </h4>

                                {/* QUANTITY */}

                                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-fimiku-veryLightLavender rounded-lg">
                                  <span className="text-[11px] text-fimiku-secondaryText">
                                    Quantity
                                  </span>

                                  <span className="font-bold text-xs text-fimiku-cta">
                                    × {item.quantity}
                                  </span>
                                </div>

                                {/* PRICE */}

                                <p className="text-xs font-semibold text-fimiku-darkText">
                                  ₹{formatMoney(item.price)} each
                                </p>

                              </div>

                            </div>

                            {/* SUBTOTAL */}

                            <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between gap-2">

                              <div>

                                <span className="text-[10px] text-fimiku-grayText block">
                                  Item Subtotal
                                </span>

                                <span className="font-bold text-base text-fimiku-darkText">
                                  ₹{formatMoney(item.subtotal)}
                                </span>

                              </div>

                              {item.product && (
                                <Link
                                  href={`/product/${item.product}`}
                                  className="text-[11px] font-semibold text-fimiku-cta hover:underline"
                                >
                                  View Product
                                </Link>
                              )}

                            </div>

                          </div>

                        ))}

                      </div>
                    </div>

                    {/* =================================================
                        ORDER SUMMARY
                    ================================================== */}

                    <div className="border-t border-fimiku-lightBorder pt-5">

                      <div className="ml-auto max-w-sm space-y-2">

                        <div className="flex justify-between text-xs text-fimiku-secondaryText">
                          <span>Total products</span>
                          <span>{items.length}</span>
                        </div>

                        <div className="flex justify-between text-xs text-fimiku-secondaryText">
                          <span>Total quantity</span>
                          <span>{totalQuantity}</span>
                        </div>

                        {Number(order.discount_amount || 0) > 0 && (
                          <div className="flex justify-between text-xs text-emerald-600">
                            <span>Discount</span>
                            <span>
                              -₹{formatMoney(order.discount_amount)}
                            </span>
                          </div>
                        )}

                        <div className="flex justify-between items-center border-t border-fimiku-lightBorder pt-3">

                          <span className="font-bold text-sm text-fimiku-darkText">
                            Order Total
                          </span>

                          <span className="font-bold text-lg text-fimiku-cta">
                            ₹{formatMoney(order.total_amount)}
                          </span>

                        </div>

                      </div>

                    </div>

                    {/* =================================================
                        DELIVERY + PAYMENT
                    ================================================== */}

                    <div className="pt-6 border-t border-fimiku-lightBorder grid sm:grid-cols-2 gap-6 text-xs bg-fimiku-softLavender/40 p-4 rounded-2xl">

                      {/* DELIVERY */}

                      <div className="space-y-1.5">

                        <div className="flex items-center gap-1.5 font-bold text-fimiku-darkText">

                          <MapPin className="w-3.5 h-3.5 text-fimiku-cta" />

                          <span>
                            Delivery Address
                          </span>

                        </div>

                        <p className="text-fimiku-secondaryText leading-relaxed">

                          <strong>
                            {order.full_name}
                          </strong>

                          <br />

                          {order.shipping_address}

                          <br />

                          {order.city}, {order.state} - {order.postal_code}

                          <br />

                          Phone: {order.phone}

                        </p>

                      </div>

                      {/* PAYMENT */}

                      <div className="space-y-1.5">

                        <div className="flex items-center gap-1.5 font-bold text-fimiku-darkText">

                          <ShieldCheck className="w-3.5 h-3.5 text-fimiku-cta" />

                          <span>
                            Payment & Security
                          </span>

                        </div>

                        <p className="text-fimiku-secondaryText leading-relaxed">

                          Status:{' '}

                          <strong className="text-emerald-600">
                            {order.payment_status}
                          </strong>

                          <br />

                          Payment Ref:{' '}

                          <span className="font-mono text-[10px]">
                            {order.razorpay_payment_id ||
                              order.razorpay_order_id ||
                              'COD'}
                          </span>

                          <br />

                          Express Delivery: Free Across India

                        </p>

                      </div>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
}
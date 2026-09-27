'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle2, Clock, MapPin, Search, ArrowRight, ShieldCheck, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';

interface OrderItem {
  id: number;
  product?: number;
  product_name: string;
  price: string | number;
  quantity: number;
  subtotal: number;
  image_url?: string;
  product_slug?: string;
}

interface Order {
  id: number;
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
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [emailSearched, setEmailSearched] = useState(false);

  const fetchOrders = async (emailOverride?: string) => {
    setLoading(true);
    try {
      let url = '/orders/';
      if (emailOverride) {
        url += `?email=${encodeURIComponent(emailOverride)}`;
      } else if (!isAuthenticated && searchEmail.trim()) {
        url += `?email=${encodeURIComponent(searchEmail.trim())}`;
      }
      const res = await api.get(url);
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        fetchOrders();
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated, authLoading]);

  const handleGuestSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    setEmailSearched(true);
    fetchOrders(searchEmail.trim());
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'SHIPPED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </span>
        );
      case 'PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Packaging & Quality Check
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-200">
            <AlertCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-fimiku-veryLightLavender text-fimiku-cta text-xs font-bold rounded-full border border-fimiku-lightPurple/40">
            <Clock className="w-3.5 h-3.5" /> Order Placed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-fimiku-softLavender py-8">
      <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 space-y-8">
        
        {/* Breadcrumb & Header */}
        <div>
          <div className="flex items-center gap-2 text-xs text-fimiku-grayText mb-3">
            <Link href="/" className="hover:text-fimiku-primary transition">Home</Link>
            <span>/</span>
            <span className="text-fimiku-darkText font-medium">My Orders</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 sm:p-8 rounded-3xl border border-fimiku-lightBorder shadow-card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-fimiku-veryLightLavender flex items-center justify-center border border-fimiku-lightPurple/40 text-fimiku-cta">
                <Package className="w-7 h-7 text-fimiku-cta" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-fimiku-darkText tracking-tight">
                  Your Orders & Shipments
                </h1>
                <p className="text-xs sm:text-sm text-fimiku-secondaryText mt-0.5">
                  Track delivery progress, download receipts, and view ordered items
                </p>
              </div>
            </div>

            {isAuthenticated && (
              <button
                onClick={() => fetchOrders()}
                className="px-4 py-2 bg-fimiku-veryLightLavender hover:bg-fimiku-lavenderCard text-fimiku-cta text-xs font-semibold rounded-full border border-fimiku-lightPurple/30 transition flex items-center gap-1.5 self-start sm:self-auto"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Refresh Orders</span>
              </button>
            )}
          </div>
        </div>

        {/* Guest Email Lookup Box if unauthenticated */}
        {!isAuthenticated && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder shadow-sm space-y-4">
            <div className="max-w-xl">
              <h2 className="text-base sm:text-lg font-bold text-fimiku-darkText">
                Track Orders by Email Address
              </h2>
              <p className="text-xs text-fimiku-secondaryText mt-1">
                Placed an order as guest? Enter your checkout email to see all your items and delivery tracking.
              </p>
            </div>
            
            <form onSubmit={handleGuestSearch} className="flex flex-col sm:flex-row gap-3 max-w-xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-fimiku-grayText absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
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

        {/* Orders List Section */}
        {loading ? (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-6 sm:p-8 border border-fimiku-lightBorder animate-pulse space-y-4">
                <div className="h-6 bg-fimiku-veryLightLavender rounded w-1/4"></div>
                <div className="h-20 bg-fimiku-veryLightLavender rounded-2xl"></div>
                <div className="h-4 bg-fimiku-veryLightLavender rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-fimiku-lightBorder p-12 text-center max-w-2xl mx-auto shadow-card space-y-6">
            <div className="w-20 h-20 bg-fimiku-veryLightLavender rounded-full flex items-center justify-center mx-auto text-fimiku-cta border border-fimiku-lightPurple/30">
              <ShoppingBag className="w-10 h-10 text-fimiku-cta" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-fimiku-darkText">
                {emailSearched ? 'No orders found for this email' : 'No orders found'}
              </h2>
              <p className="text-xs sm:text-sm text-fimiku-secondaryText max-w-md mx-auto leading-relaxed">
                {emailSearched
                  ? 'Please verify the email address used during checkout, or sign in to your parent account.'
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
          /* Orders Cards */
          <div className="space-y-6">
            {orders.map((order) => {
              const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-fimiku-lightBorder shadow-card overflow-hidden transition hover:border-fimiku-lightPurple/50"
                >
                  {/* Order Top Meta Bar */}
                  <div className="p-6 bg-fimiku-softLavender/60 border-b border-fimiku-lightBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
                      <div>
                        <span className="text-fimiku-grayText text-[11px] block">Order Reference</span>
                        <span className="font-bold text-fimiku-darkText text-sm sm:text-base">
                          #FIMIKU-{order.id}
                        </span>
                      </div>
                      <div>
                        <span className="text-fimiku-grayText text-[11px] block">Date Placed</span>
                        <span className="font-semibold text-fimiku-darkText">{orderDate}</span>
                      </div>
                      <div>
                        <span className="text-fimiku-grayText text-[11px] block">Total Amount</span>
                        <span className="font-bold text-fimiku-cta text-sm">₹{order.total_amount}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(order.order_status)}
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="p-6 sm:p-8 space-y-6">
                    <div>
                      <h3 className="font-bold text-sm text-fimiku-darkText mb-4">
                        Items in this shipment ({order.items?.length || 0})
                      </h3>

                      <div className="divide-y divide-fimiku-lightBorder/80">
                        {order.items?.map((item) => (
                          <div key={item.id} className="py-4 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-fimiku-veryLightLavender rounded-2xl overflow-hidden relative flex-shrink-0 border border-fimiku-lightBorder">
                                <Image
                                  src={item.image_url || '/placeholder.png'}
                                  alt={item.product_name}
                                  fill
                                  sizes="80px"
                                  className="object-cover"
                                />
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-bold text-xs sm:text-sm text-fimiku-darkText">
                                  {item.product_name}
                                </h4>
                                <p className="text-[11px] text-fimiku-secondaryText">
                                  Quantity: <span className="font-semibold text-fimiku-darkText">{item.quantity}</span>
                                </p>
                                <p className="text-xs font-semibold text-fimiku-darkText">
                                  ₹{item.price} each
                                </p>
                              </div>
                            </div>

                            <div className="text-right flex flex-col items-end gap-2">
                              <span className="font-bold text-sm text-fimiku-darkText">
                                ₹{item.subtotal}
                              </span>
                              {item.product && (
                                <Link
                                  href={`/product/${item.product}`}
                                  className="text-[11px] font-semibold text-fimiku-cta hover:underline"
                                >
                                  View Toy
                                </Link>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery Information Accordion */}
                    <div className="pt-6 border-t border-fimiku-lightBorder grid sm:grid-cols-2 gap-6 text-xs bg-fimiku-softLavender/40 p-4 rounded-2xl">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-fimiku-darkText">
                          <MapPin className="w-3.5 h-3.5 text-fimiku-cta" />
                          <span>Delivery Address</span>
                        </div>
                        <p className="text-fimiku-secondaryText leading-relaxed">
                          <strong>{order.full_name}</strong><br />
                          {order.shipping_address}<br />
                          {order.city}, {order.state} - {order.postal_code}<br />
                          Phone: {order.phone}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 font-bold text-fimiku-darkText">
                          <ShieldCheck className="w-3.5 h-3.5 text-fimiku-cta" />
                          <span>Payment & Security</span>
                        </div>
                        <p className="text-fimiku-secondaryText leading-relaxed">
                          Status: <strong className="text-emerald-600">{order.payment_status}</strong><br />
                          Payment Ref: <span className="font-mono text-[10px]">{order.razorpay_payment_id || 'Prepaid Online'}</span><br />
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

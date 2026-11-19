"use client";

import { useEffect, useState } from "react";
import adminApi from "@/lib/axiosAdmin";
import {
  Package,
  ShoppingCart,
  IndianRupee,
  AlertTriangle,
  RefreshCw,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  Layers,
} from "lucide-react";

interface DashboardStats {
  revenue: {
    total: number;
  };

  orders: {
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };

  inventory: {
    total_products: number;
    total_categories: number;
    low_stock: number;
  };
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch dashboard statistics
  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get("/dashboard/stats/");

      setStats(response.data);
    } catch (err: any) {
      console.error("Dashboard API error:", err);

      setError(
        err.response?.data?.detail ||
          err.response?.data?.message ||
          "Unable to load dashboard statistics. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // Load statistics when page opens
  useEffect(() => {
    fetchStats();
  }, []);

  // Format Indian currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  // Dashboard statistic cards
  const statCards = stats
    ? [
        {
          title: "Total Revenue",
          value: formatCurrency(stats.revenue.total),
          icon: IndianRupee,
          color: "text-green-600",
          bg: "bg-green-100",
        },
        {
          title: "Total Orders",
          value: stats.orders.total,
          icon: ShoppingCart,
          color: "text-purple-600",
          bg: "bg-purple-100",
        },
        {
          title: "Total Products",
          value: stats.inventory.total_products,
          icon: Package,
          color: "text-blue-600",
          bg: "bg-blue-100",
        },
        {
          title: "Low Stock Products",
          value: stats.inventory.low_stock,
          icon: AlertTriangle,
          color: "text-orange-600",
          bg: "bg-orange-100",
        },
      ]
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>

            <p className="mt-1 text-gray-500">
              Welcome to the Fimiku administration panel.
            </p>
          </div>

          <button
            onClick={fetchStats}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <div className="flex items-center gap-2">
              <AlertTriangle size={20} />

              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !stats ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-purple-600"
              />

              <p className="mt-4 text-gray-500">
                Loading dashboard statistics...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">
                          {card.title}
                        </p>

                        <h2 className="mt-2 text-2xl font-bold text-gray-900">
                          {card.value}
                        </h2>
                      </div>

                      <div
                        className={`rounded-lg p-3 ${card.bg}`}
                      >
                        <Icon
                          size={24}
                          className={card.color}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dashboard Sections */}
            {stats && (
              <>
                <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">

                  {/* Order Status */}
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold text-gray-900">
                      Order Status
                    </h2>

                    <div className="space-y-4">
                      {[
                        {
                          label: "Pending",
                          value: stats.orders.pending,
                          icon: Clock,
                          color: "text-yellow-600",
                        },
                        {
                          label: "Processing",
                          value: stats.orders.processing,
                          icon: Package,
                          color: "text-blue-600",
                        },
                        {
                          label: "Shipped",
                          value: stats.orders.shipped,
                          icon: Truck,
                          color: "text-purple-600",
                        },
                        {
                          label: "Delivered",
                          value: stats.orders.delivered,
                          icon: CheckCircle,
                          color: "text-green-600",
                        },
                        {
                          label: "Cancelled",
                          value: stats.orders.cancelled,
                          icon: XCircle,
                          color: "text-red-600",
                        },
                      ].map((item) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.label}
                            className="flex items-center justify-between rounded-lg bg-gray-50 p-3"
                          >
                            <div className="flex items-center gap-3">
                              <Icon
                                size={20}
                                className={item.color}
                              />

                              <span className="text-gray-700">
                                {item.label}
                              </span>
                            </div>

                            <span className="font-semibold text-gray-900">
                              {item.value}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Inventory Overview */}
                  <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-5 text-xl font-semibold text-gray-900">
                      Inventory Overview
                    </h2>

                    <div className="space-y-4">

                      {/* Products */}
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <Package
                            size={20}
                            className="text-blue-600"
                          />

                          <span className="text-gray-700">
                            Total Products
                          </span>
                        </div>

                        <span className="text-xl font-bold text-gray-900">
                          {stats.inventory.total_products}
                        </span>
                      </div>

                      {/* Categories */}
                      <div className="flex items-center justify-between rounded-lg bg-gray-50 p-4">
                        <div className="flex items-center gap-3">
                          <Layers
                            size={20}
                            className="text-purple-600"
                          />

                          <span className="text-gray-700">
                            Categories
                          </span>
                        </div>

                        <span className="text-xl font-bold text-gray-900">
                          {stats.inventory.total_categories}
                        </span>
                      </div>

                      {/* Low Stock */}
                      <div className="flex items-center justify-between rounded-lg bg-orange-50 p-4">
                        <div className="flex items-center gap-3">
                          <AlertTriangle
                            size={20}
                            className="text-orange-600"
                          />

                          <span className="text-gray-700">
                            Low Stock Products
                          </span>
                        </div>

                        <span className="text-xl font-bold text-orange-600">
                          {stats.inventory.low_stock}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Revenue Summary */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="mb-3 text-xl font-semibold text-gray-900">
                    Revenue Summary
                  </h2>

                  <p className="text-sm text-gray-500">
                    Revenue calculated from paid orders.
                  </p>

                  <p className="mt-4 text-3xl font-bold text-green-600">
                    {formatCurrency(stats.revenue.total)}
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
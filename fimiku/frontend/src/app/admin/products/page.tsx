
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import adminApi from "@/lib/axiosAdmin";
import {
  Package,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  ArrowLeft,
  AlertTriangle,
} from "lucide-react";

interface Product {
  id: string | number;
  name: string;
  sku: string;
  price: number;
  discount_price?: number | null;
  stock: number;
  image_url?: string;
  is_active: boolean;
  category_name?: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await adminApi.get("/products/");

      const data = response.data;

      setProducts(
        Array.isArray(data)
          ? data
          : Array.isArray(data.results)
          ? data.results
          : []
      );
    } catch (err: any) {
      console.error("Products API error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load products. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const searchTerm = search.toLowerCase();

    return (
      product.name?.toLowerCase().includes(searchTerm) ||
      product.sku?.toLowerCase().includes(searchTerm) ||
      product.category_name?.toLowerCase().includes(searchTerm)
    );
  });

  const deleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.name}"?`
    );

    if (!confirmed) return;

    try {
      await adminApi.delete(`/products/${product.id}/`);

      setProducts((previous) =>
        previous.filter((item) => item.id !== product.id)
      );
    } catch (err: any) {
      alert(
        err.response?.data?.detail ||
          "Unable to delete product."
      );
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(price || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">

          <div>
            <Link
              href="/admin/dashboard"
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-purple-600"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-900">
              Products
            </h1>

            <p className="mt-1 text-gray-500">
              Manage your Fimiku product catalogue.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-purple-700"
          >
            <Plus size={20} />
            Add Product
          </Link>
        </div>

        {/* Search and Refresh */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row">

          <div className="relative flex-1">
            <Search
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products by name, SKU or category..."
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <button
            onClick={fetchProducts}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 transition hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              size={18}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertTriangle size={20} />
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[300px] items-center justify-center">
            <div className="text-center">
              <RefreshCw
                size={32}
                className="mx-auto animate-spin text-purple-600"
              />

              <p className="mt-3 text-gray-500">
                Loading products...
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Product Count */}
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {filteredProducts.length}
                </span>{" "}
                products
              </p>
            </div>

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
                <Package
                  size={48}
                  className="mx-auto text-gray-300"
                />

                <h2 className="mt-4 text-xl font-semibold text-gray-900">
                  No products found
                </h2>

                <p className="mt-2 text-gray-500">
                  {search
                    ? "Try searching with another keyword."
                    : "Start by adding your first product."}
                </p>

                {!search && (
                  <Link
                    href="/admin/products/new"
                    className="mt-6 inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-3 text-white transition hover:bg-purple-700"
                  >
                    <Plus size={18} />
                    Add Your First Product
                  </Link>
                )}
              </div>
            ) : (
              /* Products Table */
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[900px]">

                    <thead className="border-b bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Product
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          SKU
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Price
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Stock
                        </th>

                        <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Status
                        </th>

                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">

                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="transition hover:bg-gray-50"
                        >

                          {/* Product */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">

                              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gray-100">
                                {product.image_url ? (
                                  <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package
                                    size={24}
                                    className="text-gray-400"
                                  />
                                )}
                              </div>

                              <div>
                                <p className="font-medium text-gray-900">
                                  {product.name}
                                </p>

                                <p className="text-xs text-gray-500">
                                  {product.category_name || "Uncategorized"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* SKU */}
                          <td className="px-6 py-4">
                            <span className="rounded-md bg-gray-100 px-2 py-1 text-sm font-mono text-gray-700">
                              {product.sku || "—"}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">
                              {formatPrice(
                                product.discount_price ||
                                  product.price
                              )}
                            </div>

                            {product.discount_price &&
                              product.discount_price < product.price && (
                                <div className="text-xs text-gray-400 line-through">
                                  {formatPrice(product.price)}
                                </div>
                              )}
                          </td>

                          {/* Stock */}
                          <td className="px-6 py-4">
                            <span
                              className={`font-medium ${
                                product.stock <= 10
                                  ? "text-orange-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {product.stock}
                            </span>

                            {product.stock <= 10 && (
                              <p className="text-xs text-orange-500">
                                Low stock
                              </p>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-medium ${
                                product.is_active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {product.is_active
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">

                              <Link
                                href={`/admin/products/${product.id}/edit`}
                                className="rounded-lg border border-gray-200 p-2 text-blue-600 transition hover:bg-blue-50"
                                title="Edit product"
                              >
                                <Edit size={18} />
                              </Link>

                              <button
                                onClick={() =>
                                  deleteProduct(product)
                                }
                                className="rounded-lg border border-gray-200 p-2 text-red-600 transition hover:bg-red-50"
                                title="Delete product"
                              >
                                <Trash2 size={18} />
                              </button>

                            </div>
                          </td>
                        </tr>
                      ))}

                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}


"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import adminApi from "@/lib/axiosAdmin";
import {
  ArrowLeft,
  Save,
  Package,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface Category {
  id: number;
  name: string;
}

export default function AddProductPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    material: "",
    target_age: "",
    price: "",
    discount_price: "",
    stock: "",
    image_url: "",
    additional_images: "",
    features: "",
    is_active: true,
    is_featured: false,
  });

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await adminApi.get("/categories/");

        const data = response.data;

        setCategories(
          Array.isArray(data)
            ? data
            : Array.isArray(data.results)
            ? data.results
            : []
        );
      } catch (err) {
        console.error("Category loading error:", err);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Update form fields
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    const checked =
      type === "checkbox" &&
      (e.target as HTMLInputElement).checked;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Create product
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const additionalImages = form.additional_images
        .split("\n")
        .map((image) => image.trim())
        .filter(Boolean);

      const features = form.features
        .split("\n")
        .map((feature) => feature.trim())
        .filter(Boolean);

      const payload = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: Number(form.category),
        description: form.description,
        material: form.material,
        target_age: form.target_age,
        price: Number(form.price),
        discount_price: form.discount_price
          ? Number(form.discount_price)
          : null,
        stock: Number(form.stock),
        image_url: form.image_url,
        additional_images: additionalImages,
        features: features,
        is_active: form.is_active,
        is_featured: form.is_featured,
      };

      await adminApi.post("/products/", payload);

      alert("Product created successfully!");

      router.push("/admin/products");
    } catch (err: any) {
      console.error("Create product error:", err);

      const responseData = err.response?.data;

      if (responseData) {
        const messages = Object.entries(responseData)
          .map(([field, value]) => {
            return `${field}: ${
              Array.isArray(value)
                ? value.join(", ")
                : String(value)
            }`;
          })
          .join("\n");

        setError(messages);
      } else {
        setError("Unable to create product. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-2 focus:ring-purple-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-700";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/products"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-purple-600"
          >
            <ArrowLeft size={16} />
            Back to Products
          </Link>

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3">
              <Package
                size={28}
                className="text-purple-600"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Add New Product
              </h1>

              <p className="mt-1 text-gray-500">
                Enter the details of your new product.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle
              size={20}
              className="mt-0.5 shrink-0"
            />

            <div className="whitespace-pre-line">
              {error}
            </div>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          {/* Basic Information */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* Product Name */}
              <div className="md:col-span-2">
                <label className={labelClass}>
                  Product Name *
                </label>

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter product name"
                  className={inputClass}
                />
              </div>

              {/* SKU */}
              <div>
                <label className={labelClass}>
                  SKU *
                </label>

                <input
                  name="sku"
                  value={form.sku}
                  onChange={handleChange}
                  required
                  placeholder="e.g. FIM-001"
                  className={inputClass}
                />
              </div>

              {/* Category */}
              <div>
                <label className={labelClass}>
                  Category *
                </label>

                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  disabled={loadingCategories}
                  className={inputClass}
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className={labelClass}>
                  Description *
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Describe your product..."
                  className={inputClass}
                />
              </div>

              {/* Material */}
              <div>
                <label className={labelClass}>
                  Material
                </label>

                <input
                  name="material"
                  value={form.material}
                  onChange={handleChange}
                  placeholder="e.g. Food-grade silicone"
                  className={inputClass}
                />
              </div>

              {/* Target Age */}
              <div>
                <label className={labelClass}>
                  Target Age
                </label>

                <input
                  name="target_age"
                  value={form.target_age}
                  onChange={handleChange}
                  placeholder="e.g. 6+ months"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Pricing & Inventory
            </h2>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

              {/* Price */}
              <div>
                <label className={labelClass}>
                  Price (₹) *
                </label>

                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={inputClass}
                />
              </div>

              {/* Discount */}
              <div>
                <label className={labelClass}>
                  Discount Price (₹)
                </label>

                <input
                  type="number"
                  name="discount_price"
                  value={form.discount_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="Optional"
                  className={inputClass}
                />
              </div>

              {/* Stock */}
              <div>
                <label className={labelClass}>
                  Stock Quantity *
                </label>

                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="0"
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Product Images
            </h2>

            {/* Main Image */}
            <div className="mb-5">
              <label className={labelClass}>
                Main Image URL
              </label>

              <input
                type="url"
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                placeholder="https://example.com/product-image.jpg"
                className={inputClass}
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter the URL of your product's main image.
              </p>
            </div>

            {/* Additional Images */}
            <div>
              <label className={labelClass}>
                Additional Image URLs
              </label>

              <textarea
                name="additional_images"
                value={form.additional_images}
                onChange={handleChange}
                rows={4}
                placeholder={"Enter one image URL per line:\nhttps://example.com/image2.jpg\nhttps://example.com/image3.jpg"}
                className={inputClass}
              />

              <p className="mt-2 text-xs text-gray-500">
                Enter one image URL per line.
              </p>
            </div>

            {/* Preview */}
            {form.image_url && (
              <div className="mt-5">
                <p className={labelClass}>
                  Image Preview
                </p>

                <div className="flex h-48 w-48 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
                  <img
                    src={form.image_url}
                    alt="Product preview"
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Features */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Product Features
            </h2>

            <label className={labelClass}>
              Features
            </label>

            <textarea
              name="features"
              value={form.features}
              onChange={handleChange}
              rows={5}
              placeholder={"Enter one feature per line:\nSafe for babies\nEasy to clean\nDurable material"}
              className={inputClass}
            />

            <p className="mt-2 text-xs text-gray-500">
              Each line will become a separate product feature.
            </p>
          </div>

          {/* Product Settings */}
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-6 text-xl font-semibold text-gray-900">
              Product Settings
            </h2>

            <div className="space-y-4">

              {/* Active */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="h-5 w-5 accent-purple-600"
                />

                <div>
                  <p className="font-medium text-gray-900">
                    Active Product
                  </p>

                  <p className="text-sm text-gray-500">
                    Make this product visible on your website.
                  </p>
                </div>
              </label>

              {/* Featured */}
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4">
                <input
                  type="checkbox"
                  name="is_featured"
                  checked={form.is_featured}
                  onChange={handleChange}
                  className="h-5 w-5 accent-purple-600"
                />

                <div>
                  <p className="font-medium text-gray-900">
                    Featured Product
                  </p>

                  <p className="text-sm text-gray-500">
                    Highlight this product on your website.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">

            <Link
              href="/admin/products"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-center font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-6 py-3 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Saving Product...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Create Product
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

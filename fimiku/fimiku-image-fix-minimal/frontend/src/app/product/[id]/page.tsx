```tsx
'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const productId = params?.id ?? '';

  return (
    <main className="min-h-screen bg-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/shop"
          className="text-sm text-purple-600 hover:underline"
        >
          ← Back to Shop
        </Link>

        <div className="mt-10 rounded-2xl border border-gray-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Product Details
          </h1>

          <p className="mt-4 text-gray-600">
            Product ID: {productId}
          </p>

          <p className="mt-3 text-sm text-gray-500">
            Your product page is ready for the original product data and
            shopping features to be restored.
          </p>
        </div>
      </div>
    </main>
  );
}
```
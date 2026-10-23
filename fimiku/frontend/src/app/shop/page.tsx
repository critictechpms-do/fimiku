'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Search, Heart, Star, ShoppingBag } from 'lucide-react';
import { api } from '@/lib/api';
import { useCart, ProductType } from '@/context/CartContext';
import { getProductImage } from '@/lib/productImages';

const FALLBACK_PRODUCTS: ProductType[] = [
  {
    id: 18 as any,
    name: 'Pastel Geometric Silicone Stacking Tower',
    slug: 'pastel-silicone-stacking-tower',
    price: '799.00',
    discount_price: '649.00',
    final_price: '649.00',
    image_url: '/products/sensory-stacking-toy-set.webp',
    category_name: 'Sensory Learning',
    stock: 56,
    is_in_stock: true,
    description: 'Soft silicone stacking toy designed for sensory play and early learning.',
    material: 'Food-grade silicone',
    target_age: '6 months+',
    features: ['Soft silicone', 'Easy to clean', 'Encourages hand-eye coordination'],
  },
  {
    id: 13 as any,
    name: '3 in 1 Pet slow feeder bowl',
    slug: '3-in-1-pet-slow-feeder-bowl',
    price: '1422.00',
    discount_price: '711.02',
    final_price: '711.02',
    image_url: '/products/02_pet_slow_feeder_bowl_3in1/image8.jpeg',
    category_name: 'Pet Toys',
    stock: 80,
    is_in_stock: true,
    description: 'Three-in-one slow feeder bowl for pets.',
    material: 'Silicone',
    target_age: 'Pets',
    features: ['Slow feeding', 'Easy to clean'],
  },
  {
    id: 14 as any,
    name: 'Dish Drying Mat',
    slug: 'silicone-kitchen-mat',
    price: '1544.00',
    discount_price: '772.38',
    final_price: '772.38',
    image_url: '/products/03_silicone_kitchen_mat/image14.jpeg',
    category_name: 'Kitchen Silicone',
    stock: 65,
    is_in_stock: true,
    description: 'Silicone dish drying mat.',
    material: 'Silicone',
    target_age: '',
    features: ['Reusable', 'Easy to clean'],
  },
  {
    id: 15 as any,
    name: 'Baby Feeding Set',
    slug: 'silicone-baby-feeding-set',
    price: '1723.00',
    discount_price: '861.50',
    final_price: '861.50',
    image_url: '/products/04_silicone_baby_feeding_set/image23.jpeg',
    category_name: 'Feeding Accessories',
    stock: 89,
    is_in_stock: true,
    description: 'Silicone feeding essentials for everyday mealtimes.',
    material: 'Silicone',
    target_age: '6 months+',
    features: ['Easy to clean', 'Reusable'],
  },
  {
    id: 22 as any,
    name: 'Pet Teether',
    slug: 'pet-teether',
    sku: 'PGT-01E',
    price: '549.00',
    image_url: '/products/blue-textured-bone-teether.webp',
    category_name: 'Pet Toys',
    stock: 0,
    is_in_stock: false,
    description: 'Bone-shaped textured pet teether.',
    material: 'Silicone',
    target_age: 'Pets',
    features: ['Bone-shaped design', 'Textured surface'],
  },
  {
    id: 23 as any,
    name: 'Baby Teether',
    slug: 'catalog-baby-teether',
    sku: 'BGT-01F',
    price: '549.00',
    image_url: '/products/baby-teether-main.jpg',
    category_name: 'Teething Toys',
    stock: 0,
    is_in_stock: false,
    description: 'Star-shaped baby teether.',
    material: 'Silicone',
    target_age: 'Babies',
    features: ['Star-shaped design', 'Textured surface'],
  },
];

const CATEGORIES: [string, string][] = [
  ['Teething Toys', 'teethers'],
  ['Bath Toys', 'bath'],
  ['Feeding Accessories', 'feeding'],
  ['Sensory Learning', 'sensory'],
  ['Baby Play', 'baby-play'],
  ['Kitchen Silicone', 'kitchen'],
];

function normalize(value: unknown): string {
  return String(value ?? '').trim().toLowerCase();
}

function getProductKey(product: any): string {
  const sku = normalize(product?.sku);
  if (sku) return `sku:${sku}`;

  const slug = normalize(product?.slug);
  if (slug) return `slug:${slug}`;

  const name = normalize(product?.name).replace(/[^a-z0-9]/g, '');
  return name ? `name:${name}` : `id:${String(product?.id ?? '')}`;
}

/**
 * Remove duplicates by SKU, slug, or product name.
 * API records take priority over fallback records.
 */
function uniqueProducts(
  liveProducts: ProductType[],
  fallbackProducts: ProductType[]
): ProductType[] {
  const map = new Map<string, ProductType>();

  // Add fallback products first.
  for (const product of fallbackProducts) {
    map.set(getProductKey(product), product);
  }

  // Real API products replace matching fallback entries.
  for (const product of liveProducts) {
    map.set(getProductKey(product), product);
  }

  return Array.from(map.values());
}

function match(product: any, category: string, query: string): boolean {
  const name = normalize(product?.name);
  const categoryName = normalize(
    product?.category_name ?? product?.category?.name
  );
  const categorySlug = normalize(
    product?.category_slug ?? product?.category?.slug
  );
  const slug = normalize(product?.slug);
  const sku = normalize(product?.sku);

  if (query.trim()) {
    const searchable = `${name} ${categoryName} ${categorySlug} ${slug} ${sku}`;
    if (!searchable.includes(normalize(query))) return false;
  }

  if (!category) return true;

  const aliases: Record<string, string[]> = {
    teethers: ['teether', 'teething'],
    bath: ['bath'],
    feeding: ['feeding'],
    sensory: ['sensory', 'stacking'],
    'baby-play': ['baby play', 'play', 'baby'],
    kitchen: ['kitchen', 'mat'],
  };

  const searchable = `${name} ${categoryName} ${categorySlug} ${slug}`;

  return (aliases[category] ?? [category]).some(alias =>
    searchable.includes(alias)
  );
}

function sortProducts(items: ProductType[], sort: string): ProductType[] {
  const result = [...items];

  const getPrice = (product: any) =>
    Number(
      product?.final_price ??
        product?.discount_price ??
        product?.price ??
        0
    );

  if (sort === 'price_low') {
    result.sort((a, b) => getPrice(a) - getPrice(b));
  } else if (sort === 'price_high') {
    result.sort((a, b) => getPrice(b) - getPrice(a));
  }

  return result;
}

function ShopContent() {
  const sp = useSearchParams();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState(sp.get('category') || '');
  const [search, setSearch] = useState(sp.get('search') || '');
  const [sort, setSort] = useState('');

  const { addToCart, toggleWishlist, isInWishlist } = useCart();

  useEffect(() => {
    setCat(sp.get('category') || '');
    setSearch(sp.get('search') || '');
  }, [sp]);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);

      try {
        const response = await api.get('/products/');
        const raw = response.data?.results ?? response.data;
        const live: ProductType[] = Array.isArray(raw) ? raw : [];

        /*
         * If the API returns products, use those records only.
         * Do not append fallback records to the live catalog.
         * This prevents fallback cards from repeating real products.
         */
        const source =
          live.length > 0
            ? uniqueProducts(live, [])
            : uniqueProducts([], FALLBACK_PRODUCTS);

        const filtered = source.filter(product =>
          match(product, cat, search)
        );

        if (!cancelled) {
          setProducts(sortProducts(filtered, sort));
        }
      } catch (error) {
        console.error('Failed to load products:', error);

        const filtered = uniqueProducts([], FALLBACK_PRODUCTS).filter(
          product => match(product, cat, search)
        );

        if (!cancelled) {
          setProducts(sortProducts(filtered, sort));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [cat, search, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6 pb-20 bg-fimiku-softLavender">
      <div className="bg-white rounded-3xl p-6 border border-fimiku-lightBorder shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-fimiku-cta font-bold">
              100% Food-Grade Silicone
            </span>

            <h1 className="text-3xl font-bold text-fimiku-darkText mt-1">
              Baby &amp; Child Essentials
            </h1>

            <p className="text-sm text-fimiku-secondaryText">
              Safe toys, feeding essentials and sensory play.
            </p>
          </div>

          <div className="flex gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-fimiku-grayText" />

              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search products..."
                className="pl-9 pr-4 py-2.5 rounded-full border text-xs"
              />
            </div>

            <select
              value={sort}
              onChange={event => setSort(event.target.value)}
              className="px-4 rounded-full border text-xs"
            >
              <option value="">Featured</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setCat('')}
            className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
              !cat
                ? 'bg-fimiku-cta text-white'
                : 'bg-fimiku-softLavender border'
            }`}
          >
            All Toys ({products.length})
          </button>

          {CATEGORIES.map(([name, slug]) => (
            <button
              key={slug}
              onClick={() => setCat(slug)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap ${
                cat === slug
                  ? 'bg-fimiku-cta text-white'
                  : 'bg-fimiku-softLavender border'
              }`}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-3xl">
          <p className="font-bold">No products found</p>

          <button
            onClick={() => {
              setCat('');
              setSearch('');
            }}
            className="mt-4 px-6 py-2.5 bg-fimiku-cta text-white rounded-full text-xs"
          >
            Show All Products
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map(product => {
            const price =
              (product as any).final_price ??
              product.discount_price ??
              product.price ??
              0;

            return (
              <div
                key={getProductKey(product)}
                className="bg-white rounded-3xl p-4 border shadow-sm"
              >
                <Link href={`/product/${product.id}`}>
                  <div className="relative aspect-square rounded-2xl bg-fimiku-softLavender overflow-hidden">
                    <img
                      src={getProductImage(product)}
                      alt={product.name}
                      className="w-full h-full object-cover hover:scale-105 transition"
                    />
                  </div>

                  <h3 className="font-bold text-sm mt-3 text-fimiku-darkText">
                    {product.name}
                  </h3>
                </Link>

                <div className="flex items-center gap-1 text-amber-400 mt-2">
                  {[0, 1, 2, 3, 4].map(index => (
                    <Star key={index} className="w-3 h-3 fill-current" />
                  ))}

                  <span className="text-[10px] text-gray-400">5.0</span>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <div>
                    <b>₹{price}</b>

                    {product.discount_price &&
                      Number(product.price) >
                        Number(product.discount_price) && (
                        <div className="text-[11px] line-through text-gray-400">
                          ₹{product.price}
                        </div>
                      )}
                  </div>

                  <button
                    onClick={() => addToCart(product, 1)}
                    className="p-2.5 rounded-2xl bg-fimiku-veryLightLavender text-fimiku-cta"
                    aria-label={`Add ${product.name} to cart`}
                  >
                    <ShoppingBag className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => toggleWishlist(product)}
                    className="p-2"
                    aria-label={`Add ${product.name} to wishlist`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isInWishlist(product.id)
                          ? 'text-red-500 fill-current'
                          : ''
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center">Loading Fimiku Catalog...</div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}

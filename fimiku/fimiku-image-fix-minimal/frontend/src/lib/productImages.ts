// Fimiku product image mapping.
// The API currently contains older Unsplash image URLs, so the frontend
// uses the uploaded product photos for the matching catalog items.

const LOCAL_IMAGES = {
  blueTeether: '/products/blue-textured-bone-teether.webp',
  sensoryTeether: '/products/sensory-teether-collection.webp',
  babyFeeding: '/products/baby-feeding-set.webp',
  bath: '/products/bath-toy-collection.webp',
  bibBowl: '/products/silicone-bib-bowl-set.webp',
  teethingRing: '/products/teething-ring-collection.webp',
  stacking: '/products/sensory-stacking-toy-set.webp',
} as const;

export function getProductImage(product: any): string {
  const slug = String(product?.slug ?? '').toLowerCase();
  const name = String(product?.name ?? '').toLowerCase();
  const text = `${slug} ${name}`;
  const category = String(product?.category_slug ?? '').toLowerCase();

  // Exact catalog matches first so duplicated seeded products stay consistent.
  if (slug.includes('silicone-baby-feeding-set') || text.includes('silicone baby feeding set')) {
    return LOCAL_IMAGES.babyFeeding;
  }
  if (slug.includes('silicone-foldable-tub') || text.includes('foldable tub')) {
    return LOCAL_IMAGES.bath;
  }
  if (slug.includes('koala-textured-teething-ring') || text.includes('koala') || text.includes('textured teething ring')) {
    return LOCAL_IMAGES.teethingRing;
  }
  if (slug.includes('pastel-silicone-stacking-tower') || text.includes('stacking tower') || text.includes('stacking')) {
    return LOCAL_IMAGES.stacking;
  }
  if (text.includes('sensory teether') || text.includes('sensory teeth')) {
    return LOCAL_IMAGES.sensoryTeether;
  }
  if (text.includes('teething ring')) {
    return LOCAL_IMAGES.teethingRing;
  }
  if (text.includes('bone teether') || text.includes('teether')) {
    return LOCAL_IMAGES.blueTeether;
  }

  // Category-level fallback for the remaining catalog entries.
  if (category === 'bath') return LOCAL_IMAGES.bath;
  if (category === 'feeding') return LOCAL_IMAGES.babyFeeding;
  if (category === 'sensory') return LOCAL_IMAGES.sensoryTeether;
  if (category === 'teethers') return LOCAL_IMAGES.blueTeether;
  if (category === 'kitchen') return LOCAL_IMAGES.bibBowl;
  if (category === 'baby-play') return LOCAL_IMAGES.sensoryTeether;

  // Keep the backend image as a final fallback for products without a local match.
  return product?.image_url || LOCAL_IMAGES.sensoryTeether;
}

export function getProductGallery(product: any): string[] {
  const main = getProductImage(product);
  const extra = Array.isArray(product?.additional_images)
    ? product.additional_images.filter(Boolean)
    : [];
  return Array.from(new Set([main, ...extra]));
}

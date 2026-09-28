export function getProductImage(product: any): string {
  const slug = String(product?.slug || '').toLowerCase();

  const map: Record<string, string> = {
    'pastel-silicone-stacking-tower': '/products/sensory-stacking-toy-set.webp',
    'silicone-baby-feeding-set': '/products/baby-feeding-set.webp',
    'koala-textured-teething-ring': '/products/teething-ring-collection.webp',
    'sensory-teether-collection': '/products/sensory-teether-collection.webp',
    'silicone-foldable-tub': '/products/bath-toy-collection.webp',
    'bath-toy-collection': '/products/bath-toy-collection.webp',
    'silicone-bib-bowl-set': '/products/silicone-bib-bowl-set.webp',
    'teething-ring-collection': '/products/teething-ring-collection.webp',
    'textured-baby-teething-toy': '/products/blue-textured-bone-teether.webp',
  };

  return (
    map[slug] ||
    product?.image_url ||
    '/products/sensory-teether-collection.webp'
  );
}

export function getProductGallery(product: any): string[] {
  const main = getProductImage(product);

  const extra = Array.isArray(product?.additional_images)
    ? product.additional_images.filter(Boolean)
    : [];

  return Array.from(new Set([main, ...extra]));
}
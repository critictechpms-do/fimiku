export function getProductImage(product: any): string {
  const slug = String(product?.slug || '').toLowerCase().trim();
  const sku = String(product?.sku || '').toUpperCase().trim();

  // Exact product → exact uploaded image
  if (
    slug === 'pastel-silicone-stacking-tower' ||
    sku === 'FIM-SEN-01'
  ) {
    return '/products/sensory-stacking-toy-set.webp';
  }

  if (slug === 'sensory-teether-collection') {
    return '/products/sensory-teether-collection.webp';
  }

  if (slug === 'silicone-baby-feeding-set') {
    return '/products/baby-feeding-set.webp';
  }

  if (slug === 'bath-toy-collection') {
    return '/products/bath-toy-collection.webp';
  }

  if (slug === 'silicone-bib-bowl-set') {
    return '/products/silicone-bib-bowl-set.webp';
  }

  if (slug === 'teething-ring-collection') {
    return '/products/teething-ring-collection.webp';
  }

  if (slug === 'textured-baby-teething-toy') {
    return '/products/blue-textured-bone-teether.webp';
  }

  // IMPORTANT:
  // For products without an exact matching uploaded photo,
  // keep the backend image instead of showing the wrong product photo.
  return product?.image_url || '/products/sensory-teether-collection.webp';
}

export function getProductGallery(product: any): string[] {
  const main = getProductImage(product);

  const extra = Array.isArray(product?.additional_images)
    ? product.additional_images.filter(Boolean)
    : [];

  return Array.from(new Set([main, ...extra]));
}
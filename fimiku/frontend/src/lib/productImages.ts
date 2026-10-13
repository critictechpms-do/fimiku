/**
 * Product image helpers for Fimiku.
 *
 * Gallery order:
 * 1. The exact product image selected below (or the backend's image_url).
 * 2. Product-specific images supplied by the API, such as additional_images,
 *    gallery_images, images, or image_urls.
 *
 * We deliberately do not add photos of other products as filler. Add 3–4 real
 * image URLs for each product in the backend's `additional_images` field (or
 * one of the supported gallery fields) to populate the slider.
 */

function cleanImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  return url.length > 0 ? url : null;
}

function extractImageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item: unknown) => {
      if (typeof item === 'string') return cleanImageUrl(item);
      if (item && typeof item === 'object') {
        const image = item as Record<string, unknown>;
        return cleanImageUrl(
          image.image_url ?? image.image ?? image.url ?? image.src
        );
      }
      return null;
    })
    .filter((url): url is string => Boolean(url));
}

export function getProductImage(product: any): string {
  const slug = String(product?.slug || '').toLowerCase().trim();
  const sku = String(product?.sku || '').toUpperCase().trim();

  // Exact product → exact uploaded image.
  if (slug === 'pastel-silicone-stacking-tower' || sku === 'FIM-SEN-01') {
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

  // For products without a mapped local image, preserve the backend image.
  return (
    cleanImageUrl(product?.image_url) ||
    cleanImageUrl(product?.image) ||
    '/products/sensory-teether-collection.webp'
  );
}

export function getProductGallery(product: any): string[] {
  const main = getProductImage(product);

  // Accept the common image-gallery fields used by APIs/CMS systems.
  const extraImages = [
    ...extractImageUrls(product?.additional_images),
    ...extractImageUrls(product?.gallery_images),
    ...extractImageUrls(product?.image_urls),
    ...extractImageUrls(product?.images),
  ];

  // Keep the exact main image first, remove duplicates, and limit to 4 photos.
  return Array.from(new Set([main, ...extraImages])).slice(0, 4);
}

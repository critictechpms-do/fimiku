
/**
 * Product image helpers for Fimiku.
 *
 * Uses local product images where a matching product is found.
 * Supports additional product-specific images from the API gallery fields.
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
      if (typeof item === 'string') {
        return cleanImageUrl(item);
      }

      if (item && typeof item === 'object') {
        const image = item as Record<string, unknown>;

        return cleanImageUrl(
          image.image_url ??
            image.image ??
            image.url ??
            image.src
        );
      }

      return null;
    })
    .filter((url): url is string => Boolean(url));
}

export function getProductImage(product: any): string {
  const slug = String(product?.slug || '')
    .toLowerCase()
    .trim();

  const name = String(product?.name || '')
    .toLowerCase()
    .trim();

  const sku = String(product?.sku || '')
    .toUpperCase()
    .trim();

  const text = `${slug} ${name}`;

  // 1. Foldable silicone basket
  if (
    text.includes('foldable basket') ||
    text.includes('silicone foldable basket')
  ) {
    return '/products/01_silicone_foldable_basket/image1.png';
  }

  // 2. Three-in-one pet slow feeder bowl
  if (
    text.includes('slow feeder') ||
    text.includes('pet feeder')
  ) {
    return '/products/02_pet_slow_feeder_bowl_3in1/image5.png';
  }

  // 3. Silicone kitchen mat
  if (text.includes('kitchen mat')) {
    return '/products/03_silicone_kitchen_mat/image12.png';
  }

  // 4. Sensory stacking tower
  if (
    slug === 'pastel-silicone-stacking-tower' ||
    sku === 'FIM-SEN-01' ||
    text.includes('stacking tower')
  ) {
    return '/products/sensory-stacking-toy-set.webp';
  }

  // 5. Sensory teether collection
  if (
    slug === 'sensory-teether-collection' ||
    text.includes('sensory teether')
  ) {
    return '/products/sensory-teether-collection.webp';
  }

  // 6. Silicone baby feeding set
  if (
    slug === 'silicone-baby-feeding-set' ||
    text.includes('silicone baby feeding set')
  ) {
    return '/products/baby-feeding-set.webp';
  }

  // 7. Bath toy collection / foldable bath tub
  if (
    slug === 'bath-toy-collection' ||
    text.includes('foldable tub') ||
    text.includes('bath toy')
  ) {
    return '/products/bath-toy-collection.webp';
  }

  // 8. Silicone bib and bowl set
  if (
    slug === 'silicone-bib-bowl-set' ||
    text.includes('bib bowl')
  ) {
    return '/products/silicone-bib-bowl-set.webp';
  }

  // 9. Teething rings / koala teether
  if (
    slug === 'teething-ring-collection' ||
    text.includes('koala') ||
    text.includes('textured teething ring') ||
    text.includes('teething ring')
  ) {
    return '/products/teething-ring-collection.webp';
  }

  // 10. Textured baby teething toy
  if (
    slug === 'textured-baby-teething-toy' ||
    text.includes('bone teether') ||
    text.includes('teether')
  ) {
    return '/products/blue-textured-bone-teether.webp';
  }

  // Category-based fallback mappings
  const category = String(
    product?.category_slug ??
      product?.category?.slug ??
      product?.category ??
      ''
  )
    .toLowerCase()
    .trim();

  if (category === 'bath') {
    return '/products/bath-toy-collection.webp';
  }

  if (category === 'feeding') {
    return '/products/baby-feeding-set.webp';
  }

  if (category === 'sensory') {
    return '/products/sensory-teether-collection.webp';
  }

  if (category === 'teethers') {
    return '/products/blue-textured-bone-teether.webp';
  }

  if (category === 'kitchen') {
    return '/products/03_silicone_kitchen_mat/image12.png';
  }

  if (category === 'baby-play') {
    return '/products/sensory-teether-collection.webp';
  }

  // Use the image supplied by the API if no local mapping matches.
  return (
    cleanImageUrl(product?.image_url) ||
    cleanImageUrl(product?.image) ||
    '/products/sensory-teether-collection.webp'
  );
}

export function getProductGallery(product: any): string[] {
  const main = getProductImage(product);

  const extraImages = [
    ...extractImageUrls(product?.additional_images),
    ...extractImageUrls(product?.gallery_images),
    ...extractImageUrls(product?.image_urls),
    ...extractImageUrls(product?.images),
  ];

  // Keep the main image first and remove duplicate URLs.
  return Array.from(new Set([main, ...extraImages])).slice(0, 4);
}

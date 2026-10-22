/**
 * Fimiku product image helpers.
 *
 * The first image in each local gallery is the main product image.
 * Local files are stored in frontend/public/products/.
 * Keep each product's gallery independent so updating one product does not
 * replace the image gallery for any other product.
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

      if (item !== null && typeof item === 'object') {
        const image = item as Record<string, unknown>;
        return cleanImageUrl(
          image.image_url ?? image.image ?? image.url ?? image.src
        );
      }

      return null;
    })
    .filter((url): url is string => url !== null);
}

const LOCAL_GALLERIES: Record<string, string[]> = {
  // Silicone Foldable Basket: keep the original four-image gallery.
  basket: [
    '/products/01_silicone_foldable_basket/image4.jpeg',
    '/products/01_silicone_foldable_basket/image1.png',
    '/products/01_silicone_foldable_basket/image2.jpeg',
    '/products/01_silicone_foldable_basket/image3.jpeg',
  ],

  // Pet Slow Feeder Bowl: keep the original four-image gallery.
  petFeeder: [
    '/products/02_pet_slow_feeder_bowl_3in1/image8.jpeg',
    '/products/02_pet_slow_feeder_bowl_3in1/image5.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image6.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image7.png',
  ],

  // Silicone Kitchen Mat: keep the original four-image gallery.
  kitchenMat: [
    '/products/03_silicone_kitchen_mat/image14.jpeg',
    '/products/03_silicone_kitchen_mat/image12.png',
    '/products/03_silicone_kitchen_mat/image13.png',
    '/products/03_silicone_kitchen_mat/image15.jpeg',
  ],

  // Baby Feeding Set: its own three images, separate from other products.
  babyFeedingSet: [
    '/products/baby-feeding-set.webp',
    '/products/baby-feeding-set-beige.webp',
    '/products/baby-feeding-set-purple.webp',
  ],
};

function getLocalGallery(product: any): string[] | null {
  const slug = String(product?.slug ?? '').toLowerCase().trim();
  const name = String(product?.name ?? '').toLowerCase().trim();
  const text = `${slug} ${name}`;
  const sku = String(product?.sku ?? '').toUpperCase().trim();

  if (text.includes('foldable basket') || text.includes('silicone basket')) {
    return LOCAL_GALLERIES.basket;
  }

  if (text.includes('slow feeder') || text.includes('pet feeder')) {
    return LOCAL_GALLERIES.petFeeder;
  }

  if (text.includes('kitchen mat')) {
    return LOCAL_GALLERIES.kitchenMat;
  }

  if (
    slug === 'silicone-baby-feeding-set' ||
    (text.includes('baby') && text.includes('feeding') && text.includes('set'))
  ) {
    return LOCAL_GALLERIES.babyFeedingSet;
  }

  // Other products are intentionally not assigned a local gallery here.
  // Their API images are preserved by getProductGallery below.
  return null;
}

export function getProductImage(product: any): string {
  const localGallery = getLocalGallery(product);
  if (localGallery !== null) return localGallery[0];

  const slug = String(product?.slug ?? '').toLowerCase().trim();
  const name = String(product?.name ?? '').toLowerCase().trim();
  const sku = String(product?.sku ?? '').toUpperCase().trim();
  const text = `${slug} ${name}`;

  // Sensory stacking tower.
  if (
    slug === 'pastel-silicone-stacking-tower' ||
    sku === 'FIM-SEN-01' ||
    text.includes('stacking tower')
  ) {
    return '/products/sensory-stacking-toy-set.webp';
  }

  // Sensory teether collection.
  if (slug === 'sensory-teether-collection' || text.includes('sensory teether')) {
    return '/products/sensory-teether-collection.webp';
  }

  // Bath toys and foldable bath tub.
  if (
    slug === 'bath-toy-collection' ||
    text.includes('bath toy') ||
    text.includes('foldable tub')
  ) {
    return '/products/bath-toy-collection.webp';
  }

  // Silicone bib and bowl set.
  if (slug === 'silicone-bib-bowl-set' || text.includes('bib bowl')) {
    return '/products/silicone-bib-bowl-set.webp';
  }

  // Teething ring collection.
  if (
    slug === 'teething-ring-collection' ||
    text.includes('koala') ||
    text.includes('teething ring')
  ) {
    return '/products/teething-ring-collection.webp';
  }

  // Textured teething toy. Keep this after the more specific product checks.
  if (
    slug === 'textured-baby-teething-toy' ||
    text.includes('bone teether') ||
    text.includes('teether')
  ) {
    return '/products/blue-textured-bone-teether.webp';
  }

  // Preserve the image returned by the backend for any other product.
  return (
    cleanImageUrl(product?.image_url) ??
    cleanImageUrl(product?.image) ??
    '/products/sensory-teether-collection.webp'
  );
}

export function getProductGallery(product: any): string[] {
  // Explicit local galleries take priority and remain isolated per product.
  const localGallery = getLocalGallery(product);
  if (localGallery !== null) return [...localGallery];

  // For products without a local gallery, preserve all API-provided images.
  // The main image is placed first, duplicates are removed, and up to four
  // images are returned for the existing product slider.
  const mainImage = getProductImage(product);
  const extraImages = [
    ...extractImageUrls(product?.additional_images),
    ...extractImageUrls(product?.gallery_images),
    ...extractImageUrls(product?.image_urls),
    ...extractImageUrls(product?.images),
  ];

  return Array.from(new Set([mainImage, ...extraImages])).slice(0, 4);
}

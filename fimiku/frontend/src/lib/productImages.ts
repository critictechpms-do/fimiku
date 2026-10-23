/**
 * Fimiku product image helpers.
 * Images are served from frontend/public/products/.
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
  basket: [
    '/products/01_silicone_foldable_basket/image4.jpeg',
    '/products/01_silicone_foldable_basket/image1.png',
    '/products/01_silicone_foldable_basket/image2.jpeg',
    '/products/01_silicone_foldable_basket/image3.jpeg',
  ],

  petFeeder: [
    '/products/02_pet_slow_feeder_bowl_3in1/image8.jpeg',
    '/products/02_pet_slow_feeder_bowl_3in1/image5.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image6.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image7.png',
  ],

  kitchenMat: [
    '/products/03_silicone_kitchen_mat/image14.jpeg',
    '/products/03_silicone_kitchen_mat/image12.png',
    '/products/03_silicone_kitchen_mat/image13.png',
    '/products/03_silicone_kitchen_mat/image15.jpeg',
    '/products/03_silicone_kitchen_mat/image16.jpeg',
  ],

  babyFeedingSet: [
    '/products/04_silicone_baby_feeding_set/image23.jpeg',
    '/products/baby-feeding-set.webp',
    '/products/baby-feeding-set-beige.webp',
    '/products/baby-feeding-set-purple.webp',
  ],

  foldableTub: [
    '/products/bath-toy-collection.webp',
  ],

  // Pet Teether: existing blue bone image and additional views.
  // Only use image files that currently exist.
  petTeether: [
    '/products/blue-textured-bone-teether.webp',
    '/products/pet-teether-main.jpg',
    '/products/pet-teether-angle.jpg',
    '/products/pet-teether-lifestyle.jpg',
  ],

  // Baby Teether: star-shaped product images.
  babyTeether: [
    '/products/baby-teether-main.jpg',
    '/products/baby-teether-angle.jpg',
    '/products/baby-teether-lifestyle.jpg',
  ],
};

function getLocalGallery(product: any): string[] | null {
  const slug = String(product?.slug ?? '').toLowerCase().trim();
  const name = String(product?.name ?? '').toLowerCase().trim();
  const sku = String(product?.sku ?? '').toUpperCase().trim();
  const text = `${slug} ${name}`;

  if (
    text.includes('foldable basket') ||
    text.includes('silicone basket') ||
    sku === 'SFB-001'
  ) {
    return LOCAL_GALLERIES.basket;
  }

  // Keep the pet bowl separate from any pet mat.
  if (
    text.includes('slow feeder') ||
    text.includes('pet feeder') ||
    sku === 'PSFB-001'
  ) {
    return LOCAL_GALLERIES.petFeeder;
  }

  if (
    text.includes('kitchen mat') ||
    text.includes('dish drying mat') ||
    sku === 'KSM-01C'
  ) {
    return LOCAL_GALLERIES.kitchenMat;
  }

  if (
    slug === 'silicone-baby-feeding-set' ||
    slug === 'catalog-baby-feeding-set' ||
    sku === 'BFS-01B' ||
    (
      text.includes('baby') &&
      text.includes('feeding') &&
      text.includes('set')
    )
  ) {
    return LOCAL_GALLERIES.babyFeedingSet;
  }

  if (text.includes('foldable tub') || sku === 'FST-01A') {
    return LOCAL_GALLERIES.foldableTub;
  }

  // Match Pet Teether before Baby Teether.
  if (
    slug === 'catalog-pet-teether' ||
    slug === 'pet-teether' ||
    sku === 'PGT-01E' ||
    (text.includes('pet') && text.includes('teether'))
  ) {
    return LOCAL_GALLERIES.petTeether;
  }

  if (
    slug === 'catalog-baby-teether' ||
    slug === 'baby-teether' ||
    sku === 'BGT-01F' ||
    (text.includes('baby') && text.includes('teether'))
  ) {
    return LOCAL_GALLERIES.babyTeether;
  }

  return null;
}

export function getProductImage(product: any): string {
  const gallery = getLocalGallery(product);

  if (gallery !== null) return gallery[0];

  const slug = String(product?.slug ?? '').toLowerCase().trim();
  const name = String(product?.name ?? '').toLowerCase().trim();
  const text = `${slug} ${name}`;

  if (
    slug === 'pastel-silicone-stacking-tower' ||
    text.includes('stacking tower')
  ) {
    return '/products/sensory-stacking-toy-set.webp';
  }

  if (
    slug === 'sensory-teether-collection' ||
    text.includes('sensory teether')
  ) {
    return '/products/sensory-teether-collection.webp';
  }

  if (
    slug === 'bath-toy-collection' ||
    text.includes('bath toy')
  ) {
    return '/products/bath-toy-collection.webp';
  }

  if (
    slug === 'silicone-bib-bowl-set' ||
    text.includes('bib bowl')
  ) {
    return '/products/silicone-bib-bowl-set.webp';
  }

  if (
    slug === 'teething-ring-collection' ||
    text.includes('koala') ||
    text.includes('teething ring')
  ) {
    return '/products/teething-ring-collection.webp';
  }

  return (
    cleanImageUrl(product?.image_url) ??
    cleanImageUrl(product?.image) ??
    '/products/sensory-teether-collection.webp'
  );
}

export function getProductGallery(product: any): string[] {
  const gallery = getLocalGallery(product);

  if (gallery !== null) {
    // Array.from avoids the Set spread TypeScript build error.
    return Array.from(new Set(gallery)).slice(0, 5);
  }

  const mainImage = getProductImage(product);

  const extraImages = [
    ...extractImageUrls(product?.additional_images),
    ...extractImageUrls(product?.gallery_images),
    ...extractImageUrls(product?.image_urls),
    ...extractImageUrls(product?.images),
  ];

  return Array.from(new Set([mainImage, ...extraImages])).slice(0, 4);
}

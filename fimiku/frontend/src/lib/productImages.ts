
/**
 * Fimiku product image helpers.
 *
 * Local images live in frontend/public/products/.
 * The first image in each gallery is the main product image.
 * Each product has its own gallery to prevent image mixing.
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
    '/products/04_silicone_baby_feeding_set/image17.jpeg',
    '/products/04_silicone_baby_feeding_set/image18.png',
    '/products/04_silicone_baby_feeding_set/image19.png',
    '/products/04_silicone_baby_feeding_set/image20.png',
    '/products/04_silicone_baby_feeding_set/image21.jpeg',
  ],

  foldableTub: [
    '/products/bath-toy-collection.webp',
  ],

  catalogBabyFeedingSet: [
    '/products/baby-feeding-set.webp',
    '/products/baby-feeding-set-beige.webp',
    '/products/baby-feeding-set-purple.webp',
  ],

  babyTeether: [
    '/products/blue-textured-bone-teether.webp',
  ],

  dishDryingMat: [
    '/products/03_silicone_kitchen_mat/image12.png',
    '/products/03_silicone_kitchen_mat/image13.png',
    '/products/03_silicone_kitchen_mat/image14.jpeg',
    '/products/03_silicone_kitchen_mat/image15.jpeg',
    '/products/03_silicone_kitchen_mat/image16.jpeg',
  ],

  // Correct catalogue photos have not been supplied yet.
  petFeedingMat: [],
  petTeether: [],
};

function getLocalGallery(product: any): string[] | null {
  const slug = String(product?.slug ?? '').toLowerCase().trim();
  const name = String(product?.name ?? '').toLowerCase().trim();
  const text = `${slug} ${name}`;
  const sku = String(product?.sku ?? '').toUpperCase().trim();

  // Existing products.
  if (
    text.includes('foldable basket') ||
    text.includes('silicone basket')
  ) {
    return LOCAL_GALLERIES.basket;
  }

  // Do not confuse a pet feeding mat with a slow feeder bowl.
  if (
    sku === 'PFB-01D' ||
    slug === 'pet-feeding-mat' ||
    text.includes('pet feeding mat')
  ) {
    return LOCAL_GALLERIES.petFeedingMat;
  }

  if (
    sku === 'PGT-01E' ||
    slug === 'pet-teether' ||
    text.includes('pet teether')
  ) {
    return LOCAL_GALLERIES.petTeether;
  }

  if (
    text.includes('slow feeder') ||
    text.includes('pet feeder')
  ) {
    return LOCAL_GALLERIES.petFeeder;
  }

  if (
    sku === 'KSM-01C' ||
    slug === 'dish-drying-mat' ||
    text.includes('dish drying mat')
  ) {
    return LOCAL_GALLERIES.dishDryingMat;
  }

  if (text.includes('kitchen mat')) {
    return LOCAL_GALLERIES.kitchenMat;
  }

  // Catalogue Baby Feeding Set must be checked before the older product.
  if (sku === 'BFS-01B' || slug === 'catalog-baby-feeding-set') {
    return LOCAL_GALLERIES.catalogBabyFeedingSet;
  }

  if (
    slug === 'silicone-baby-feeding-set' ||
    (text.includes('baby') &&
      text.includes('feeding') &&
      text.includes('set'))
  ) {
    return LOCAL_GALLERIES.babyFeedingSet;
  }

  if (
    sku === 'FST-01A' ||
    slug === 'foldable-tub' ||
    text.includes('foldable tub')
  ) {
    return LOCAL_GALLERIES.foldableTub;
  }

  if (
    sku === 'BGT-01F' ||
    slug === 'catalog-baby-teether' ||
    slug === 'baby-teether'
  ) {
    return LOCAL_GALLERIES.babyTeether;
  }

  return null;
}

export function getProductImage(product: any): string {
  const localGallery = getLocalGallery(product);

  if (localGallery !== null && localGallery.length > 0) {
    return localGallery[0];
  }

  const slug = String(product?.slug ?? '').toLowerCase().trim();
  const name = String(product?.name ?? '').toLowerCase().trim();
  const sku = String(product?.sku ?? '').toUpperCase().trim();
  const text = `${slug} ${name}`;

  if (
    slug === 'pastel-silicone-stacking-tower' ||
    sku === 'FIM-SEN-01' ||
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

  // Only assign the bone image to the baby teether.
  if (
    slug === 'textured-baby-teething-toy' ||
    text.includes('bone teether') ||
    sku === 'BGT-01F'
  ) {
    return '/products/blue-textured-bone-teether.webp';
  }

  return (
    cleanImageUrl(product?.image_url) ??
    cleanImageUrl(product?.image) ??
    '/products/sensory-teether-collection.webp'
  );
}

export function getProductGallery(product: any): string[] {
  const localGallery = getLocalGallery(product);

  // An empty local gallery means no confirmed local photos are available.
  // Preserve the backend image in that case.
  if (localGallery !== null && localGallery.length > 0) {
    return [...localGallery];
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

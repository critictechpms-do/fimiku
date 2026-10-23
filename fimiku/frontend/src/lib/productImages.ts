
/**
 * Fimiku product image helpers.
 *
 * Local images are stored in frontend/public/products/.
 * Each product has its own gallery.
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
  // Silicone Foldable Basket.
  basket: [
    '/products/01_silicone_foldable_basket/image4.jpeg',
    '/products/01_silicone_foldable_basket/image1.png',
    '/products/01_silicone_foldable_basket/image2.jpeg',
    '/products/01_silicone_foldable_basket/image3.jpeg',
  ],

  // Pet Slow Feeder Bowl - 3 in 1.
  petFeeder: [
    '/products/02_pet_slow_feeder_bowl_3in1/image8.jpeg',
    '/products/02_pet_slow_feeder_bowl_3in1/image5.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image6.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image7.png',
  ],

  // Silicone Kitchen Mat / Dish Drying Mat.
  kitchenMat: [
    '/products/03_silicone_kitchen_mat/image14.jpeg',
    '/products/03_silicone_kitchen_mat/image12.png',
    '/products/03_silicone_kitchen_mat/image13.png',
    '/products/03_silicone_kitchen_mat/image15.jpeg',
    '/products/03_silicone_kitchen_mat/image16.jpeg',
  ],

  // Baby Feeding Set.
  // image22.jpeg is the MAIN product image.
  babyFeedingSet: [
    '/products/04_silicone_baby_feeding_set/image22.jpeg',
    '/products/04_silicone_baby_feeding_set/image18.png',
    '/products/04_silicone_baby_feeding_set/image19.png',
    '/products/04_silicone_baby_feeding_set/image20.png',
    '/products/04_silicone_baby_feeding_set/image21.jpeg',
    '/products/04_silicone_baby_feeding_set/image23.jpeg',
    '/products/04_silicone_baby_feeding_set/image24.jpeg',
    '/products/04_silicone_baby_feeding_set/image25.jpeg',
    '/products/04_silicone_baby_feeding_set/image26.png',
    '/products/04_silicone_baby_feeding_set/image27.png',
    '/products/04_silicone_baby_feeding_set/image28.png',
    '/products/04_silicone_baby_feeding_set/image29.png',
    '/products/04_silicone_baby_feeding_set/image30.png',
    '/products/04_silicone_baby_feeding_set/image31.png',
    '/products/04_silicone_baby_feeding_set/image32.png',
    '/products/04_silicone_baby_feeding_set/image33.png',
    '/products/04_silicone_baby_feeding_set/image34.png',
  ],

  // Foldable Tub.
  foldableTub: [
    '/products/bath-toy-collection.webp',
  ],

  // Baby Teether.
  babyTeether: [
    '/products/blue-textured-bone-teether.webp',
  ],
};

function getLocalGallery(product: any): string[] | null {
  const slug = String(product?.slug ?? '').toLowerCase().trim();
  const name = String(product?.name ?? '').toLowerCase().trim();
  const sku = String(product?.sku ?? '').toUpperCase().trim();
  const text = `${slug} ${name}`;

  // Foldable Basket.
  if (
    text.includes('foldable basket') ||
    text.includes('silicone basket') ||
    sku === 'SFB-001'
  ) {
    return LOCAL_GALLERIES.basket;
  }

  // Pet Slow Feeder Bowl. Keep separate from Pet Feeding Mat.
  if (
    text.includes('slow feeder') ||
    text.includes('pet feeder') ||
    sku === 'PSFB-001'
  ) {
    return LOCAL_GALLERIES.petFeeder;
  }

  // Kitchen Mat / Dish Drying Mat.
  if (
    text.includes('kitchen mat') ||
    text.includes('dish drying mat') ||
    sku === 'KSM-01C'
  ) {
    return LOCAL_GALLERIES.kitchenMat;
  }

  // Baby Feeding Set.
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

  // Foldable Tub. Keep separate from Foldable Basket.
  if (
    text.includes('foldable tub') ||
    sku === 'FST-01A'
  ) {
    return LOCAL_GALLERIES.foldableTub;
  }

  // Baby Teether only.
  if (
    slug === 'catalog-baby-teether' ||
    sku === 'BGT-01F' ||
    (text.includes('baby') && text.includes('teether'))
  ) {
    return LOCAL_GALLERIES.babyTeether;
  }

  // Pet Feeding Mat and Pet Teether use backend images
  // until their correct local product photos are available.
  return null;
}

export function getProductImage(product: any): string {
  const localGallery = getLocalGallery(product);

  if (localGallery !== null) {
    return localGallery[0];
  }

  const slug = String(product?.slug ?? '').toLowerCase().trim();
  const name = String(product?.name ?? '').toLowerCase().trim();
  const text = `${slug} ${name}`;

  // Sensory stacking tower.
  if (
    slug === 'pastel-silicone-stacking-tower' ||
    text.includes('stacking tower')
  ) {
    return '/products/sensory-stacking-toy-set.webp';
  }

  // Sensory teether collection.
  if (
    slug === 'sensory-teether-collection' ||
    text.includes('sensory teether')
  ) {
    return '/products/sensory-teether-collection.webp';
  }

  // Bath toys.
  if (
    slug === 'bath-toy-collection' ||
    text.includes('bath toy')
  ) {
    return '/products/bath-toy-collection.webp';
  }

  // Silicone bib and bowl set.
  if (
    slug === 'silicone-bib-bowl-set' ||
    text.includes('bib bowl')
  ) {
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

  // Preserve backend images for products without a confirmed local gallery.
  return (
    cleanImageUrl(product?.image_url) ??
    cleanImageUrl(product?.image) ??
    '/products/sensory-teether-collection.webp'
  );
}

export function getProductGallery(product: any): string[] {
  const localGallery = getLocalGallery(product);

  if (localGallery !== null) {
    return [...localGallery];
  }

  // Preserve API-provided images for other products.
  const mainImage = getProductImage(product);

  const extraImages = [
    ...extractImageUrls(product?.additional_images),
    ...extractImageUrls(product?.gallery_images),
    ...extractImageUrls(product?.image_urls),
    ...extractImageUrls(product?.images),
  ];

  return Array.from(new Set([mainImage, ...extraImages])).slice(0, 4);
}

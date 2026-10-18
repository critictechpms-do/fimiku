
/**
 * Fimiku product image mappings.
 * Local files are stored inside frontend/public/products/.
 */

function cleanImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const url = value.trim();
  return url || null;
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

const LOCAL_GALLERIES: Record<string, string[]> = {
  basket: [
    '/products/01_silicone_foldable_basket/image1.png',
    '/products/01_silicone_foldable_basket/image2.jpeg',
    '/products/01_silicone_foldable_basket/image3.jpeg',
    '/products/01_silicone_foldable_basket/image4.jpeg',
  ],

  petFeeder: [
    '/products/02_pet_slow_feeder_bowl_3in1/image5.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image6.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image7.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image8.jpeg',
  ],

  kitchenMat: [
    '/products/03_silicone_kitchen_mat/image12.png',
    '/products/03_silicone_kitchen_mat/image13.png',
    '/products/03_silicone_kitchen_mat/image14.jpeg',
    '/products/03_silicone_kitchen_mat/image15.jpeg',
  ],
};

function getLocalGallery(product: any): string[] | null {
  const slug = String(product?.slug ?? '').toLowerCase().trim();
  const name = String(product?.name ?? '').toLowerCase().trim();
  const text = `${slug} ${name}`;

  if (
    text.includes('foldable basket') ||
    text.includes('silicone basket')
  ) {
    return LOCAL_GALLERIES.basket;
  }

  if (
    text.includes('slow feeder') ||
    text.includes('pet feeder')
  ) {
    return LOCAL_GALLERIES.petFeeder;
  }

  if (text.includes('kitchen mat')) {
    return LOCAL_GALLERIES.kitchenMat;
  }

  return null;
}

export function getProductImage(product: any): string {
  const localGallery = getLocalGallery(product);
  if (localGallery) return localGallery[0];

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

  if (slug === 'sensory-teether-collection' || text.includes('sensory teether')) {
    return '/products/sensory-teether-collection.webp';
  }

  if (slug === 'silicone-baby-feeding-set' || text.includes('baby feeding set')) {
    return '/products/baby-feeding-set.webp';
  }

  if (slug === 'bath-toy-collection' || text.includes('bath toy')) {
    return '/products/bath-toy-collection.webp';
  }

  if (slug === 'silicone-bib-bowl-set' || text.includes('bib bowl')) {
    return '/products/silicone-bib-bowl-set.webp';
  }

  if (
    slug === 'teething-ring-collection' ||
    text.includes('koala') ||
    text.includes('teething ring')
  ) {
    return '/products/teething-ring-collection.webp';
  }

  if (
    slug === 'textured-baby-teething-toy' ||
    text.includes('bone teether') ||
    text.includes('teether')
  ) {
    return '/products/blue-textured-bone-teether.webp';
  }

  return (
    cleanImageUrl(product?.image_url) ||
    cleanImageUrl(product?.image) ||
    '/products/sensory-teether-collection.webp'
  );
}

export function getProductGallery(product: any): string[] {
  // Always use the four local files for the three mapped products.
  const localGallery = getLocalGallery(product);
  if (localGallery) return localGallery;

  const main = getProductImage(product);

  const extraImages = [
    ...extractImageUrls(product?.additional_images),
    ...extractImageUrls(product?.gallery_images),
    ...extractImageUrls(product?.image_urls),
    ...extractImageUrls(product?.images),
  ];

  return Array.from(new Set([main, ...extraImages])).slice(0, 4);
}

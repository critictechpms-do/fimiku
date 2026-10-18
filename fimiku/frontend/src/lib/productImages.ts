
/**
 * Fimiku product image helpers.
 *
 * The first image in each local gallery is the main product image.
 * Local files are stored in frontend/public/products/.
 */

function cleanImageUrl(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const url = value.trim();
  return url.length > 0 ? url : null;
}

function extractImageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item: unknown) => {
      if (typeof item === 'string') {
        return cleanImageUrl(item);
      }

      if (item !== null && typeof item === 'object') {
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
    .filter((url): url is string => url !== null);
}

const LOCAL_GALLERIES: Record<string, string[]> = {
  // Silicone Foldable Basket: image4.jpeg must be first.
  basket: [
    '/products/01_silicone_foldable_basket/image4.jpeg',
    '/products/01_silicone_foldable_basket/image1.png',
    '/products/01_silicone_foldable_basket/image2.jpeg',
    '/products/01_silicone_foldable_basket/image3.jpeg',
  ],

  // Pet Slow Feeder Bowl: image8.jpeg must be first.
  petFeeder: [
    '/products/02_pet_slow_feeder_bowl_3in1/image8.jpeg',
    '/products/02_pet_slow_feeder_bowl_3in1/image5.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image6.png',
    '/products/02_pet_slow_feeder_bowl_3in1/image7.png',
  ],

  // Silicone Kitchen Mat: image14.jpeg must be first.
  kitchenMat: [
    '/products/03_silicone_kitchen_mat/image14.jpeg',
    '/products/03_silicone_kitchen_mat/image12.png',
    '/products/03_silicone_kitchen_mat/image13.png',
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
  // Use the first local image for the three mapped products.
  const localGallery = getLocalGallery(product);

  if (localGallery !== null) {
    return localGallery[0];
  }

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
  if (
    slug === 'sensory-teether-collection' ||
    text.includes('sensory teether')
  ) {
    return '/products/sensory-teether-collection.webp';
  }

  // Baby feeding set.
  if (
    slug === 'silicone-baby-feeding-set' ||
    text.includes('baby feeding set')
  ) {
    return '/products/baby-feeding-set.webp';
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

  // Textured teething toy.
  if (
    slug === 'textured-baby-teething-toy' ||
    text.includes('bone teether') ||
    text.includes('teether')
  ) {
    return '/products/blue-textured-bone-teether.webp';
  }

  // Preserve the backend image for other products.
  return (
    cleanImageUrl(product?.image_url) ??
    cleanImageUrl(product?.image) ??
    '/products/sensory-teether-collection.webp'
  );
}

export function getProductGallery(product: any): string[] {
  // Return exactly four ordered local images for mapped products.
  const localGallery = getLocalGallery(product);

  if (localGallery !== null) {
    return [...localGallery];
  }

  // Preserve API-provided galleries for other products.
  const mainImage = getProductImage(product);

  const extraImages = [
    ...extractImageUrls(product?.additional_images),
    ...extractImageUrls(product?.gallery_images),
    ...extractImageUrls(product?.image_urls),
    ...extractImageUrls(product?.images),
  ];

  return Array.from(new Set([mainImage, ...extraImages])).slice(0, 4);
}

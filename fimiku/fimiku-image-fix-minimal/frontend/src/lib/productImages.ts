
const LOCAL_IMAGES = {
  blueTeether: '/products/blue-textured-bone-teether.webp',
  sensoryTeether: '/products/sensory-teether-collection.webp',
  babyFeeding: '/products/baby-feeding-set.webp',
  bath: '/products/bath-toy-collection.webp',
  bibBowl: '/products/silicone-bib-bowl-set.webp',
  teethingRing: '/products/teething-ring-collection.webp',
  stacking: '/products/sensory-stacking-toy-set.webp',
  basket: '/products/01_silicone_foldable_basket/image1.png',
  petFeeder: '/products/02_pet_slow_feeder_bowl_3in1/image1.png',
  kitchenMat: '/products/03_silicone_kitchen_mat/image1.png',
} as const;

export function getProductImage(product: any): string {
  const slug = String(product?.slug ?? '').toLowerCase();
  const name = String(product?.name ?? '').toLowerCase();
  const text = `${slug} ${name}`;
  const category = String(product?.category_slug ?? '').toLowerCase();

  // Match specific products before generic category rules.
  if (text.includes('foldable basket') || text.includes('silicone-foldable-basket')) {
    return LOCAL_IMAGES.basket;
  }

  if (text.includes('slow feeder') || text.includes('pet feeder')) {
    return LOCAL_IMAGES.petFeeder;
  }

  if (text.includes('kitchen mat')) {
    return LOCAL_IMAGES.kitchenMat;
  }

  if (text.includes('silicone baby feeding set')) {
    return LOCAL_IMAGES.babyFeeding;
  }

  if (text.includes('foldable tub')) {
    return LOCAL_IMAGES.bath;
  }

  if (text.includes('koala') || text.includes('textured teething ring')) {
    return LOCAL_IMAGES.teethingRing;
  }

  if (text.includes('stacking tower') || text.includes('stacking')) {
    return LOCAL_IMAGES.stacking;
  }

  if (text.includes('sensory teether') || text.includes('sensory teeth')) {
    return LOCAL_IMAGES.sensoryTeether;
  }

  if (text.includes('teething ring')) {
    return LOCAL_IMAGES.teethingRing;
  }

  if (text.includes('bone teether') || text.includes('teether')) {
    return LOCAL_IMAGES.blueTeether;
  }

  if (category === 'bath') return LOCAL_IMAGES.bath;
  if (category === 'feeding') return LOCAL_IMAGES.babyFeeding;
  if (category === 'sensory') return LOCAL_IMAGES.sensoryTeether;
  if (category === 'teethers') return LOCAL_IMAGES.blueTeether;
  if (category === 'kitchen') return LOCAL_IMAGES.kitchenMat;
  if (category === 'baby-play') return LOCAL_IMAGES.sensoryTeether;

  return product?.image_url || LOCAL_IMAGES.sensoryTeether;
}

export function getProductGallery(product: any): string[] {
  const main = getProductImage(product);
  const extra = Array.isArray(product?.additional_images)
    ? product.additional_images.filter(Boolean)
    : [];
  return Array.from(new Set([main, ...extra]));
}

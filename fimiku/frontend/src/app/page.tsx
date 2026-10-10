'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Droplets,
  Heart,
  Leaf,
  Mail,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { api } from '@/lib/api';
import { getProductImage } from '@/lib/productImages';
import { ProductType, useCart } from '@/context/CartContext';

const categories = [
  { title: 'Teething Toys', href: '/shop?category=teethers', image: '/products/teething-ring-collection.webp', note: 'Gentle relief for little gums' },
  { title: 'Bath Toys', href: '/shop?category=bath', image: '/products/bath-toy-collection.webp', note: 'Make a splash at bath time' },
  { title: 'Feeding Accessories', href: '/shop?category=feeding', image: '/products/baby-feeding-set.webp', note: 'Little tools for big milestones' },
  { title: 'Sensory Play', href: '/shop?category=sensory', image: '/products/sensory-stacking-toy-set.webp', note: 'Explore, stack and discover' },
  { title: 'Baby Play', href: '/shop?category=baby-play', image: '/products/sensory-teether-collection.webp', note: 'Made for curious hands' },
  { title: 'Pull Toys', href: '/shop?search=pull', image: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&q=85&w=500', note: 'Little toys ready to roll' },
  { title: 'Mealtime Essentials', href: '/shop?category=feeding', image: '/products/silicone-bib-bowl-set.webp', note: 'A softer start to solids' },
];

const ageGroups = [
  { title: '0–12 Months', description: 'Soft first discoveries, soothing teethers and everyday essentials.', href: '/shop?category=teethers', image: '/products/teething-ring-collection.webp', tone: 'bg-[#f5f0ff]' },
  { title: '1–3 Years', description: 'Independent little eaters and busy hands ready to explore.', href: '/shop?category=feeding', image: '/products/baby-feeding-set.webp', tone: 'bg-[#fff1f2]' },
  { title: '3+ Years', description: 'Open-ended play for growing imaginations and big ideas.', href: '/shop?category=sensory', image: '/products/sensory-stacking-toy-set.webp', tone: 'bg-[#eff8f4]' },
];

const trustFeatures = [
  { title: 'Verified Safety', text: 'Thoughtful materials for the things little ones love to explore.', icon: ShieldCheck },
  { title: 'Silicone Focused', text: 'A considered collection centred on soft, food-grade silicone.', icon: Droplets },
  { title: 'Eco-Friendly Choices', text: 'Durable everyday favourites designed to be used again and again.', icon: Leaf },
  { title: 'Made for Everyday', text: 'Easy-care essentials that fit real family routines.', icon: PackageCheck },
  { title: 'Thoughtfully Designed', text: 'Gentle textures, useful details and joyful colours.', icon: Sparkles },
  { title: 'For Little Hands', text: 'Comfortable shapes made for small hands to hold and explore.', icon: Heart },
];

const faqItems = [
  { question: 'What materials are Fimiku products made from?', answer: 'Product materials are listed on each item page. Our silicone collection is made with food-grade silicone; please check the individual product details for the material and care information.' },
  { question: 'How should I clean silicone toys and feeding accessories?', answer: 'Wash with warm water and mild soap, then dry thoroughly. Always follow the care guidance included with the specific product.' },
  { question: 'How do I choose a product for my child’s age?', answer: 'Use the age guidance shown on each product page and packaging. Adult supervision is recommended during play and mealtimes.' },
  { question: 'Where can I find shipping information?', answer: 'Available delivery options and estimated timings are shown during checkout after you enter your delivery address.' },
  { question: 'What is the returns policy?', answer: 'Please visit our About page or contact the Fimiku team for the current return and exchange policy before placing your order.' },
];

const sampleTestimonials = [
  { quote: 'The colours are lovely and the details feel really considered. A sweet addition to our play shelf.', name: 'A happy Fimiku family' },
  { quote: 'Easy to care for and just the kind of simple, useful design we look for in everyday essentials.', name: 'A Fimiku customer' },
  { quote: 'A thoughtful little gift for a new arrival. The soft colours and playful shapes are beautiful.', name: 'A Fimiku gift-giver' },
];

function catalogProducts(data: unknown): ProductType[] {
  const products = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)
      ? data.results
      : [];

  const seenProducts = new Set<string>();

  return (products as ProductType[])
    .filter((product) => product.is_active !== false && product.is_in_stock !== false)
    .filter((product) => {
      const category = `${product.category_slug ?? ''} ${product.category_name ?? product.category?.name ?? ''}`.toLowerCase();
      const productName = `${product.name} ${product.slug}`.toLowerCase();
      return !category.includes('pet') && !category.includes('kitchen') && !productName.includes('pet');
    })
    .filter((product) => {
      const key = (product.slug || String(product.id)).toLowerCase();
      if (seenProducts.has(key)) {
        return false;
      }
      seenProducts.add(key);
      return true;
    })
    .slice(0, 6);
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterError, setNewsletterError] = useState(false);
  const { addToCart } = useCart();

  const loadProducts = async () => {
    setProductsLoading(true);
    setProductsError(false);
    try {
      const response = await api.get('/products/');
      setProducts(catalogProducts(response.data));
    } catch (error) {
      console.error('Failed to load homepage products:', error);
      setProductsError(true);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  const submitNewsletter = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setNewsletterError(true);
      setNewsletterMessage('Please enter a valid email address.');
      return;
    }
    setNewsletterError(false);
    setNewsletterMessage('Thanks! Your email is valid, but newsletter sign-up is not connected yet.');
    setEmail('');
  };

  return (
    <div className="pb-16">
      <section className="mx-auto max-w-[1320px] px-4 pb-8 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        <div className="relative grid min-h-[440px] overflow-hidden rounded-[30px] bg-[#f6f0ff] shadow-[0_18px_50px_rgba(84,58,121,.09)] lg:grid-cols-[.92fr_1.08fr]">
          <div className="relative z-10 flex items-center px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
            <div className="max-w-[510px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e5d8f8] bg-white/85 px-3.5 py-2 text-[11px] font-bold uppercase tracking-[.13em] text-[#7955a7]">
                <Heart className="h-3.5 w-3.5 fill-current" /> Made for little beginnings
              </div>
              <h1 className="text-[2.55rem] font-semibold leading-[1.08] tracking-[-.045em] text-[#29263a] sm:text-5xl xl:text-[3.65rem]">
                The safest choice for <span className="text-[#8c69bd]">happy little ones.</span>
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#6d6879] sm:text-base">
                Thoughtful silicone toys and everyday essentials, made to bring a little more joy to growing up.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/shop" className="inline-flex items-center gap-2 rounded-full bg-[#8c69bd] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#7653a7]">
                  Shop the collection <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="#bestsellers" className="rounded-full border border-[#d9c9ed] bg-white px-6 py-3.5 text-sm font-semibold text-[#514560] transition hover:bg-[#fbf8ff]">
                  Meet the favourites
                </Link>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#6f6480]">
                {['Soft, thoughtful designs', 'Made for everyday moments', 'Carefully chosen materials'].map((label) => (
                  <span key={label} className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-[#7c9d77]" />{label}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="relative min-h-[280px] lg:min-h-[500px]">
            <img
              src="https://images.unsplash.com/photo-1718471965121-71aa23c82941?auto=format&fit=crop&q=85&w=1400"
              alt="A baby exploring a colourful teething toy in a high chair"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#f6f0ff] via-[#f6f0ff]/30 to-transparent lg:w-1/3" />
            <div className="absolute bottom-5 right-5 flex items-center gap-3 rounded-2xl border border-white/70 bg-white/95 p-3 shadow-lg sm:bottom-8 sm:right-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f3edff] text-[#8c69bd]"><Sparkles className="h-5 w-5" /></div>
              <div><p className="text-xs font-bold text-[#302b3d]">Made for little smiles</p><p className="mt-0.5 text-[11px] text-[#81798c]">Play, grow, repeat</p></div>
            </div>
          </div>
        </div>
      </section>

      <section id="bestsellers" className="mx-auto max-w-[1320px] scroll-mt-28 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div><p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#9274b8]">Little favourites</p><h2 className="text-2xl font-semibold tracking-tight text-[#29263a] sm:text-3xl">Best sellers</h2><p className="mt-2 text-sm text-[#777181]">Loved little essentials, chosen from our collection.</p></div>
          <Link href="/shop" className="hidden items-center gap-1 text-sm font-semibold text-[#7955a7] hover:text-[#56377d] sm:inline-flex">Shop all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">{Array.from({ length: 6 }, (_, index) => <div key={index} className="aspect-[.78] animate-pulse rounded-2xl bg-[#f0edf3]" />)}</div>
        ) : productsError ? (
          <div className="rounded-2xl border border-[#eadff2] bg-white p-8 text-center">
            <p className="font-semibold text-[#383345]">We couldn’t load the collection just now.</p><button onClick={() => void loadProducts()} className="mt-3 text-sm font-semibold text-[#7955a7] underline underline-offset-4">Try again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-[#eadff2] bg-white p-8 text-center"><p className="font-semibold text-[#383345]">No favourites are available at the moment.</p><Link href="/shop" className="mt-3 inline-block text-sm font-semibold text-[#7955a7] underline underline-offset-4">Explore the shop</Link></div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-6">
            {products.map((product) => (
              <article key={product.id} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#eee9f1] bg-white transition hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(61,45,84,.09)]">
                <Link href={`/product/${product.id}`} className="relative block aspect-square overflow-hidden bg-[#f8f5fa]">
                  <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" loading="lazy" />
                  {product.is_featured && <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wide text-[#78569d]">Favourite</span>}
                </Link>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-[.1em] text-[#9a83b5]">{product.category_name ?? product.category?.name ?? 'Fimiku favourite'}</p>
                  <Link href={`/product/${product.id}`} className="line-clamp-2 min-h-10 text-xs font-semibold leading-5 text-[#302b3d] hover:text-[#7955a7] sm:text-sm">{product.name}</Link>
                  <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-[#898391]">{product.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-[#f0edf2] pt-3">
                    <span className="text-sm font-bold text-[#302b3d]">₹{product.discount_price || product.final_price || product.price}</span>
                    <button onClick={() => void addToCart(product)} aria-label={`Add ${product.name} to cart`} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f4effb] text-[#7955a7] transition hover:bg-[#8c69bd] hover:text-white"><ShoppingBag className="h-4 w-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
        <Link href="/shop" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-[#7955a7] sm:hidden">Shop all <ArrowRight className="h-4 w-4" /></Link>
      </section>

      <section className="bg-[#f8f5fc] py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center"><p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#9274b8]">Find your little something</p><h2 className="text-2xl font-semibold tracking-tight text-[#29263a] sm:text-3xl">Shop by category</h2><p className="mt-2 text-sm text-[#777181]">Explore the everyday moments that make up a childhood.</p></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
            {categories.map((category) => (
              <Link key={category.title} href={category.href} className="group overflow-hidden rounded-2xl border border-[#ebe4f0] bg-white transition hover:-translate-y-1 hover:shadow-lg">
                <div className="aspect-square overflow-hidden bg-[#f4eff8]"><img src={category.image} alt={category.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" /></div>
                <div className="p-3"><h3 className="text-xs font-bold text-[#332d40] sm:text-sm">{category.title}</h3><p className="mt-1 text-[10px] leading-4 text-[#898391]">{category.note}</p><span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#7955a7]">Explore <ArrowRight className="h-3 w-3" /></span></div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8 text-center"><p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#9274b8]">Little ones, big milestones</p><h2 className="text-2xl font-semibold tracking-tight text-[#29263a] sm:text-3xl">A little something for every age</h2></div>
        <div className="grid gap-4 md:grid-cols-3">
          {ageGroups.map((group) => <article key={group.title} className={`overflow-hidden rounded-[24px] border border-black/[.04] ${group.tone}`}>
            <div className="grid min-h-[225px] grid-cols-[1fr_.9fr] items-center">
              <div className="py-6 pl-5 sm:pl-7"><span className="text-[11px] font-bold uppercase tracking-[.13em] text-[#8569a5]">For little explorers</span><h3 className="mt-2 text-xl font-semibold text-[#302b3d]">{group.title}</h3><p className="mt-2 text-xs leading-5 text-[#777181]">{group.description}</p><Link href={group.href} className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2.5 text-xs font-bold text-[#7955a7] shadow-sm transition hover:bg-[#8c69bd] hover:text-white">Shop now <ArrowRight className="h-3.5 w-3.5" /></Link></div>
              <div className="h-full min-h-[225px] overflow-hidden"><img src={group.image} alt="" className="h-full w-full object-cover" loading="lazy" /></div>
            </div>
          </article>)}
        </div>
      </section>

      <section className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-8 max-w-xl text-center"><p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#9274b8]">The Fimiku difference</p><h2 className="text-2xl font-semibold tracking-tight text-[#29263a] sm:text-3xl">Why parents choose Fimiku</h2><p className="mt-2 text-sm text-[#777181]">Little details, thoughtfully considered for everyday family life.</p></div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trustFeatures.map((feature) => <article key={feature.title} className="flex gap-4 rounded-2xl border border-[#eee9f1] bg-[#fdfcff] p-5"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f1ebfa] text-[#8565b0]"><feature.icon className="h-5 w-5" /></div><div><h3 className="text-sm font-semibold text-[#302b3d]">{feature.title}</h3><p className="mt-1 text-xs leading-5 text-[#817b89]">{feature.text}</p></div></article>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid overflow-hidden rounded-[28px] bg-[#f6f1f8] lg:grid-cols-2">
          <div className="min-h-[300px] overflow-hidden sm:min-h-[420px]"><img src="https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&q=85&w=1200" alt="A newborn’s feet nestled in a soft blanket" className="h-full w-full object-cover object-center" loading="lazy" /></div>
          <div className="flex items-center px-6 py-10 sm:px-10 lg:px-14"><div className="max-w-lg"><span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.17em] text-[#9274b8]"><Heart className="h-4 w-4" /> Our story</span><h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#29263a] sm:text-4xl">Born from a mother’s love</h2><p className="mt-5 text-sm leading-7 text-[#706a7b]">Fimiku began with a simple wish: to make the everyday things little ones touch feel softer, safer and more thoughtful. Every detail starts with care for the small moments that mean everything.</p><Link href="/about" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#8c69bd] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#7653a7]">Read our story <ArrowRight className="h-4 w-4" /></Link></div></div>
        </div>
      </section>

      <section className="bg-[#f8f5fc] py-12 sm:py-16">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center"><p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#9274b8]">A gentler everyday</p><h2 className="text-2xl font-semibold tracking-tight text-[#29263a] sm:text-3xl">Silicone vs. plastic</h2><p className="mt-2 text-sm text-[#777181]">A few things to consider when choosing little essentials.</p></div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="overflow-hidden rounded-[24px] border border-[#e9def4] bg-white">
              <div className="grid min-h-[260px] sm:grid-cols-[.9fr_1.1fr]"><img src="/products/silicone-bib-bowl-set.webp" alt="Pastel silicone bib and bowl set" className="h-full min-h-[220px] w-full object-cover" loading="lazy" /><div className="p-6 sm:p-7"><span className="inline-flex items-center gap-2 rounded-full bg-[#f0eafa] px-3 py-1.5 text-xs font-bold text-[#7955a7]"><Check className="h-4 w-4" /> Premium silicone</span><ul className="mt-5 space-y-3 text-xs leading-5 text-[#635e6d]"><li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6b9b78]" />Soft, flexible feel</li><li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6b9b78]" />Simple to wash and care for</li><li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6b9b78]" />Made for everyday routines</li></ul></div></div>
            </article>
            <article className="overflow-hidden rounded-[24px] border border-[#eee6e9] bg-white">
              <div className="grid min-h-[260px] sm:grid-cols-[.9fr_1.1fr]"><img src="https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&q=85&w=900" alt="A toddler exploring a colourful plastic toy" className="h-full min-h-[220px] w-full object-cover" loading="lazy" /><div className="p-6 sm:p-7"><span className="inline-flex items-center gap-2 rounded-full bg-[#fff0f1] px-3 py-1.5 text-xs font-bold text-[#a4626b]"><X className="h-4 w-4" /> Traditional plastic</span><ul className="mt-5 space-y-3 text-xs leading-5 text-[#635e6d]"><li className="flex gap-2"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-[#bf7b83]" />Material and care vary by product</li><li className="flex gap-2"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-[#bf7b83]" />Check age guidance and labels</li><li className="flex gap-2"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-[#bf7b83]" />Inspect regularly for wear</li></ul></div></div>
            </article>
          </div>
          <p className="mx-auto mt-4 max-w-3xl text-center text-[11px] leading-5 text-[#898391]">Materials, care and safety guidance can vary by individual product. Please refer to the product details and packaging.</p>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="mb-8 text-center"><p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#9274b8]">Notes from our community</p><h2 className="text-2xl font-semibold tracking-tight text-[#29263a] sm:text-3xl">A little love from families</h2><p className="mt-2 text-xs text-[#898391]">Sample copy shown for layout preview — not verified customer reviews.</p></div>
        <div className="grid gap-4 md:grid-cols-3">{sampleTestimonials.map((item) => <article key={item.name} className="rounded-2xl border-t-[3px] border-[#c7b1e0] bg-white p-6 shadow-[0_8px_28px_rgba(61,45,84,.06)]"><div className="flex gap-1 text-[#d19b45]" aria-label="Sample five-star rating">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-4 w-4 fill-current" />)}</div><p className="mt-4 min-h-[72px] text-sm leading-6 text-[#625d6b]">“{item.quote}”</p><p className="mt-4 border-t border-[#f0edf2] pt-3 text-xs font-semibold text-[#3b3545]">{item.name}</p><p className="mt-1 text-[10px] uppercase tracking-wide text-[#9a92a2]">Sample review</p></article>)}</div>
        <div className="mt-5 text-center"><Link href="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-[#7955a7]">Find your favourite <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <section className="bg-[#fbf9fd] py-12 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="mb-7 text-center"><p className="mb-2 text-[11px] font-bold uppercase tracking-[.18em] text-[#9274b8]">Here to help</p><h2 className="text-2xl font-semibold tracking-tight text-[#29263a] sm:text-3xl">Frequently asked questions</h2></div>
          <div className="space-y-3">{faqItems.map((item, index) => <div key={item.question} className="overflow-hidden rounded-2xl border border-[#eee9f1] bg-white">
            <h3><button type="button" id={`faq-question-${index}`} aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold text-[#383345] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#8c69bd]"><span>{item.question}</span><ChevronDown className={`h-4 w-4 shrink-0 text-[#8c69bd] transition-transform ${openFaq === index ? 'rotate-180' : ''}`} /></button></h3>
            <div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} hidden={openFaq !== index} className="border-t border-[#f0edf2] px-5 py-4 text-sm leading-6 text-[#777181]">{item.answer}</div>
          </div>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-center gap-7 rounded-[28px] bg-[#f2ecfa] px-6 py-8 sm:px-10 sm:py-10 lg:grid-cols-[1fr_1.1fr]">
          <div className="flex items-center gap-4 sm:gap-5"><div className="hidden h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-white text-[#8c69bd] sm:flex"><Mail className="h-9 w-9" /></div><div><p className="text-[11px] font-bold uppercase tracking-[.16em] text-[#9274b8]">A little joy in your inbox</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#29263a]">Get exclusive toy deals!</h2><p className="mt-2 max-w-md text-sm leading-6 text-[#777181]">Hear about new arrivals, thoughtful offers and little ideas for play.</p></div></div>
          <form noValidate onSubmit={submitNewsletter} className="flex flex-col gap-2 sm:flex-row">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input id="newsletter-email" type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setNewsletterMessage(''); setNewsletterError(false); }} placeholder="Your email address" aria-invalid={newsletterError} aria-describedby="newsletter-feedback" className="min-w-0 flex-1 rounded-full border border-[#e1d5ed] bg-white px-5 py-3.5 text-sm text-[#383345] outline-none transition placeholder:text-[#aaa3b0] focus:border-[#9a7cc1] focus:ring-2 focus:ring-[#9a7cc1]/20" />
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8c69bd] px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-[#7653a7]">Subscribe <ArrowRight className="h-4 w-4" /></button>
            {newsletterMessage && <p id="newsletter-feedback" role={newsletterError ? 'alert' : 'status'} className={`text-xs sm:basis-full ${newsletterError ? 'text-red-700' : 'text-[#685b77]'}`}>{newsletterMessage}</p>}
          </form>
        </div>
      </section>
    </div>
  );
}

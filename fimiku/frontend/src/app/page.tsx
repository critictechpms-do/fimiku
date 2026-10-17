'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Check, ChevronDown, Droplets, Heart, Leaf, Mail,
  PackageCheck, ShieldCheck, ShoppingBag, Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';
import { getProductImage } from '@/lib/productImages';
import { ProductType, useCart } from '@/context/CartContext';

const img = (name: string) => `/images/fimiku/${name}`;

const categories = [
  { title: 'Teething Toys', href: '/shop?category=teethers', image: img('teething-toys.webp') },
  { title: 'Bath Toys', href: '/shop?category=bath', image: img('bath-toys.webp') },
  { title: 'Feeding Sets', href: '/shop?category=feeding', image: img('feeding-accessories.webp') },
  { title: 'Sensory Play', href: '/shop?category=sensory', image: img('sensory-play.webp') },
  { title: 'Baby Play', href: '/shop?category=baby-play', image: img('baby-play.webp') },
  { title: 'Pet Toys', href: '/shop?search=pet', image: img('pet-toys.webp') },
  { title: 'All-time Classics', href: '/shop', image: '/products/teething-ring-collection.webp' },
];

const ages = [
  { title: 'Shop toys for ages 0–12 months', href: '/shop?category=teethers', image: img('teething-toys.webp') },
  { title: 'Shop toys for ages 1–3 years', href: '/shop?category=feeding', image: img('product-feeding-set.webp') },
  { title: 'Shop toys for ages 3 years and up', href: '/shop?category=sensory', image: img('age-3-plus.webp') },
];

const trust = [
  { title: 'Thoughtful Materials', text: 'Considered material choices for everyday little moments.', icon: ShieldCheck },
  { title: 'Silicone Focused', text: 'Soft, useful essentials designed for everyday routines.', icon: Droplets },
  { title: 'Eco-Friendly Choices', text: 'Durable favourites made to be used again and again.', icon: Leaf },
  { title: 'Built for Real Life', text: 'Easy-care products that fit busy family days.', icon: PackageCheck },
  { title: 'Parent & Kid Friendly', text: 'Comfortable shapes and playful colours for little hands.', icon: Heart },
  { title: 'Safe for Gifting', text: 'Thoughtful picks for birthdays and new arrivals.', icon: Sparkles },
];

const faqs = [
  { q: 'Are Fimiku products suitable for newborns?', a: 'Check the age guidance and material details on each product page and packaging before use.' },
  { q: 'How do I clean and maintain the products?', a: 'Wash according to the care guidance supplied with the product, and dry thoroughly before storing.' },
  { q: 'Do you offer returns or exchanges?', a: 'Please review the current returns policy on the website or contact the Fimiku team for help.' },
  { q: 'How can I track my order?', a: 'Use the order details available in your account, or contact support if you need help with delivery.' },
];

const reviews = [
  { quote: 'Lovely colours and thoughtful details. A sweet addition to our play shelf.', name: 'A happy Fimiku family' },
  { quote: 'Easy to care for and just the kind of useful design we look for every day.', name: 'A Fimiku customer' },
  { quote: 'A thoughtful little gift for a new arrival. The soft colours are beautiful.', name: 'A Fimiku gift-giver' },
];

function normalizeProducts(data: unknown): ProductType[] {
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)
      ? data.results
      : [];

  return (list as ProductType[])
    .filter((p) => p.is_active !== false && p.is_in_stock !== false)
    .filter((p) => {
      const category = `${p.category_slug ?? ''} ${p.category_name ?? p.category?.name ?? ''}`.toLowerCase();
      const name = `${p.name ?? ''} ${p.slug ?? ''}`.toLowerCase();
      return !category.includes('pet') && !category.includes('kitchen') && !name.includes('pet');
    })
    .filter((p, i, all) => all.findIndex((x) => (x.slug || String(x.id)) === (p.slug || String(p.id))) === i)
    .slice(0, 6);
}

export default function HomePage() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [email, setEmail] = useState('');
  const [newsletterMessage, setNewsletterMessage] = useState('');
  const [newsletterError, setNewsletterError] = useState(false);
  const { addToCart } = useCart();

  async function loadProducts() {
    setLoading(true);
    setLoadError(false);
    try {
      const response = await api.get('/products/');
      setProducts(normalizeProducts(response.data));
    } catch (error) {
      console.error('Failed to load homepage products:', error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  function submitNewsletter(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setNewsletterError(true);
      setNewsletterMessage('Please enter a valid email address.');
      return;
    }
    setNewsletterError(false);
    setNewsletterMessage('Thanks! Newsletter sign-up is not connected yet.');
    setEmail('');
  }

  return (
    <main className="pb-8 text-[#29263a]">
      {/* Hero */}
      <section className="mx-auto max-w-[1320px] px-3 pt-3 sm:px-5 lg:px-8">
        <div className="relative grid min-h-[390px] overflow-hidden rounded-[22px] bg-[#f7f1ff] shadow-[0_14px_40px_rgba(84,58,121,.08)] md:grid-cols-[.82fr_1.18fr] lg:min-h-[450px]">
          <div className="relative z-10 flex items-center px-6 py-9 sm:px-10 lg:px-12">
            <div className="max-w-[430px]">
              <span className="mb-3 inline-flex rounded-full border border-[#e7d9ff] bg-white/90 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[.14em] text-[#8055bd]">
                <Sparkles size={12} className="mr-1.5" /> Made for little beginnings
              </span>
              <h1 className="text-[2.35rem] font-bold leading-[1.02] tracking-[-.045em] sm:text-5xl">
                The Safest Choice<br />for<br /><span className="text-[#9361f6]">Happy Little Ones</span>
              </h1>
              <p className="mt-4 max-w-sm text-xs leading-6 text-[#6e687c] sm:text-sm">
                Premium food-grade silicone toys that are BPA-free, ultra-soft, and designed for your baby’s ultimate comfort.
              </p>
              <div className="mt-5 flex flex-wrap gap-2.5">
                <Link href="/shop" className="inline-flex items-center gap-2 rounded-full bg-[#8b55f6] px-5 py-3 text-xs font-bold text-white shadow-sm hover:bg-[#7441dc]">
                  Shop Now <ArrowRight size={14} />
                </Link>
                <Link href="#bestsellers" className="inline-flex items-center gap-2 rounded-full border border-[#dfd2f6] bg-white px-5 py-3 text-xs font-bold text-[#4e435f] hover:bg-[#faf7ff]">
                  View Best Sellers
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-medium text-[#6c647b]">
                {['BPA-free', 'Dishwasher Safe', 'Food-Grade'].map((x) => (
                  <span key={x} className="inline-flex items-center gap-1"><Check size={12} className="text-[#8c5af1]" />{x}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="relative min-h-[270px] md:min-h-[390px] lg:min-h-[450px]">
            <picture className="absolute inset-0">
              <source media="(min-width: 768px)" srcSet={img('hero-baby.png')} />
              <img src={img('hero-baby.png')} alt="Baby holding a soft sage silicone teether" className="h-full w-full object-cover object-[65%_center]" />
            </picture>
            <div className="absolute inset-y-0 left-0 hidden w-[22%] bg-[#f7f1ff] md:block" />
            <div className="absolute inset-y-0 left-[22%] hidden w-[28%] bg-gradient-to-r from-[#f7f1ff] to-transparent md:block" />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-b border-[#f0eaf7] py-3 text-[10px] font-semibold text-[#635a71] sm:gap-x-9">
          {categories.map((category) => (
            <Link key={category.title} href={category.href} className="hover:text-[#8b55f6]">{category.title}</Link>
          ))}
        </div>
      </section>

      {/* Best sellers */}
      <section id="bestsellers" className="mx-auto max-w-[1320px] px-3 py-8 sm:px-5 lg:px-8">
        <div className="mb-6 text-center">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[.18em] text-[#9274b8]">Little favourites</p>
          <h2 className="text-xl font-bold sm:text-2xl">Best Sellers</h2>
          <p className="mt-1 text-[11px] text-[#8b8297]">Our most loved products, chosen by parents</p>
          <Link href="/shop" className="mt-2 inline-flex items-center text-[10px] font-semibold text-[#8b55f6]">View All Products <ArrowRight size={12} className="ml-1" /></Link>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => <div key={i} className="aspect-[.9] animate-pulse rounded-xl bg-[#f2edf7]" />)}
          </div>
        ) : loadError ? (
          <div className="rounded-xl border bg-white p-6 text-center text-sm">
            We couldn’t load products. <button className="text-[#8b55f6] underline" onClick={() => void loadProducts()}>Try again</button>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-xl border bg-white p-6 text-center text-sm">
            No products are available. <Link href="/shop" className="text-[#8b55f6] underline">Explore the shop</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
            {products.map((product) => (
              <article key={product.id} className="group flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#eee8f4] bg-white transition hover:-translate-y-0.5 hover:shadow-lg">
                <Link href={`/product/${product.id}`} className="block aspect-square overflow-hidden bg-[#faf7fc]">
                  <img src={getProductImage(product)} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                </Link>
                <div className="flex flex-1 flex-col p-3">
                  <p className="line-clamp-2 min-h-9 text-[11px] font-semibold leading-4">{product.name}</p>
                  {typeof product.average_rating === 'number' && (product.reviews_count ?? product.reviews?.length ?? 0) > 0 ? (
                    <div className="mt-1 text-[10px] text-[#e99c23]" aria-label={`${product.average_rating.toFixed(1)} out of 5 stars from ${product.reviews_count ?? product.reviews?.length} reviews`}>
                      {'★'.repeat(Math.max(0, Math.min(5, Math.round(product.average_rating))))}
                      {'☆'.repeat(5 - Math.max(0, Math.min(5, Math.round(product.average_rating))))}
                      <span className="ml-1 text-[#9a91a4]">({product.reviews_count ?? product.reviews?.length})</span>
                    </div>
                  ) : <div className="mt-1 text-[10px] text-[#9a91a4]">No reviews yet</div>}
                  <div className="mt-auto flex items-center justify-between pt-3">
                    <span className="text-xs font-bold">₹{product.discount_price || product.final_price || product.price}</span>
                    <button onClick={() => void addToCart(product)} aria-label={`Add ${product.name} to cart`} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f3edff] text-[#8250e8] hover:bg-[#8b55f6] hover:text-white">
                      <ShoppingBag size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-[#faf6ff] py-9 sm:py-12">
        <div className="mx-auto max-w-[1180px] px-3 sm:px-5">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold">Shop by Category</h2>
            <p className="mt-1 text-[11px] text-[#8b8297]">Explore our wide range of baby essentials</p>
          </div>
          <div className="grid grid-cols-2 items-stretch gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
            {categories.map((c) => (
              <Link key={c.title} href={c.href} className="group flex min-w-0 flex-col overflow-hidden rounded-lg border border-[#eee5f7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="aspect-square w-full shrink-0 overflow-hidden bg-[#f7f2fb]">
                  <img src={c.image} alt={c.title} className="block h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                </div>
                <h3 className="flex min-h-[42px] flex-1 items-center justify-center px-2 py-2 text-center text-[11px] font-semibold">{c.title}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Age group cards - consistent dimensions prevent uneven image heights */}
      <section className="bg-[#faf6ff] px-3 py-9 sm:px-5 sm:py-12">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold sm:text-2xl">Shop by Age Group</h2>
            <p className="mt-1 text-[11px] text-[#8b8297]">Find the perfect products for every stage of growth</p>
          </div>
          <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ages.map((a) => (
              <Link key={a.title} href={a.href} aria-label={a.title} className="group block min-w-0 overflow-hidden rounded-xl border border-[#eee5f7] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="aspect-[4/3] w-full overflow-hidden bg-[#f2edf8]">
                  <img src={a.image} alt={a.title} className="block h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="px-3 py-3 text-center">
                  <h3 className="text-sm font-semibold text-[#29263a]">{a.title}</h3>
                  <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#8b55f6]">Shop now <ArrowRight size={13} /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="bg-[#faf6ff] px-3 pb-10 sm:px-5">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-5 text-center">
            <span className="rounded-full bg-[#eadfff] px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-[#8055bd]">Trusted by little-love experts</span>
            <h2 className="mt-3 text-xl font-bold">Why Parents Trust Us?</h2>
            <p className="mt-1 text-[11px] text-[#8b8297]">Safe, thoughtful and parent-approved — because your child’s safety means everything.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {trust.map((f) => (
              <article key={f.title} className="rounded-xl border border-[#eee7f6] bg-white px-5 py-6 text-center shadow-sm">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0e7ff] text-[#8b55f6]"><f.icon size={21} /></div>
                <h3 className="mt-3 text-xs font-bold">{f.title}</h3>
                <p className="mx-auto mt-1 max-w-[250px] text-[10px] leading-4 text-[#827a8e]">{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="bg-[#faf6ff] px-3 pb-10 sm:px-5">
        <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-xl bg-white md:grid-cols-2">
          <img src={img('mother-baby.webp')} alt="Parent gently holding a baby's feet" className="h-64 w-full object-cover sm:h-80" loading="lazy" />
          <div className="flex items-center px-6 py-7 sm:px-10">
            <div>
              <h2 className="text-xl font-bold">Born from a Mother’s Love</h2>
              <p className="mt-3 text-xs leading-6 text-[#777181]">At Fimiku, we believe every child deserves a safe, happy and healthy start. Our journey began with a simple mission — to create thoughtful essentials that support everyday moments, from playtime to mealtime and beyond.</p>
              <Link href="/about" className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#8b55f6] px-5 py-2.5 text-xs font-bold text-white">Our Story <ArrowRight size={14} /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* Silicone vs plastic comparison */}
      <section className="bg-[#faf6ff] py-10 sm:py-12">
        <div className="mx-auto max-w-[1180px] px-3 sm:px-5">
          <div className="mb-6 text-center">
            <h2 className="text-xl font-bold">Silicone vs. Plastic</h2>
            <p className="mt-1 text-[11px] text-[#8b8297]">A considered comparison for everyday essentials.</p>
          </div>
          <img src={img('silicone-vs-plastic.jpg')} alt="Comparison of premium silicone and traditional plastic" className="mx-auto block h-auto w-full max-w-[850px] rounded-xl" loading="lazy" />
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[#faf6ff] px-3 py-9 sm:px-5">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-5 text-center">
            <h2 className="text-xl font-bold">♡ What Parents Say</h2>
            <p className="mt-1 text-[11px] text-[#8b8297]">Sample copy for the page layout</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {reviews.map((r) => (
              <article key={r.name} className="rounded-xl border-t-2 border-[#a27bff] bg-white p-4 shadow-sm">
                <div className="text-xs tracking-widest text-[#eea323]">★★★★★</div>
                <p className="mt-3 text-xs leading-5 text-[#696273]">“{r.quote}”</p>
                <p className="mt-3 border-t border-[#f0edf2] pt-3 text-[10px] font-bold">{r.name}</p>
                <p className="mt-1 text-[9px] text-[#958b9f]">Sample review</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-3 py-9 sm:px-5">
        <div className="mb-5 text-center"><h2 className="text-xl font-bold">Frequently Asked Questions</h2></div>
        <div className="space-y-2">
          {faqs.map((f, i) => (
            <div key={f.q} className="overflow-hidden rounded-lg border border-[#eee7f6] bg-white">
              <button type="button" aria-expanded={openFaq === i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-xs font-semibold">
                <span>{f.q}</span>
                <ChevronDown size={15} className={`shrink-0 text-[#8b55f6] transition ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && <p className="border-t border-[#f1edf5] px-4 py-3 text-xs leading-5 text-[#777181]">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* Newsletter */}
      <section className="mx-auto max-w-[1180px] px-3 pb-10 sm:px-5">
        <div className="grid items-center gap-5 rounded-xl bg-[#f6efff] p-5 sm:p-8 md:grid-cols-[1fr_1fr]">
          <div className="flex items-center gap-4">
            <div className="hidden h-14 w-14 items-center justify-center rounded-xl bg-white text-[#8b55f6] sm:flex"><Mail size={28} /></div>
            <div>
              <h2 className="text-lg font-bold">🎁 Get Exclusive Toy Deals!</h2>
              <p className="mt-1 text-xs text-[#777181]">Subscribe for new arrivals, thoughtful offers and little ideas for play.</p>
            </div>
          </div>
          <form noValidate onSubmit={submitNewsletter} className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <label htmlFor="newsletter-email" className="sr-only">Email address</label>
            <input id="newsletter-email" type="email" value={email} onChange={(e) => { setEmail(e.target.value); setNewsletterMessage(''); setNewsletterError(false); }} placeholder="Enter your email address..." className="min-w-0 flex-1 rounded-full border border-[#e1d5ed] bg-white px-4 py-3 text-xs outline-none focus:border-[#9a7cc1]" aria-invalid={newsletterError} />
            <button type="submit" className="rounded-full bg-[#8b55f6] px-5 py-3 text-xs font-bold text-white hover:bg-[#7441dc]">Subscribe</button>
            {newsletterMessage && <p role={newsletterError ? 'alert' : 'status'} className={`text-xs sm:basis-full ${newsletterError ? 'text-red-700' : 'text-[#685b77]'}`}>{newsletterMessage}</p>}
          </form>
        </div>
      </section>
    </main>
  );
}

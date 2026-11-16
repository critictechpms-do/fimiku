
import React from 'react';
import Link from 'next/link';
import { Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-fimiku-softLavender border-t border-fimiku-lightBorder text-fimiku-darkText pt-16 pb-12">
      <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-6 2xl:px-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Brand Information */}
        <div className="space-y-4 lg:col-span-2">
          <Link href="/" className="inline-block group">
            <img
              src="/logo-transparent.png"
              alt="Fimiku - Gentle care for little beginnings"
              className="h-14 sm:h-16 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          <p className="text-xs text-fimiku-secondaryText leading-relaxed max-w-sm">
            Premium baby brand dedicated to creating safe, soft, and pure silicone toys designed for your baby’s everyday comfort.
          </p>
        </div>

        {/* Quick Links */}
        <div className="space-y-3">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-fimiku-darkText">Quick Links</h4>
          <ul className="space-y-2 text-xs text-fimiku-secondaryText">
            <li><Link href="/" className="hover:text-fimiku-primary transition">Home</Link></li>
            <li><Link href="/shop" className="hover:text-fimiku-primary transition">All Toys</Link></li>
            <li><Link href="/about" className="hover:text-fimiku-primary transition">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-fimiku-primary transition">Contact</Link></li>
          </ul>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-fimiku-darkText">Categories</h4>
          <ul className="space-y-2 text-xs text-fimiku-secondaryText">
            <li><Link href="/shop?category=teethers" className="hover:text-fimiku-primary transition">Teething Toys</Link></li>
            <li><Link href="/shop?category=bath" className="hover:text-fimiku-primary transition">Bath Toys</Link></li>
            <li><Link href="/shop?category=feeding" className="hover:text-fimiku-primary transition">Feeding Accessories</Link></li>
            <li><Link href="/shop?category=sensory" className="hover:text-fimiku-primary transition">Sensory Learning</Link></li>
            <li><Link href="/shop?category=kitchen" className="hover:text-fimiku-primary transition">Kitchen Silicone</Link></li>
          </ul>
        </div>

        {/* Support & Contact */}
        <div className="space-y-3">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-fimiku-darkText">Support</h4>
          <ul className="space-y-2 text-xs text-fimiku-secondaryText">
            <li><Link href="/about" className="hover:text-fimiku-primary transition">Terms & Conditions</Link></li>
            <li><Link href="/about" className="hover:text-fimiku-primary transition">Privacy Policy</Link></li>
            <li><Link href="/about" className="hover:text-fimiku-primary transition">Refund Policy</Link></li>
            <li><Link href="/about" className="hover:text-fimiku-primary transition">Shipping Policy</Link></li>
          </ul>

          <div className="pt-2 space-y-1.5 text-xs text-fimiku-secondaryText border-t border-fimiku-lightBorder/80">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-fimiku-cta" />
              <span>support@fimiku.com</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-fimiku-cta" />
              <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-fimiku-cta" />
              <span>Chennai, Tamil Nadu, India</span>
            </div>
          </div>
        </div>

      </div>

      <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-6 2xl:px-10 mt-12 pt-6 border-t border-fimiku-lightBorder flex flex-col sm:flex-row justify-between items-center text-xs text-fimiku-grayText gap-4">
        <p>© 2026 Fimiku. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> in India
        </p>
      </div>
    </footer>
  );
}

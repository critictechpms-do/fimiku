'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  LogOut,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import AIAssistantModal from './AIAssistantModal';
import AuthModal from './AuthModal';

const categoryLinks = [
  { label: 'All toys', href: '/shop' },
  { label: 'Teething toys', href: '/shop?category=teethers' },
  { label: 'Bath toys', href: '/shop?category=bath' },
  { label: 'Feeding', href: '/shop?category=feeding' },
  { label: 'Sensory play', href: '/shop?category=sensory' },
  { label: 'Baby play', href: '/shop?category=baby-play' },
  { label: 'Our story', href: '/about' },
];

export default function Navbar() {
  const { cart, wishlist } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authDropdown, setAuthDropdown] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const openAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
    setAuthDropdown(false);
    setMobileMenuOpen(false);
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      window.location.href = `/shop?search=${encodeURIComponent(query)}`;
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[#eee8f3] bg-white/95 shadow-[0_3px_18px_rgba(50,36,69,.04)] backdrop-blur-md">
        <div className="mx-auto grid h-[72px] max-w-[1320px] grid-cols-[1fr_auto] items-center gap-3 px-4 sm:h-[82px] sm:px-6 lg:grid-cols-[210px_minmax(280px,1fr)_210px] lg:px-8">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#51485d] hover:bg-[#f4eff9] lg:hidden"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Link href="/" className="flex min-w-0 items-center">
              <img src="/logo-transparent.png" alt="Fimiku" className="h-11 w-auto object-contain sm:h-[52px]" />
            </Link>
          </div>

          <form onSubmit={submitSearch} role="search" className="hidden h-11 items-center rounded-full border border-[#e9e2ef] bg-[#fbf9fc] px-4 transition focus-within:border-[#b49bce] focus-within:bg-white lg:flex">
            <Search className="h-4 w-4 shrink-0 text-[#90869b]" />
            <input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} aria-label="Search products" placeholder="Search toys, teethers and more..." className="ml-3 min-w-0 flex-1 bg-transparent text-sm text-[#302b3d] outline-none placeholder:text-[#a19aaa]" />
            <button type="submit" className="ml-2 text-xs font-semibold text-[#7955a7] hover:text-[#56377d]">Search</button>
          </form>

          <div className="flex items-center justify-end gap-1 sm:gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="flex h-9 w-9 items-center justify-center rounded-full text-[#51485d] transition hover:bg-[#f4eff9] lg:hidden" aria-label="Search products" aria-expanded={searchOpen}><Search className="h-5 w-5" /></button>
            <button onClick={() => setIsAiOpen(true)} className="hidden h-9 items-center gap-1.5 rounded-full bg-[#f4eff9] px-3 text-xs font-semibold text-[#7955a7] transition hover:bg-[#ebe2f5] sm:flex" title="Fimiku AI Advisor"><Sparkles className="h-4 w-4" /><span className="hidden xl:inline">AI Advisor</span></button>
            <Link href="/wishlist" className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#51485d] transition hover:bg-[#f4eff9]" aria-label={`Wishlist, ${wishlist.length} items`}>
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8c69bd] px-1 text-[9px] font-bold text-white">{wishlist.length}</span>}
            </Link>
            <div className="relative">
              <button onClick={() => isAuthenticated ? setAuthDropdown(!authDropdown) : openAuth('login')} className="flex h-9 w-9 items-center justify-center rounded-full text-[#51485d] transition hover:bg-[#f4eff9]" aria-label={isAuthenticated && user ? `Account for ${user.username}` : 'Sign in'}>
                <User className="h-5 w-5" />
              </button>
              {authDropdown && isAuthenticated && <div className="absolute right-0 top-11 z-50 w-56 rounded-2xl border border-[#eee8f3] bg-white p-2 text-sm shadow-xl">
                <div className="border-b border-[#f0edf2] px-3 py-2"><p className="font-semibold text-[#302b3d]">{user?.first_name || user?.username}</p><p className="truncate text-xs text-[#898391]">{user?.email}</p></div>
                <Link href="/orders" onClick={() => setAuthDropdown(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[#51485d] hover:bg-[#f8f5fc]"><Package className="h-4 w-4" />My orders</Link>
                <Link href="/wishlist" onClick={() => setAuthDropdown(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-[#51485d] hover:bg-[#f8f5fc]"><Heart className="h-4 w-4" />My wishlist</Link>
                <button onClick={() => { logout(); setAuthDropdown(false); }} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" />Sign out</button>
              </div>}
            </div>
            <Link href="/cart" className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#51485d] transition hover:bg-[#f4eff9]" aria-label={`Shopping bag, ${cart.item_count} items`}>
              <ShoppingBag className="h-5 w-5" />
              {cart.item_count > 0 && <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8c69bd] px-1 text-[9px] font-bold text-white">{cart.item_count}</span>}
            </Link>
          </div>
        </div>

        {searchOpen && <form onSubmit={submitSearch} role="search" className="flex gap-2 border-t border-[#f0edf2] bg-white px-4 py-3 lg:hidden">
          <input autoFocus value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} aria-label="Search products" placeholder="Search toys, teethers and more..." className="min-w-0 flex-1 rounded-full border border-[#e9e2ef] bg-[#fbf9fc] px-4 py-2.5 text-sm outline-none focus:border-[#b49bce]" />
          <button type="submit" className="rounded-full bg-[#8c69bd] px-4 text-xs font-semibold text-white">Search</button>
        </form>}

        <nav aria-label="Product categories" className="border-t border-[#f1ebf6] bg-[#f1eafa]">
          <div className="mx-auto flex max-w-[1320px] items-center justify-start gap-1 overflow-x-auto px-4 py-2.5 no-scrollbar sm:justify-center sm:px-6 lg:px-8">
            {categoryLinks.map((item) => <Link key={item.label} href={item.href} className="whitespace-nowrap rounded-full px-3.5 py-1.5 text-[11px] font-semibold text-[#574b67] transition hover:bg-white/80 hover:text-[#7955a7] sm:px-4 sm:text-xs">{item.label}</Link>)}
          </div>
        </nav>

        {mobileMenuOpen && <div className="border-t border-[#eee8f3] bg-white px-5 py-4 lg:hidden">
          <div className="grid grid-cols-2 gap-2">{categoryLinks.map((item) => <Link key={item.label} href={item.href} onClick={() => setMobileMenuOpen(false)} className="rounded-xl bg-[#faf8fc] px-3 py-2.5 text-sm font-medium text-[#51485d]">{item.label}</Link>)}</div>
          <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[#f0edf2] pt-3">
            <Link href="/orders" onClick={() => setMobileMenuOpen(false)} className="rounded-xl px-3 py-2 text-sm text-[#51485d]">My orders</Link>
            {isAuthenticated ? <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="rounded-xl px-3 py-2 text-left text-sm text-red-600">Sign out</button> : <button onClick={() => openAuth('login')} className="rounded-xl px-3 py-2 text-left text-sm text-[#7955a7]">Sign in / Register</button>}
          </div>
        </div>}
      </header>

      <AIAssistantModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} />
    </>
  );
}

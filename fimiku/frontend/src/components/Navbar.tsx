'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Sparkles, Heart, User, X, ShieldCheck, Search, Menu, LogOut, Package } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import AIAssistantModal from './AIAssistantModal';
import AuthModal from './AuthModal';

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

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-fimiku-deep text-white text-[11px] sm:text-xs py-2 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <ShieldCheck className="w-3.5 h-3.5 text-fimiku-paleAqua hidden sm:inline" />
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-fimiku-light inline" />
          100% Certified Food-Grade Platinum Silicone • Free Express Delivery Across India
        </span>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-fimiku-lightBorder transition-all shadow-sm">
        <div className="max-w-7xl 2xl:max-w-[1720px] 3xl:max-w-[1840px] mx-auto px-4 sm:px-6 2xl:px-10 h-20 sm:h-24 flex items-center justify-between">
          
          {/* Left: Category / Mobile Menu Button & Desktop Links */}
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2.5 rounded-2xl bg-fimiku-veryLightLavender text-fimiku-cta hover:bg-fimiku-lavenderCard transition flex items-center justify-center border border-fimiku-lightBorder"
              aria-label="Toggle navigation menu"
              title="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Desktop Navigation Links: Home, All Toys, About Us, Contact */}
            <nav className="hidden lg:flex items-center space-x-8 text-sm font-semibold text-fimiku-darkText">
              <Link href="/" className="hover:text-fimiku-primary transition py-1">
                Home
              </Link>
              <Link href="/shop" className="hover:text-fimiku-primary transition py-1">
                All Toys
              </Link>
              <Link href="/about" className="hover:text-fimiku-primary transition py-1">
                About Us
              </Link>
              <Link href="/contact" className="hover:text-fimiku-primary transition py-1">
                Contact
              </Link>
            </nav>
          </div>

          {/* Center: Brand Logo */}
          <Link href="/" className="flex items-center justify-center text-center group py-1">
            <img
              src="/logo-transparent.png"
              alt="Fimiku - Gentle care for little beginnings"
              className="h-14 sm:h-16 md:h-18 lg:h-20 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Right: Action Icons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Ask AI Advisor Button */}
            <button
              onClick={() => setIsAiOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-fimiku-veryLightLavender hover:bg-fimiku-lavenderCard rounded-full text-xs font-semibold text-fimiku-cta border border-fimiku-lightPurple/40 transition shadow-sm"
              title="Fimiku AI Advisor"
            >
              <Sparkles className="w-3.5 h-3.5 text-fimiku-cta" />
              <span className="hidden sm:inline">AI Advisor</span>
            </button>

            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-fimiku-darkText hover:text-fimiku-primary hover:bg-fimiku-veryLightLavender rounded-full transition"
              title="Search Catalog"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2 text-fimiku-darkText hover:text-fimiku-primary hover:bg-fimiku-veryLightLavender rounded-full transition"
              title="My Favourites"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-fimiku-cta text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Shopping Cart Link */}
            <Link
              href="/cart"
              className="relative p-2 text-fimiku-darkText hover:text-fimiku-primary hover:bg-fimiku-veryLightLavender rounded-full transition"
              title="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cart.item_count > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-fimiku-cta text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold shadow-sm">
                  {cart.item_count}
                </span>
              )}
            </Link>

            {/* User Account / Auth Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isAuthenticated) {
                    openAuth('login');
                  } else {
                    setAuthDropdown(!authDropdown);
                  }
                }}
                className={`p-2 rounded-full transition flex items-center gap-1.5 ${
                  isAuthenticated
                    ? 'bg-fimiku-veryLightLavender text-fimiku-cta border border-fimiku-lightPurple/40'
                    : 'text-fimiku-darkText hover:text-fimiku-primary hover:bg-fimiku-veryLightLavender'
                }`}
                title={isAuthenticated && user ? `Logged in as ${user.username}` : 'Sign In / Register'}
              >
                <User className="w-5 h-5" />
                {isAuthenticated && user && (
                  <span className="hidden md:inline text-xs font-bold max-w-[80px] truncate">
                    {user.first_name || user.username}
                  </span>
                )}
              </button>

              {authDropdown && isAuthenticated && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl shadow-floating border border-fimiku-lightBorder py-2 z-50 text-xs animate-fade-in">
                  <div className="px-4 py-3 border-b border-fimiku-lightBorder bg-fimiku-softLavender/50">
                    <p className="font-bold text-fimiku-darkText">{user?.username}</p>
                    <p className="text-[11px] text-fimiku-grayText truncate">{user?.email}</p>
                    <span className="inline-block mt-1 text-[10px] bg-fimiku-veryLightLavender text-fimiku-cta px-2 py-0.5 rounded-full font-semibold border border-fimiku-lightPurple/30">
                      Verified Parent
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/orders"
                      onClick={() => setAuthDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-fimiku-veryLightLavender text-fimiku-darkText font-medium"
                    >
                      <Package className="w-4 h-4 text-fimiku-cta" />
                      <span>My Orders & Tracking</span>
                    </Link>
                    <Link
                      href="/wishlist"
                      onClick={() => setAuthDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-fimiku-veryLightLavender text-fimiku-darkText font-medium"
                    >
                      <Heart className="w-4 h-4 text-fimiku-cta" />
                      <span>My Favourites ({wishlist.length})</span>
                    </Link>
                    <Link
                      href="/cart"
                      onClick={() => setAuthDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-fimiku-veryLightLavender text-fimiku-darkText font-medium"
                    >
                      <ShoppingBag className="w-4 h-4 text-fimiku-cta" />
                      <span>Shopping Bag ({cart.item_count})</span>
                    </Link>
                    <Link
                      href="/shop"
                      onClick={() => setAuthDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-fimiku-veryLightLavender text-fimiku-darkText font-medium"
                    >
                      <Package className="w-4 h-4 text-fimiku-cta" />
                      <span>Explore Toys</span>
                    </Link>
                  </div>
                  <div className="border-t border-fimiku-lightBorder pt-1 mt-1">
                    <button
                      onClick={() => {
                        logout();
                        setAuthDropdown(false);
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar Overlay */}
        {searchOpen && (
          <div className="border-t border-fimiku-lightBorder bg-fimiku-softLavender px-4 py-3 animate-fade-in">
            <div className="max-w-xl mx-auto flex items-center gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    window.location.href = `/shop?search=${encodeURIComponent(searchQuery)}`;
                  }
                }}
                placeholder="Search teethers, bath toys, silicone sets..."
                className="w-full px-4 py-2 bg-white rounded-full border border-fimiku-lightBorder text-xs text-fimiku-darkText focus:outline-none focus:border-fimiku-primary shadow-sm"
                autoFocus
              />
              <Link
                href={searchQuery.trim() ? `/shop?search=${encodeURIComponent(searchQuery)}` : '/shop'}
                className="px-5 py-2 bg-fimiku-cta text-white text-xs font-semibold rounded-full hover:bg-fimiku-primary transition"
                onClick={() => setSearchOpen(false)}
              >
                Search
              </Link>
            </div>
          </div>
        )}

        {/* Mobile Dropdown Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-fimiku-lightBorder px-6 py-4 space-y-3 text-sm animate-fade-in">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-fimiku-darkText hover:text-fimiku-primary font-medium"
            >
              Home
            </Link>
            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-fimiku-darkText hover:text-fimiku-primary font-medium"
            >
              All Toys
            </Link>
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-fimiku-darkText hover:text-fimiku-primary font-medium"
            >
              About Us
            </Link>
            <Link
              href="/contact"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-fimiku-darkText hover:text-fimiku-primary font-medium"
            >
              Contact
            </Link>
            
            {/* Mobile Wishlist & Auth Links */}
            <div className="pt-3 border-t border-fimiku-lightBorder space-y-2">
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 py-2 text-fimiku-darkText hover:text-fimiku-primary font-medium"
              >
                <Package className="w-4 h-4 text-fimiku-cta" />
                <span>My Orders</span>
              </Link>

              <Link
                href="/wishlist"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between py-2 text-fimiku-darkText hover:text-fimiku-primary font-medium"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-fimiku-cta" />
                  My Favourites
                </span>
                {wishlist.length > 0 && (
                  <span className="bg-fimiku-cta text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {isAuthenticated && user ? (
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 w-full py-2 text-red-600 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out ({user.username})
                </button>
              ) : (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openAuth('login')}
                    className="flex-1 py-2 bg-fimiku-cta text-white rounded-full text-xs font-semibold text-center hover:bg-fimiku-primary transition"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="flex-1 py-2 bg-fimiku-veryLightLavender text-fimiku-cta border border-fimiku-lightPurple/40 rounded-full text-xs font-semibold text-center hover:bg-fimiku-lavenderCard transition"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Gemini AI Advisor Modal */}
      <AIAssistantModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />

      {/* Sign In & Register Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}

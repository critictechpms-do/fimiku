'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import AIAssistantModal from './AIAssistantModal';

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { cart, wishlist } = useCart();
  const [isAiOpen, setIsAiOpen] = useState(false);

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'All Toys', href: '/shop', icon: Package },
    { label: 'AI Advisor', isButton: true, onClick: () => setIsAiOpen(true), icon: Sparkles, highlight: true },
    { label: 'Favourites', href: '/wishlist', icon: Heart, count: wishlist.length },
    { label: 'Bag', href: '/cart', icon: ShoppingBag, count: cart.item_count },
  ];

  return (
    <>
      {/* Fixed Bottom Navigation Bar for Mobile */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-fimiku-lightBorder shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 pt-1.5 pb-safe transition-all"
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = item.href ? pathname === item.href : false;

            if (item.isButton) {
              return (
                <button
                  key={idx}
                  onClick={item.onClick}
                  className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl transition group relative -mt-3"
                  title={item.label}
                >
                  <div className="w-11 h-11 rounded-full bg-fimiku-cta text-white flex items-center justify-center shadow-lg border-2 border-white group-active:scale-95 transition-transform">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="text-[10px] font-bold text-fimiku-cta mt-0.5 tracking-tight">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link
                key={idx}
                href={item.href!}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-2xl transition relative group ${
                  isActive
                    ? 'text-fimiku-cta font-bold'
                    : 'text-fimiku-secondaryText hover:text-fimiku-darkText'
                }`}
              >
                <div className="relative p-1">
                  <Icon
                    className={`w-5 h-5 transition-transform group-active:scale-90 ${
                      isActive ? 'text-fimiku-cta' : 'text-fimiku-secondaryText'
                    }`}
                  />
                  {typeof item.count === 'number' && item.count > 0 && (
                    <span className="absolute -top-0.5 -right-1 bg-fimiku-cta text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                      {item.count}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 tracking-tight ${
                    isActive ? 'font-bold text-fimiku-cta' : 'font-medium text-fimiku-grayText'
                  }`}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="w-1 h-1 bg-fimiku-cta rounded-full mt-0.5"></span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* AI Assistant Modal for Mobile Nav */}
      <AIAssistantModal isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
    </>
  );
}

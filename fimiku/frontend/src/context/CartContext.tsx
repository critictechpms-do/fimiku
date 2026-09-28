'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/lib/api';

export interface ProductType {
  id: number;
  name: string;
  slug: string;
  price: string | number;
  discount_price?: string | number | null;
  final_price?: string | number;
  image_url: string;
  category_name?: string;
  category?: { id: number; name: string; slug: string };
  target_age?: string;
  material?: string;
  description?: string;
  features?: string[];
  stock?: number;
  is_in_stock?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  reviews_count?: number;
  average_rating?: number;
}

export interface CartItemType {
  id: number;
  product: ProductType;
  quantity: number;
  subtotal: number;
}

interface CartContextType {
  cart: { items: CartItemType[]; total: number; item_count: number };
  wishlist: number[];
  addToCart: (productOrId: number | ProductType, quantity?: number) => Promise<boolean>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleWishlist: (productOrId: number | ProductType) => Promise<void>;
  isInWishlist: (productOrId: number | ProductType) => boolean;
  fetchCart: () => Promise<void>;
  fetchWishlist: () => Promise<void>;
  loading: boolean;
  toast: string | null;
  showToast: (msg: string) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [cart, setCart] = useState<{ items: CartItemType[]; total: number; item_count: number }>({
    items: [],
    total: 0,
    item_count: 0,
  });
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart/');
      setCart({
        items: res.data.items || [],
        total: res.data.total || 0,
        item_count: res.data.item_count || 0,
      });
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await api.get('/wishlist/');
      if (res.data?.products) {
        setWishlist(res.data.products.map((p: any) => p.id));
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const addToCart = async (productOrId: number | ProductType, quantity: number = 1): Promise<boolean> => {
    const productId = typeof productOrId === 'number' ? productOrId : productOrId.id;
    try {
      const res = await api.post('/cart/', { product_id: productId, quantity });
      setCart({
        items: res.data.items || [],
        total: res.data.total || 0,
        item_count: res.data.item_count || 0,
      });
      showToast('✨ Added to your shopping bag!');
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Could not add item to cart';
      showToast(`⚠️ ${errorMsg}`);
      return false;
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      const res = await api.put('/cart/', { item_id: itemId, quantity });
      setCart({
        items: res.data.items || [],
        total: res.data.total || 0,
        item_count: res.data.item_count || 0,
      });
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to update quantity';
      showToast(`⚠️ ${errorMsg}`);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const res = await api.delete('/cart/', { data: { item_id: itemId } });
      setCart({
        items: res.data.items || [],
        total: res.data.total || 0,
        item_count: res.data.item_count || 0,
      });
      showToast('Item removed from bag');
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart/');
      setCart({ items: [], total: 0, item_count: 0 });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const toggleWishlist = async (productOrId: number | ProductType) => {
    const productId = typeof productOrId === 'number' ? productOrId : productOrId.id;
    try {
      const res = await api.post('/wishlist/', { product_id: productId });
      if (res.data?.in_wishlist) {
        setWishlist((prev) => [...prev, productId]);
        showToast('❤️ Saved to your wishlist');
      } else {
        setWishlist((prev) => prev.filter((id) => id !== productId));
        showToast('Removed from wishlist');
      }
    } catch (err) {
      console.error('Failed to update wishlist:', err);
    }
  };

  const isInWishlist = (productOrId: number | ProductType) => {
    const productId = typeof productOrId === 'number' ? productOrId : productOrId.id;
    return wishlist.includes(productId);
  };

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        toggleWishlist,
        isInWishlist,
        fetchCart,
        fetchWishlist,
        loading,
        toast,
        showToast,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-fimiku-charcoal text-white text-xs px-5 py-3 rounded-full shadow-2xl border border-fimiku-peach/40 animate-fade-in flex items-center gap-2">
          <span>{toast}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

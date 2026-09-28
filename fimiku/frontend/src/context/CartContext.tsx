'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Link from 'next/link';
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
  cart: {
    items: CartItemType[];
    total: number;
    item_count: number;
  };
  wishlist: number[];
  addToCart: (
    productOrId: number | ProductType,
    quantity?: number
  ) => Promise<boolean>;
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

export const CartProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [cart, setCart] = useState<{
    items: CartItemType[];
    total: number;
    item_count: number;
  }>({
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
    }, 4000);
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
        setWishlist(
          res.data.products.map((p: any) => p.id)
        );
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
    }
  };

  const addToCart = async (
    productOrId: number | ProductType,
    quantity: number = 1
  ): Promise<boolean> => {
    const productId =
      typeof productOrId === 'number'
        ? productOrId
        : productOrId.id;

    try {
      const res = await api.post('/cart/', {
        product_id: productId,
        quantity,
      });

      const updatedCart = {
        items: res.data.items || [],
        total: res.data.total || 0,
        item_count: res.data.item_count || 0,
      };

      setCart(updatedCart);

      showToast(
        `✅ Added to cart • 🛍️ ${updatedCart.item_count} ${
          updatedCart.item_count === 1 ? 'item' : 'items'
        } in cart`
      );

      return true;
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        'Could not add item to cart';

      showToast(`⚠️ ${errorMsg}`);

      return false;
    }
  };

  const updateQuantity = async (
    itemId: number,
    quantity: number
  ) => {
    try {
      const res = await api.put('/cart/', {
        item_id: itemId,
        quantity,
      });

      setCart({
        items: res.data.items || [],
        total: res.data.total || 0,
        item_count: res.data.item_count || 0,
      });
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error ||
        'Failed to update quantity';

      showToast(`⚠️ ${errorMsg}`);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      const res = await api.delete('/cart/', {
        data: { item_id: itemId },
      });

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

      setCart({
        items: [],
        total: 0,
        item_count: 0,
      });
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const toggleWishlist = async (
    productOrId: number | ProductType
  ) => {
    const productId =
      typeof productOrId === 'number'
        ? productOrId
        : productOrId.id;

    try {
      const res = await api.post('/wishlist/', {
        product_id: productId,
      });

      if (res.data?.in_wishlist) {
        setWishlist((prev) => [...prev, productId]);

        showToast('❤️ Saved to your wishlist');
      } else {
        setWishlist((prev) =>
          prev.filter((id) => id !== productId)
        );

        showToast('Removed from wishlist');
      }
    } catch (err) {
      console.error('Failed to update wishlist:', err);
    }
  };

  const isInWishlist = (
    productOrId: number | ProductType
  ) => {
    const productId =
      typeof productOrId === 'number'
        ? productOrId
        : productOrId.id;

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
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-xl">
          <div className="bg-fimiku-charcoal text-white px-5 py-4 rounded-2xl shadow-2xl border border-fimiku-peach/40 flex items-center justify-between gap-4">
            
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                ✓
              </div>

              <div>
                <p className="text-sm font-bold">
                  Added to Cart
                </p>

                <p className="text-xs text-gray-300">
                  🛍️ {cart.item_count}{' '}
                  {cart.item_count === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>

            <Link
              href="/cart"
              className="shrink-0 bg-white text-fimiku-charcoal px-4 py-2.5 rounded-full text-xs font-bold hover:bg-fimiku-softLavender transition"
            >
              View Cart →
            </Link>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within a CartProvider'
    );
  }

  return context;
};
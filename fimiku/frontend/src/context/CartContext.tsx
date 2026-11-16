
'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from 'react';
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
  additional_images?: string[];
  category_name?: string;
  category_slug?: string;
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
  reviews?: Array<{ rating: number; comment?: string; created_at?: string }>;
}

export interface CartItemType {
  id: number;
  product: ProductType;
  quantity: number;
  subtotal: number;
}

type RocketDestination = 'cart' | 'bag';

interface RocketFlight {
  id: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
  rotation: number;
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
  launchPaperRocket: (
    source: HTMLElement,
    destination: RocketDestination
  ) => void;
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
  const [toastKey, setToastKey] = useState(0);
  const [rocketFlight, setRocketFlight] = useState<RocketFlight | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rocketTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rocketId = useRef(0);

  const showToast = (msg: string) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast(msg);
    setToastKey((prev) => prev + 1);

    toastTimer.current = setTimeout(() => {
      setToast(null);
    }, 3800);
  };

  // Paper rocket flies from the clicked button to the selected icon.
  const launchPaperRocket = (
    source: HTMLElement,
    destination: RocketDestination
  ) => {
    if (typeof window === 'undefined') return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const selector =
      destination === 'cart'
        ? '[data-fimiku-cart-target="true"]'
        : '[data-fimiku-bag-target="true"]';

    const target = document.querySelector<HTMLElement>(selector);

    // Do not interfere with the purchase action if the target is unavailable.
    if (!target || !source) return;

    const sourceRect = source.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const startX = sourceRect.left + sourceRect.width / 2;
    const startY = sourceRect.top + sourceRect.height / 2;
    const targetX = targetRect.left + targetRect.width / 2;
    const targetY = targetRect.top + targetRect.height / 2;

    const deltaX = targetX - startX;
    const deltaY = targetY - startY;

    const rotation =
      Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    if (rocketTimer.current) {
      clearTimeout(rocketTimer.current);
    }

    rocketId.current += 1;

    setRocketFlight({
      id: rocketId.current,
      startX,
      startY,
      deltaX,
      deltaY,
      rotation,
    });

    rocketTimer.current = setTimeout(() => {
      setRocketFlight(null);
    }, 900);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }

      if (rocketTimer.current) {
        clearTimeout(rocketTimer.current);
      }
    };
  }, []);

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

      showToast('Added to your cart');

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

      showToast('Item removed from your cart');
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

      showToast('Your cart is empty now');
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
        setWishlist((prev) =>
          prev.includes(productId)
            ? prev
            : [...prev, productId]
        );

        showToast('Saved to your wishlist');
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

  const isError = toast?.startsWith('⚠️');

  const rocketStyle: React.CSSProperties & {
    '--rocket-dx': string;
    '--rocket-dy': string;
    '--rocket-rotation': string;
  } | undefined = rocketFlight
    ? {
        left: rocketFlight.startX,
        top: rocketFlight.startY,
        '--rocket-dx': `${rocketFlight.deltaX}px`,
        '--rocket-dy': `${rocketFlight.deltaY}px`,
        '--rocket-rotation': `${rocketFlight.rotation}deg`,
      }
    : undefined;

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
        launchPaperRocket,
        loading,
        toast,
        showToast,
      }}
    >
      {children}

      {/* Flying paper rocket */}
      {rocketFlight && (
        <div
          key={rocketFlight.id}
          className="fimiku-paper-rocket"
          style={rocketStyle}
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 48 48"
            width="38"
            height="38"
            fill="none"
          >
            <path
              d="M40 5C29 5 14 12 7 25L20 28L23 41C36 34 43 19 40 5Z"
              fill="#B99AEF"
              stroke="#805AC7"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M7 25L2 34L20 28"
              fill="#EDE3FF"
              stroke="#805AC7"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M23 41L32 36L23 28"
              fill="#D8C5FA"
              stroke="#805AC7"
              strokeWidth="1.6"
              strokeLinejoin="round"
            />
            <path
              d="M20 28L40 5"
              stroke="white"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="29" cy="16" r="2.3" fill="white" />
          </svg>
          <span className="fimiku-rocket-sparkle">✦</span>
        </div>
      )}

      {/* Existing confirmation toast, now using a trolley */}
      {toast && (
        <div
          key={toastKey}
          role="status"
          aria-live="polite"
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-md"
        >
          <div
            className={`fimiku-toast relative overflow-hidden rounded-[26px] border px-4 py-4 shadow-2xl ${
              isError
                ? 'bg-white border-red-200'
                : 'bg-white border-[#e6dafa]'
            }`}
          >
            {!isError && (
              <>
                <div className="fimiku-sparkle sparkle-one">✦</div>
                <div className="fimiku-sparkle sparkle-two">✧</div>
                <div className="fimiku-sparkle sparkle-three">✦</div>
                <div className="absolute -right-8 -top-12 w-32 h-32 rounded-full bg-[#eee5ff] blur-2xl opacity-80" />
              </>
            )}

            <div className="relative z-10 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {!isError ? (
                  <div className="fimiku-cart-scene shrink-0">
                    <svg
                      viewBox="0 0 64 64"
                      className="fimiku-cart-icon"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 11H14L20 40H48L55 19H18"
                        stroke="#8C69CE"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 26H52L48 39H20"
                        fill="#B99AEF"
                        stroke="#8C69CE"
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M25 30H46"
                        stroke="#EDE3FF"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />
                      <circle cx="25" cy="49" r="4" fill="#8C69CE" />
                      <circle cx="46" cy="49" r="4" fill="#8C69CE" />
                      <path
                        d="M29 17L34 22L43 12"
                        stroke="white"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>

                    <span className="fimiku-cart-glow" />
                  </div>
                ) : (
                  <div className="w-11 h-11 shrink-0 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 text-xl">
                    !
                  </div>
                )}

                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[#29213A]">
                    {isError
                      ? 'Oops! Something happened'
                      : toast}
                  </p>

                  <p className="text-xs text-[#837994] mt-1">
                    {isError
                      ? toast.replace('⚠️ ', '')
                      : `${cart.item_count} ${
                          cart.item_count === 1 ? 'item' : 'items'
                        } in your cart`}
                  </p>
                </div>
              </div>

              {!isError && (
                <Link
                  href="/cart"
                  className="fimiku-view-cart shrink-0 flex items-center gap-1 bg-[#9672D6] hover:bg-[#805AC7] text-white px-4 py-3 rounded-full text-xs font-bold shadow-lg shadow-purple-200 transition-colors"
                >
                  View Cart
                  <span className="fimiku-arrow">→</span>
                </Link>
              )}
            </div>

            {!isError && (
              <div className="relative mt-3 h-1 rounded-full bg-[#F0EAF9] overflow-hidden">
                <div className="fimiku-toast-progress h-full rounded-full bg-gradient-to-r from-[#C8A9FF] to-[#8E69D1]" />
              </div>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        .fimiku-toast {
          animation: fimiku-toast-enter 650ms cubic-bezier(.18,1.4,.35,1) both;
          backdrop-filter: blur(14px);
        }

        .fimiku-cart-scene {
          position: relative;
          width: 54px;
          height: 54px;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fimiku-cart-bounce 850ms cubic-bezier(.2,1.5,.4,1) both;
        }

        .fimiku-cart-icon {
          position: relative;
          z-index: 2;
          width: 49px;
          height: 49px;
          transform-origin: 50% 85%;
          animation: fimiku-cart-swing 900ms ease-in-out both;
          filter: drop-shadow(0 5px 5px rgba(137, 103, 197, .25));
        }

        .fimiku-cart-glow {
          position: absolute;
          bottom: 0;
          width: 35px;
          height: 7px;
          border-radius: 50%;
          background: rgba(151, 112, 216, .22);
          filter: blur(5px);
          animation: fimiku-shadow-pulse 850ms ease-in-out both;
        }

        .fimiku-sparkle {
          position: absolute;
          z-index: 2;
          color: #AC8BEA;
          font-size: 15px;
          pointer-events: none;
          animation: fimiku-sparkle-pop 900ms ease-out both;
        }

        .sparkle-one {
          top: 8px;
          left: 34%;
        }

        .sparkle-two {
          top: 12px;
          left: 65%;
          animation-delay: 100ms;
          font-size: 12px;
        }

        .sparkle-three {
          bottom: 13px;
          left: 49%;
          animation-delay: 180ms;
          font-size: 10px;
        }

        .fimiku-view-cart {
          animation: fimiku-button-pop 600ms 150ms cubic-bezier(.2,1.5,.4,1) both;
        }

        .fimiku-arrow {
          display: inline-block;
          transition: transform 200ms ease;
        }

        .fimiku-view-cart:hover .fimiku-arrow {
          transform: translateX(4px);
        }

        .fimiku-toast-progress {
          animation: fimiku-progress 3800ms linear forwards;
        }

        .fimiku-paper-rocket {
          position: fixed;
          z-index: 10001;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          transform: translate(-50%, -50%);
          filter: drop-shadow(0 5px 7px rgba(91, 62, 145, .28));
          animation: fimiku-rocket-flight 850ms cubic-bezier(.22,.75,.25,1) forwards;
        }

        .fimiku-rocket-sparkle {
          position: absolute;
          top: -5px;
          right: -3px;
          color: #A987E8;
          font-size: 13px;
          animation: fimiku-rocket-twinkle 500ms ease-out both;
        }

        @keyframes fimiku-rocket-flight {
          0% {
            opacity: 0;
            transform: translate(-50%, -50%) translate3d(0, 8px, 0) rotate(-18deg) scale(.55);
          }
          12% {
            opacity: 1;
            transform: translate(-50%, -50%) translate3d(0, 0, 0) rotate(-18deg) scale(1);
          }
          75% {
            opacity: 1;
            transform: translate(-50%, -50%) translate3d(
              calc(var(--rocket-dx) * .82),
              calc(var(--rocket-dy) * .82),
              0
            ) rotate(var(--rocket-rotation)) scale(.85);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate3d(
              var(--rocket-dx),
              var(--rocket-dy),
              0
            ) rotate(var(--rocket-rotation)) scale(.2);
          }
        }

        @keyframes fimiku-rocket-twinkle {
          0% { opacity: 0; transform: scale(0) rotate(-30deg); }
          45% { opacity: 1; transform: scale(1.3) rotate(15deg); }
          100% { opacity: 0; transform: scale(.5) rotate(45deg); }
        }

        @keyframes fimiku-toast-enter {
          0% {
            opacity: 0;
            transform: translateY(35px) scale(.82);
          }
          65% {
            opacity: 1;
            transform: translateY(-5px) scale(1.025);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes fimiku-cart-bounce {
          0% {
            transform: translateY(20px) scale(.45) rotate(-15deg);
          }
          55% {
            transform: translateY(-7px) scale(1.15) rotate(7deg);
          }
          75% {
            transform: translateY(3px) scale(.95) rotate(-3deg);
          }
          100% {
            transform: translateY(0) scale(1) rotate(0);
          }
        }

        @keyframes fimiku-cart-swing {
          0% { transform: rotate(-18deg); }
          35% { transform: rotate(13deg); }
          65% { transform: rotate(-8deg); }
          100% { transform: rotate(0); }
        }

        @keyframes fimiku-shadow-pulse {
          0%, 100% { transform: scale(.7); opacity: .4; }
          50% { transform: scale(1.2); opacity: 1; }
        }

        @keyframes fimiku-sparkle-pop {
          0% {
            opacity: 0;
            transform: scale(0) rotate(-45deg);
          }
          45% {
            opacity: 1;
            transform: scale(1.3) rotate(15deg);
          }
          100% {
            opacity: 0;
            transform: scale(.7) rotate(50deg);
          }
        }

        @keyframes fimiku-button-pop {
          0% { transform: scale(.75); opacity: 0; }
          65% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fimiku-progress {
          from { width: 100%; }
          to { width: 0%; }
        }

        @media (prefers-reduced-motion: reduce) {
          .fimiku-toast,
          .fimiku-cart-scene,
          .fimiku-cart-icon,
          .fimiku-cart-glow,
          .fimiku-sparkle,
          .fimiku-view-cart,
          .fimiku-toast-progress,
          .fimiku-paper-rocket,
          .fimiku-rocket-sparkle {
            animation: none !important;
          }
        }
      `}</style>
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

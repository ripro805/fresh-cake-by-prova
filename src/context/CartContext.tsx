import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Product, ProductVariant, CartItem } from '../types';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, variant?: ProductVariant, flavor?: string, quantity?: number) => boolean;
  removeFromCart: (productId: string, variantId: string, flavor?: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number, flavor?: string) => void;
  clearCart: () => void;
  cartCount: number;
  subtotal: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;
  wishlist: string[];
  toggleWishlist: (productId: string) => boolean;
  isInWishlist: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LEGACY_CART_KEY = 'fresh_cake_cart_v1';
const LEGACY_WISHLIST_KEY = 'fresh_cake_wishlist_v1';

const getUserCartKey = (userId?: string) => (userId ? `fresh_cake_cart_${userId}` : null);
const getUserWishlistKey = (userId?: string) => (userId ? `fresh_cake_wishlist_${userId}` : null);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { showToast } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize cart state - strictly empty when not authenticated
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      // Clean up any legacy unauthenticated global keys
      localStorage.removeItem(LEGACY_CART_KEY);
      if (currentUser?.id) {
        const key = getUserCartKey(currentUser.id);
        const stored = key ? localStorage.getItem(key) : null;
        return stored ? JSON.parse(stored) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      localStorage.removeItem(LEGACY_WISHLIST_KEY);
      if (currentUser?.id) {
        const key = getUserWishlistKey(currentUser.id);
        const stored = key ? localStorage.getItem(key) : null;
        return stored ? JSON.parse(stored) : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // Sync cart and wishlist with the active authenticated customer
  useEffect(() => {
    if (!currentUser) {
      // When logged out or not logged in, cart and wishlist are strictly empty
      setCart([]);
      setWishlist([]);
      setIsCartDrawerOpen(false);
      try {
        localStorage.removeItem(LEGACY_CART_KEY);
        localStorage.removeItem(LEGACY_WISHLIST_KEY);
      } catch (err) {
        console.warn('Could not clear legacy cart storage:', err);
      }
    } else {
      // When a customer signs in, load their isolated cart and wishlist
      const cartKey = getUserCartKey(currentUser.id);
      const wishlistKey = getUserWishlistKey(currentUser.id);
      try {
        const storedCart = cartKey ? localStorage.getItem(cartKey) : null;
        setCart(storedCart ? JSON.parse(storedCart) : []);
        const storedWishlist = wishlistKey ? localStorage.getItem(wishlistKey) : null;
        setWishlist(storedWishlist ? JSON.parse(storedWishlist) : []);
      } catch {
        setCart([]);
        setWishlist([]);
      }
    }
  }, [currentUser]);

  // Persist customer cart when authenticated
  useEffect(() => {
    if (currentUser?.id) {
      const cartKey = getUserCartKey(currentUser.id);
      if (cartKey) {
        localStorage.setItem(cartKey, JSON.stringify(cart));
      }
    }
  }, [cart, currentUser]);

  // Persist customer wishlist when authenticated
  useEffect(() => {
    if (currentUser?.id) {
      const wishlistKey = getUserWishlistKey(currentUser.id);
      if (wishlistKey) {
        localStorage.setItem(wishlistKey, JSON.stringify(wishlist));
      }
    }
  }, [wishlist, currentUser]);

  const addToCart = (product: Product, variant?: ProductVariant, flavor?: string, quantity = 1): boolean => {
    // Authentication guard: customers must be signed in to add items
    if (!currentUser) {
      showToast('Please sign in or create an account to add items to your cart.', 'warning');
      setIsCartDrawerOpen(false);
      navigate('/login', { state: { from: location.pathname } });
      return false;
    }

    const selectedVariant = variant || product.variants[0];
    const selectedFlavor = flavor || (product.flavors && product.flavors.length > 0 ? product.flavors[0] : undefined);

    setCart(prev => {
      const existingIndex = prev.findIndex(
        item =>
          item.product.id === product.id &&
          item.selectedVariant.id === selectedVariant.id &&
          item.selectedFlavor === selectedFlavor
      );

      if (existingIndex > -1) {
        const next = [...prev];
        next[existingIndex].quantity += quantity;
        return next;
      }

      return [
        ...prev,
        {
          product,
          selectedVariant,
          selectedFlavor,
          quantity
        }
      ];
    });

    setIsCartDrawerOpen(true);
    return true;
  };

  const removeFromCart = (productId: string, variantId: string, flavor?: string) => {
    setCart(prev =>
      prev.filter(
        item =>
          !(
            item.product.id === productId &&
            item.selectedVariant.id === variantId &&
            item.selectedFlavor === flavor
          )
      )
    );
  };

  const updateQuantity = (productId: string, variantId: string, quantity: number, flavor?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, variantId, flavor);
      return;
    }

    setCart(prev =>
      prev.map(item => {
        if (
          item.product.id === productId &&
          item.selectedVariant.id === variantId &&
          item.selectedFlavor === flavor
        ) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    if (currentUser?.id) {
      const cartKey = getUserCartKey(currentUser.id);
      if (cartKey) {
        localStorage.removeItem(cartKey);
      }
    }
    localStorage.removeItem(LEGACY_CART_KEY);
  };

  const toggleWishlist = (productId: string): boolean => {
    if (!currentUser) {
      showToast('Please sign in to save items to your wishlist.', 'warning');
      navigate('/login', { state: { from: location.pathname } });
      return false;
    }

    setWishlist(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
    return true;
  };

  const isInWishlist = (productId: string) => {
    if (!currentUser) return false;
    return wishlist.includes(productId);
  };

  // Cart count is strictly 0 when not authenticated
  const cartCount = currentUser ? cart.reduce((total, item) => total + item.quantity, 0) : 0;

  // Subtotal is strictly 0 when not authenticated
  const subtotal = currentUser
    ? cart.reduce((total, item) => {
        const unitPrice = item.selectedVariant.price || item.product.discount_price || item.product.price;
        return total + unitPrice * item.quantity;
      }, 0)
    : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        subtotal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        wishlist,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Product } from "@/data/products";

const WISHLIST_KEY = "kaf_wishlist";

interface WishlistContextValue {
  items: Product[];
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: number) => void;
  isWishlisted: (productId: number) => boolean;
  clearWishlist: () => void;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextValue>({
  items: [],
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isWishlisted: () => false,
  clearWishlist: () => {},
  totalItems: 0,
});

function loadWishlist(): Product[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(WISHLIST_KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item) => item && Number.isFinite(Number(item.id))) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadWishlist());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const addToWishlist = useCallback((product: Product) => {
    setItems((current) => current.some((item) => item.id === product.id) ? current : [...current, product]);
  }, []);

  const removeFromWishlist = useCallback((productId: number) => {
    setItems((current) => current.filter((item) => item.id !== productId));
  }, []);

  const clearWishlist = useCallback(() => setItems([]), []);
  const itemIds = useMemo(() => new Set(items.map((item) => item.id)), [items]);
  const isWishlisted = useCallback((productId: number) => itemIds.has(productId), [itemIds]);

  return (
    <WishlistContext.Provider value={{ items, addToWishlist, removeFromWishlist, isWishlisted, clearWishlist, totalItems: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);

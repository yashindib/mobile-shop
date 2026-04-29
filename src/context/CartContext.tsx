"use client";

// BUG #9: Context value is not memoized — every render creates a new object,
// causing ALL consumers to re-render even when cart hasn't changed.
import { createContext, useContext, useState, ReactNode } from "react";
import { CartItem, Product } from "@/types";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  console.log("[CartContext] CartProvider render, items count:", items.length);

  const addToCart = (product: Product, quantity = 1) => {
    console.log("[CartContext] addToCart:", product.name, "qty:", quantity);
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    console.log("[CartContext] removeFromCart id:", productId);
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    console.log("[CartContext] updateQuantity id:", productId, "qty:", quantity);
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === productId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    console.log("[CartContext] clearCart");
    setItems([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  // BUG #9: Value object recreated on every render — should be wrapped in useMemo
  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}

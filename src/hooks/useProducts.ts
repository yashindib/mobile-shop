"use client";

// BUG #4: Race condition — multiple fast category switches can resolve
// out of order, showing stale results. No AbortController used.
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { fetchProducts } from "@/lib/api";

export function useProducts(category?: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[useProducts] fetching for category:", category);
    setLoading(true);
    setError(null);

    // BUG #4: No AbortController — if category changes quickly,
    // an older fetch can overwrite newer results.
    fetchProducts(category)
      .then((data) => {
        console.log("[useProducts] fetch complete, count:", data.length);
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("[useProducts] fetch error:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [category]);

  return { products, loading, error };
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("[useProduct] fetching id:", id);
    import("@/lib/api").then(({ fetchProductById }) => {
      fetchProductById(id)
        .then((data) => {
          setProduct(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("[useProduct] error:", err);
          setError(err.message);
          setLoading(false);
        });
    });
  }, [id]);

  return { product, loading, error };
}

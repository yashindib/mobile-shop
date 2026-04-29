"use client";

// BUG #3: Object literal in useEffect dependency array causes infinite re-render.
// { minPrice: 0, maxPrice: 1000 } is a new object reference every render.
import { useState, useEffect } from "react";
import { Product } from "@/types";
import { searchProducts } from "@/lib/api";

interface Props {
  onResults: (products: Product[]) => void;
  filters?: { minPrice: number; maxPrice: number };
}

export default function SearchBar({ onResults, filters = { minPrice: 0, maxPrice: 1000 } }: Props) {
  const [query, setQuery] = useState("");

  console.log("[SearchBar] render, query:", query);

  // BUG #3: `filters` is a new object on every parent render,
  // so this effect runs on every render — infinite loop when results trigger parent re-render.
  useEffect(() => {
    console.log("[SearchBar] effect triggered — searching:", query, "filters:", filters);
    if (query.trim() === "") {
      onResults([]);
      return;
    }
    searchProducts(query).then((results) => {
      const filtered = results.filter(
        (p) => p.price >= filters.minPrice && p.price <= filters.maxPrice
      );
      console.log("[SearchBar] filtered results:", filtered.length);
      onResults(filtered);
    });
  }, [query, filters]); // BUG: filters object is unstable

  return (
    <div className="relative w-full max-w-md">
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search products..."
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
      />
      {query && (
        <button
          onClick={() => setQuery("")}
          className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      )}
    </div>
  );
}

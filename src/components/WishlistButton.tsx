"use client";

import { useState } from "react";
import { Product } from "@/types";

interface Props {
  product: Product;
}

// Feature in development — wishlist enabled in staging/prod via NEXT_PUBLIC_ENABLE_WISHLIST
export default function WishlistButton({ product }: Props) {
  const [saved, setSaved] = useState(false);

  if (process.env.NEXT_PUBLIC_ENABLE_WISHLIST !== "true") return null;

  console.log("[WishlistButton] product:", product.name, "saved:", saved);

  return (
    <button
      onClick={() => setSaved((s) => !s)}
      title={saved ? "Remove from wishlist" : "Save to wishlist"}
      className={`p-2 rounded-full border transition-colors ${
        saved ? "bg-red-50 border-red-300 text-red-500" : "bg-white border-gray-300 text-gray-400 hover:text-red-500"
      }`}
    >
      <svg className="w-5 h-5" fill={saved ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}

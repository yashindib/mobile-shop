"use client";

// BUG #10: No error boundary — if useProducts throws, entire page crashes with no fallback.
// BUG #12: No loading skeleton — content flashes in abruptly.
import { useState } from "react";
import { useProducts } from "@/hooks/useProducts";
import ProductList from "@/components/ProductList";
import CategoryFilter from "@/components/CategoryFilter";
import SearchBar from "@/components/SearchBar";
import { Product } from "@/types";

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchResults, setSearchResults] = useState<Product[] | null>(null);
  const { products, loading, error } = useProducts(
    selectedCategory === "All" ? undefined : selectedCategory
  );

  console.log("[ProductsPage] render, category:", selectedCategory, "loading:", loading);

  const handleSearch = (results: Product[]) => {
    console.log("[ProductsPage] search results:", results.length);
    setSearchResults(results.length > 0 ? results : null);
  };

  const displayProducts = searchResults ?? products;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-500">
          {displayProducts.length} products available
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* BUG #3: SearchBar receives a new `filters` object every render — infinite loop risk */}
        <SearchBar onResults={handleSearch} filters={{ minPrice: 0, maxPrice: 500 }} />
        <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} />
      </div>

      {/* BUG #12: No loading skeleton — just a text spinner */}
      {loading && (
        <div className="text-center py-16 text-gray-500">Loading products...</div>
      )}

      {/* BUG #10: error shown as plain text, no retry, no error boundary */}
      {error && (
        <div className="text-center py-16 text-red-500">Error: {error}</div>
      )}

      {!loading && !error && (
        <ProductList products={displayProducts} />
      )}
    </div>
  );
}

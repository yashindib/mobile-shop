"use client";

// BUG #2: List items rendered without key prop inside the wrapper — React
// will warn and fail to reconcile correctly on reorder/filter.
import { Product } from "@/types";
import ProductCard from "./ProductCard";

interface Props {
  products: Product[];
  title?: string;
}

export default function ProductList({ products, title }: Props) {
  console.log("[ProductList] render, count:", products.length);

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-lg">No products found.</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
      )}
      {/* BUG #2: ProductCard receives no key — should be key={product.id} on the element */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard product={product} />
        ))}
      </div>
    </div>
  );
}

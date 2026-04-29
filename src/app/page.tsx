import Link from "next/link";
import { PRODUCTS } from "@/lib/mockData";
import ProductCard from "@/components/ProductCard";
import CountdownTimer from "@/components/CountdownTimer";

export default function HomePage() {
  const featured = PRODUCTS.slice(0, 4);
  const deals = PRODUCTS.filter((p) => p.originalPrice);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            <span className="inline-block bg-white/20 text-white text-sm font-medium px-3 py-1 rounded-full mb-4">
              Free shipping on orders over $50
            </span>
            <h1 className="text-5xl font-bold leading-tight mb-6">
              Shop Smarter,<br />
              <span className="text-indigo-200">Live Better</span>
            </h1>
            <p className="text-xl text-indigo-100 mb-8">
              Discover thousands of premium products curated just for you. Electronics, fashion,
              beauty, and more — all in one place.
            </p>
            <div className="flex gap-4">
              <Link
                href="/products"
                className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
              >
                Shop Now
              </Link>
              <Link
                href="/products?category=Electronics"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Electronics
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Banner — BUG #5 lives inside CountdownTimer */}
      <section className="bg-red-50 border-y border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <span className="text-red-700 font-bold text-lg">FLASH SALE</span>
            <span className="text-red-600 ml-2 text-sm">Up to 40% off selected items</span>
          </div>
          {/* BUG #5: CountdownTimer has stale closure — timer freezes */}
          <CountdownTimer initialSeconds={7200} label="Sale ends in" />
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <Link href="/products" className="text-indigo-600 hover:text-indigo-700 font-medium">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product) => (
            // BUG #2: No key here but ProductCard handles its own render
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Electronics", emoji: "💻", color: "bg-blue-50 border-blue-200" },
              { name: "Fashion", emoji: "👗", color: "bg-pink-50 border-pink-200" },
              { name: "Sports", emoji: "🏃", color: "bg-green-50 border-green-200" },
              { name: "Beauty", emoji: "✨", color: "bg-purple-50 border-purple-200" },
              { name: "Home", emoji: "🏠", color: "bg-amber-50 border-amber-200" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/products?category=${cat.name}`}
                className={`${cat.color} border rounded-xl p-6 text-center hover:shadow-md transition-shadow`}
              >
                <div className="text-4xl mb-2">{cat.emoji}</div>
                <div className="font-semibold text-gray-800">{cat.name}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Deals Section */}
      {deals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Today&apos;s Deals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {deals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

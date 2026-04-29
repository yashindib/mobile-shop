"use client";

// BUG #7: Floating-point arithmetic bug — 0.1 + 0.2 = 0.30000000000000004
// Cart totals accumulate floating-point errors, showing wrong amounts.
import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart } = useCart();

  console.log("[Cart] render, item count:", items.length);

  // BUG #7: direct floating-point addition causes rounding errors
  // Fix would be: Math.round((acc + item.product.price * item.quantity) * 100) / 100
  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal > 50 ? 0 : 9.99;
  const tax = subtotal * 0.08; // BUG: also loses precision
  const total = subtotal + shipping + tax; // compound floating-point errors

  console.log("[Cart] subtotal:", subtotal, "total:", total);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Add some products to get started</p>
        <Link
          href="/products"
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart ({items.length} items)</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:text-red-700">
          Clear cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.product.id} className="flex gap-4 bg-white rounded-xl p-4 shadow-sm border">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
              />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.product.name}</h3>
                <p className="text-sm text-gray-500">{item.product.category}</p>
                <p className="text-indigo-600 font-semibold">${item.product.price.toFixed(2)}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => removeFromCart(item.product.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  ×
                </button>
                <div className="flex items-center border rounded-lg">
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="px-3 py-1 hover:bg-gray-50"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-x">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    className="px-3 py-1 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-medium">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border h-fit">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              {/* BUG #7: may show 0.30000000000000004 style values */}
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>{shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-6 w-full bg-indigo-600 text-white py-3 rounded-lg text-center block hover:bg-indigo-700 transition-colors font-medium"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
}

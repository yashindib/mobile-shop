import Cart from "@/components/Cart";

export default function CartPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* BUG #7: Cart.tsx has floating-point total calculation bug */}
      <Cart />
    </div>
  );
}

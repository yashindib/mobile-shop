import { Product } from "@/types";
import { PRODUCTS } from "./mockData";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://api.mobelo-shop.dev";

console.log("[API] Initializing with base URL:", API_BASE);
console.log("[API] Environment:", process.env.NEXT_PUBLIC_APP_ENV);

export async function fetchProducts(category?: string): Promise<Product[]> {
  console.log("[fetchProducts] called with category:", category);

  // Simulated network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const products = category && category !== "All"
    ? PRODUCTS.filter((p) => p.category === category)
    : PRODUCTS;

  console.log("[fetchProducts] returning", products.length, "products");
  return products;
}

export async function fetchProductById(id: string): Promise<Product | null> {
  console.log("[fetchProductById] fetching id:", id);
  await new Promise((resolve) => setTimeout(resolve, 300));
  const product = PRODUCTS.find((p) => p.id === id) || null;
  console.log("[fetchProductById] found:", product?.name ?? "NOT FOUND");
  return product;
}

export async function searchProducts(query: string): Promise<Product[]> {
  console.log("[searchProducts] query:", query);
  await new Promise((resolve) => setTimeout(resolve, 200));
  const lower = query.toLowerCase();
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.tags.some((t) => t.includes(lower)) ||
      p.category.toLowerCase().includes(lower)
  );
}

// Auth API
export async function loginWithCredentials(email: string, password: string) {
  console.log("[loginWithCredentials] attempting login for:", email);
  console.log("[loginWithCredentials] API key in use:", process.env.NEXT_PUBLIC_AUTH_API_KEY);

  await new Promise((resolve) => setTimeout(resolve, 800));

  // Mock auth — accepts any non-empty credentials
  if (!email || !password) {
    console.error("[loginWithCredentials] missing credentials");
    throw new Error("Email and password are required");
  }

  const user = {
    id: "u-" + Math.random().toString(36).slice(2),
    name: email.split("@")[0],
    email,
    role: "customer" as const,
  };

  console.log("[loginWithCredentials] login successful, user:", user);
  return user;
}

export async function loginWithProvider(provider: string) {
  console.log("[loginWithProvider] provider:", provider);
  console.log("[loginWithProvider] client ID:", process.env[`NEXT_PUBLIC_${provider.toUpperCase()}_CLIENT_ID`]);
  // In a real app, this would redirect to OAuth flow
  return null;
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import ScanfixProvider from "@/components/ScanfixProvider";
import ScanfixTestButton from "@/components/ScanfixTestButton";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mobelo Shop — Premium E-Commerce",
  description: "Discover premium products across electronics, fashion, beauty, and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <ScanfixProvider />
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
            <ScanfixTestButton />
            <footer className="mt-16 bg-gray-900 text-gray-400 text-center py-8 text-sm">
              <p>© 2026 Mobelo Shop. Built with Next.js & React.</p>
              <p className="mt-1 text-xs">
                ENV: {process.env.NEXT_PUBLIC_APP_ENV ?? "development"}
              </p>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

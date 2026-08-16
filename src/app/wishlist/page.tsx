"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/KafFooter";
import MarqueeBanner from "@/components/MarqueeBanner";
import ProductCard from "@/components/ProductCard";
import { useWishlist } from "@/context/WishlistContext";

export default function WishlistPage() {
  const { items, clearWishlist } = useWishlist();

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <MarqueeBanner />
      <Header />
      <main className="mx-auto w-full max-w-[1280px] px-4 py-10 md:px-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#10B8C4]">Saved products</p>
            <h1 className="mt-1 text-2xl font-black text-[#111827] md:text-3xl">My Wishlist</h1>
            <p className="mt-1 text-sm text-[#6b7280]">{items.length} {items.length === 1 ? "product" : "products"}</p>
          </div>
          {items.length > 0 && (
            <button type="button" onClick={clearWishlist} className="rounded-md border border-[#d1d5db] bg-white px-4 py-2 text-sm font-bold text-[#4b5563] hover:border-[#dc2626] hover:text-[#dc2626]">
              Clear wishlist
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <section className="rounded-xl border border-dashed border-[#cfd4dc] bg-white px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eef9fa] text-[#10B8C4]">
              <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.7" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 00-.1-7.8z" /></svg>
            </div>
            <h2 className="text-lg font-extrabold text-[#1f2937]">Your wishlist is empty</h2>
            <p className="mt-2 text-sm text-[#6b7280]">পছন্দের product-এর heart icon-এ click করে এখানে save করুন।</p>
            <Link href="/" className="mt-6 inline-flex rounded-md bg-[#073763] px-6 py-3 text-sm font-bold text-white">Continue shopping</Link>
          </section>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {items.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/data/products";
import OrderModal from "./OrderModal";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { useWishlist } from "@/context/WishlistContext";
import { trackPixelEvent } from "@/lib/pixel";

const PRIMARY   = "#073763";
const SECONDARY = "#10B8C4";
const formatPrice = (value: number) => value.toLocaleString("en-US");

export default function ProductCard({ product }: { product: Product }) {
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"order" | "cart">("order");
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();
  const { customer } = useCustomer();
  const { addToWishlist, removeFromWishlist, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const pixelProductData = {
    content_ids: [product.id],
    content_name: product.name,
    content_type: "product",
    value: product.discountedPrice,
    currency: "BDT",
    num_items: 1,
  };

  const pixelUserData = customer
    ? { customerId: customer.Id, name: customer.name, phone: customer.phone || undefined }
    : undefined;

  const handleAddToCart = () => {
    if (product.inStock === false) return;
    if (product.hasVariants) {
      setModalMode("cart");
      setShowModal(true);
      return;
    }
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
    trackPixelEvent("AddToCart", pixelProductData, pixelUserData);
  };

  const handleOrderNow = () => {
    if (product.inStock === false) return;
    trackPixelEvent("InitiateCheckout", pixelProductData, pixelUserData);
    setModalMode("order");
    setShowModal(true);
  };

  const handleWishlist = () => {
    if (wishlisted) {
      removeFromWishlist(product.id);
      return;
    }
    addToWishlist(product);
    trackPixelEvent("AddToWishlist", pixelProductData, pixelUserData);
  };

  return (
    <>
      <div className="bg-white group relative flex h-full flex-col overflow-hidden border border-[#d9d9d9] transition-shadow hover:shadow-md" style={{ borderRadius: 4 }}>

        <button type="button" onClick={handleWishlist} className="product-wishlist" aria-label={`${wishlisted ? "Remove" : "Add"} ${product.name} ${wishlisted ? "from" : "to"} wishlist`} aria-pressed={wishlisted}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlisted ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 00-.1-7.8z"/></svg>
        </button>

        {product.inStock === false && (
          <span
            className="absolute z-10 text-white font-bold leading-tight"
            style={{ top: 6, left: 6, background: "#6b7280", borderRadius: 999, padding: "2px 7px", fontSize: 10 }}
          >
            Stock Out
          </span>
        )}

        {product.inStock !== false && product.discount > 0 && (
          <span
            className="absolute z-10 text-white font-bold leading-tight"
            style={{ top: 6, left: 6, background: SECONDARY, borderRadius: 999, padding: "2px 7px", fontSize: 10 }}
          >
            -{product.discount}%
          </span>
        )}

        {product.freeShipping && (
          <span
            className="absolute z-10 text-white font-bold leading-tight"
            style={{ top: 6, right: 0, background: PRIMARY, padding: "2px 7px", borderRadius: "4px 0 0 4px", fontSize: 9 }}
          >
            Free Shipping
          </span>
        )}

        <Link href={`/product/${product.id}`} className="block overflow-hidden">
          <div className="relative w-full bg-white" style={{ aspectRatio: "1 / 1" }}>
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-contain object-center p-1.5 transition-transform duration-300 group-hover:scale-105"
              draggable={false}
              unoptimized
            />
          </div>
        </Link>

        <Link
          href={`/product/${product.id}`}
          className="block overflow-hidden px-2 text-center font-medium text-[#222] transition-colors hover:text-[#073763]"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            minHeight: 34,
            lineHeight: "17px",
            fontSize: 12,
            marginTop: 6,
          }}
        >
          {product.name}
        </Link>

        <div className="mt-1 flex items-center justify-center gap-1.5 px-2">
          <span className="text-gray-400 line-through" style={{ fontSize: 11 }}>
            ৳{formatPrice(product.originalPrice)}
          </span>
          <span className="font-extrabold" style={{ color: SECONDARY, fontSize: 13 }}>
            ৳{formatPrice(product.discountedPrice)}
          </span>
        </div>

        <div className="mt-auto" style={{ display: "grid", gridTemplateColumns: "1fr 32px", gap: 5, padding: "8px 7px 7px" }}>
          <button
            onClick={handleOrderNow}
            disabled={product.inStock === false}
            className="whitespace-nowrap text-white font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            style={{ borderRadius: 3, height: 28, background: product.inStock === false ? "#b8bec8" : PRIMARY, fontSize: 10 }}
          >
            {product.inStock === false ? "STOCK OUT" : "ORDER NOW"}
          </button>
          <button
            onClick={handleAddToCart}
            disabled={product.inStock === false}
            className="flex items-center justify-center text-white transition-colors disabled:cursor-not-allowed disabled:opacity-70"
            style={{ width: 32, height: 28, borderRadius: 3, background: product.inStock === false ? "#b8bec8" : added ? "#16a34a" : SECONDARY }}
            title="Add to Cart"
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            ) : (
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {showModal && <OrderModal product={product} mode={modalMode} onClose={() => setShowModal(false)} />}

    </>
  );
}

"use client";
import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { NavItem, Product } from "@/data/products";
import { fetchNavItems } from "@/services/menuService";
import { fetchStorefrontProducts } from "@/services/productService";
import { fetchSiteSettings } from "@/services/settingService";
import { useCart } from "@/context/CartContext";
import { useCustomer } from "@/context/CustomerContext";
import { useWishlist } from "@/context/WishlistContext";
import { trackPixelEvent } from "@/lib/pixel";

const PRIMARY   = "#073763";   // logo navy
const SECONDARY = "#10B8C4";   // logo teal

interface HeaderProps {
  logoUrl?: string | null;
}

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: "MEN", sub: [] },
  { label: "WOMEN", sub: [] },
  { label: "KIDS", sub: [] },
  { label: "TEENS", sub: [] },
  { label: "SPORTS", sub: [] },
];

function LogoFallback() {
  return (
    <span aria-label="KAF LifeStyle" style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", color: PRIMARY, lineHeight: 0.82 }}>
      <strong style={{ fontSize: 35, fontWeight: 900, letterSpacing: "-0.08em" }}>KAF</strong>
      <small style={{ marginTop: 6, fontSize: 7, fontWeight: 700, letterSpacing: "0.28em" }}>LIFESTYLE</small>
    </span>
  );
}

function applyFavicon(url: string | null) {
  if (!url) return;
  const existing = document.querySelector<HTMLLinkElement>("link[rel~='icon']");
  const link = existing || document.createElement("link");
  link.rel = "icon";
  link.href = url;
  if (!existing) document.head.appendChild(link);
}

function HeaderInner({ logoUrl }: HeaderProps) {
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [openDrop,      setOpenDrop]      = useState<string | null>(null);
  const [mobileExpand,  setMobileExpand]  = useState<string | null>(null);
  const [search,        setSearch]        = useState("");
  const [navItems,      setNavItems]      = useState<NavItem[]>(DEFAULT_NAV_ITEMS);
  const [resolvedLogo,  setResolvedLogo]  = useState<string | null>(logoUrl || null);
  // Search dropdown
  const [allProducts,   setAllProducts]   = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [searchOpen,    setSearchOpen]    = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const searchRef       = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const lastSearchTrackedRef = useRef("");
  const navRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const activeMenu = searchParams.get("menu") || "";
  const activeSub  = searchParams.get("sub")  || "";
  const activeChild = searchParams.get("child") || "";

  // Fetch dynamic menu from backend; fall back to static if unavailable
  useEffect(() => {
    fetchNavItems().then((items) => {
      if (items.length > 0) setNavItems(items);
    });
  }, []);

  // Sync logo from prop (server-side) or fetch from API on client
  useEffect(() => {
    if (logoUrl) { setResolvedLogo(logoUrl); return; }
    fetchSiteSettings().then((s) => {
      setResolvedLogo(s.logoUrl || null);
      applyFavicon(s.faviconUrl);
    });
  }, [logoUrl]);

  // Lazily load all products when the search bar is first focused
  const loadProducts = useCallback(async () => {
    if (productsLoaded) return;
    try {
      const { products } = await fetchStorefrontProducts({ limit: 500 });
      setAllProducts(products);
      setProductsLoaded(true);
    } catch (e) {
      console.error("Search: failed to load products", e);
    }
  }, [productsLoaded]);

  // Filter products on every keystroke
  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) { setSearchResults([]); setSearchOpen(false); return; }
    const filtered = allProducts
      .filter((p) => p.name?.toLowerCase().includes(q))
      .slice(0, 10);
    setSearchResults(filtered);
    setSearchOpen(true);
  }, [search, allProducts]);

  // Close search dropdown when clicking outside (both mobile & desktop search)
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const t = e.target as Node;
      const outsideDesktop = !searchRef.current?.contains(t);
      const outsideMobile  = !mobileSearchRef.current?.contains(t);
      if (outsideDesktop && outsideMobile) setSearchOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  const { items, removeFromCart, totalItems, totalPrice } = useCart();
  const { totalItems: wishlistTotal } = useWishlist();
  const { isLoggedIn, logout: customerLogout, customer } = useCustomer();
  const [cartOpen, setCartOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const cartRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const q = search.trim();
    if (q.length < 2 || lastSearchTrackedRef.current === q) return;
    const timer = window.setTimeout(() => {
      lastSearchTrackedRef.current = q;
      trackPixelEvent(
        "Search",
        {
          content_ids: searchResults.map((item) => item.id),
          content_name: q,
          content_type: "product",
          value: 0,
          currency: "BDT",
          num_items: searchResults.length,
        },
        customer ? { customerId: customer.Id, name: customer.name, phone: customer.phone || undefined } : undefined,
      );
    }, 800);
    return () => window.clearTimeout(timer);
  }, [customer, search, searchResults]);

  const handleCartCheckout = () => {
    trackPixelEvent(
      "InitiateCheckout",
      { content_ids: items.map((i) => i.id), content_name: "Cart Checkout",
        content_type: "product", value: totalPrice, currency: "BDT", num_items: totalItems },
      customer ? { customerId: customer.Id, name: customer.name, phone: customer.phone || undefined } : undefined
    );
    setCartOpen(false);
    router.push("/checkout");
  };

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (cartRef.current && !cartRef.current.contains(e.target as Node))
        setCartOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node))
        setOpenDrop(null);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <header className="site-header w-full sticky top-0 z-50">

      {/* ── Logo / Search / Cart bar ── */}
      <div className="bg-white border-b border-gray-100">

        {/* ══ MOBILE layout (< md): 2 rows ══ */}
        <div className="md:hidden">
          {/* Row 1: hamburger | logo | cart */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px" }}>

            {/* Hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{ color: "#374151", background: "none", border: "none", cursor: "pointer", padding: 4, flexShrink: 0 }}>
              <svg width={26} height={26} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path d="M3 12h18M3 6h18M3 18h18" />
              </svg>
            </button>

            {/* Logo — centered */}
            <Link href="/" style={{ flex: 1, display: "flex", justifyContent: "center" }}>
              <div style={{ position: "relative", width: 110, height: 44 }}>
                {resolvedLogo ? (
                  <img src={resolvedLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                ) : (
                  <LogoFallback />
                )}
              </div>
            </Link>

            {/* Cart icon */}
            <div ref={cartRef} className="relative" style={{ flexShrink: 0 }}>
              <button
                onClick={() => setCartOpen((o) => !o)}
                className="flex items-center text-gray-600 hover:text-[#073763] transition-colors"
                style={{ background: "none", border: "none", cursor: "pointer", padding: 4, position: "relative" }}
              >
                <div className="relative">
                  <svg width={26} height={26} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                  </svg>
                  <span
                    className="absolute -top-2 -right-2 text-white flex items-center justify-center rounded-full font-bold"
                    style={{ background: SECONDARY, width: 18, height: 18, fontSize: 11, lineHeight: "18px" }}
                  >{totalItems}</span>
                </div>
              </button>

              {/* Cart dropdown */}
              {cartOpen && (
                <div className="absolute right-0 top-full z-[9999]" style={{ paddingTop: 8 }}>
                  <div className="bg-white shadow-2xl" style={{ width: "min(380px, calc(100vw - 24px))", borderRadius: 8, border: "1px solid #eee" }}>
                    {items.length === 0 ? (
                      <p style={{ padding: "20px 16px", textAlign: "center", color: "#999", fontSize: 13 }}>Cart is empty</p>
                    ) : (
                      <>
                        <div style={{ maxHeight: 340, overflowY: "auto" }}>
                          {items.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid #f5f5f5" }}>
                              <Image src={item.image} alt={item.name} width={52} height={52} style={{ borderRadius: 6, objectFit: "cover", border: "1px solid #eee", flexShrink: 0 }} unoptimized />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                                <p style={{ margin: "3px 0 0", fontSize: 12, color: "#777" }}>Qty: {item.qty}</p>
                              </div>
                              <span style={{ fontSize: 13, fontWeight: 700, color: "#333", flexShrink: 0 }}>৳{(item.price * item.qty).toLocaleString("en-US")}</span>
                              <button onClick={() => removeFromCart(idx)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#aaa", flexShrink: 0 }} title="Remove">
                                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: "10px 14px", borderTop: "2px solid #f0f0f0" }}>
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 13, fontWeight: 700, color: "#333" }}>TOTAL : ৳{totalPrice.toLocaleString("en-US")}</span>
                          </div>
                          <button onClick={handleCartCheckout} style={{ width: "100%", background: SECONDARY, color: "#fff", border: "none", borderRadius: 6, padding: "10px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                            Order Now
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Search bar — full width */}
          <div style={{ padding: "0 14px 10px", position: "relative" }} ref={mobileSearchRef}>
            <div style={{ display: "flex", alignItems: "center", height: 40, border: `2px solid ${PRIMARY}`, borderRadius: 50, overflow: "hidden" }}>
              <button
                style={{ width: 44, height: "100%", background: "#f7f7f7", display: "flex", alignItems: "center", justifyContent: "center", border: "none", flexShrink: 0, cursor: "pointer" }}
                onClick={() => search.trim() && setSearchOpen((o) => !o)}
              >
                <svg width={18} height={18} fill="none" stroke={PRIMARY} strokeWidth={2.5} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search Product..."
                value={search}
                onFocus={loadProducts}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                style={{ flex: 1, height: "100%", background: "#f7f7f7", border: "none", outline: "none", padding: "0 10px", fontSize: 13, color: "#555" }}
              />
              {search && (
                <button onClick={() => { setSearch(""); setSearchOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 10px", color: "#999", flexShrink: 0, fontSize: 18, lineHeight: 1 }}>×</button>
              )}
            </div>

            {/* Search results */}
            {searchOpen && searchResults.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 14, right: 14, background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", borderRadius: 8, border: "1px solid #e5e7eb", zIndex: 9999, maxHeight: 400, overflowY: "auto" }}>
                {searchResults.map((p, idx) => (
                  <Link key={p.id} href={`/product/${p.id}`} onClick={() => { setSearchOpen(false); setSearch(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", borderBottom: idx < searchResults.length - 1 ? "1px solid #f3f4f6" : "none", textDecoration: "none" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb", flexShrink: 0, position: "relative", background: "#f9fafb" }}>
                      <Image src={p.image} alt={p.name} fill className="object-contain" unoptimized />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, color: "#1f2937", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                        {p.discount > 0 && <span style={{ fontSize: 11, color: "#9ca3af", textDecoration: "line-through" }}>৳{p.originalPrice.toLocaleString("en-US")}</span>}
                        <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>৳{p.discountedPrice.toLocaleString("en-US")}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {searchOpen && search.trim() && searchResults.length === 0 && productsLoaded && (
              <div style={{ position: "absolute", top: "calc(100% + 2px)", left: 14, right: 14, background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", borderRadius: 8, border: "1px solid #e5e7eb", zIndex: 9999, padding: "14px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                কোনো পণ্য পাওয়া যায়নি
              </div>
            )}
          </div>
        </div>

        {/* ══ DESKTOP layout (md+): logo | nav | search | icons ══ */}
        <div className="hidden md:grid header-logo-bar">
          {/* 1. Logo */}
          <Link href="/" className="flex items-center">
            <div className="desktop-logo-box">
              {resolvedLogo ? (
                <img src={resolvedLogo} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "left center" }} />
              ) : (
                <LogoFallback />
              )}
            </div>
          </Link>

          {/* 2. Desktop Navigation */}
          <nav className="desktop-main-nav" ref={navRef}>
            <ul className="desktop-navigation flex items-center">
              {navItems.slice(0, 5).map((item) => {
                const subItems = Array.isArray(item.sub) ? item.sub : [];
                const isActive = activeMenu.toLowerCase() === item.label.toLowerCase();
                const menuProducts = allProducts.filter((product) => product.category?.toLowerCase() === item.label.toLowerCase()).slice(0, 6);
                const itemIndex = navItems.findIndex((navItem) => navItem.label === item.label);
                const menuAccent = ["#ff5b73", "#f24ca5", "#f97316", "#eab308", "#08a89f"][itemIndex % 5];

                return (
                  <li
                    key={item.label}
                    className="relative"
                    onMouseEnter={() => {
                      if (subItems.length === 0) return;
                      setOpenDrop(item.label);
                      void loadProducts();
                    }}
                    onMouseLeave={() => setOpenDrop(null)}
                  >
                    <Link
                      href={`/?menu=${encodeURIComponent(item.label)}`}
                      className="desktop-nav-link flex items-center gap-1 uppercase font-semibold whitespace-nowrap transition-colors"
                      style={{
                        fontSize: 13,
                        padding: "30px 6px 27px",
                        display: "flex",
                        borderBottom: isActive ? `3px solid ${SECONDARY}` : "3px solid transparent",
                      }}
                    >
                      {item.label}
                    </Link>

                    {subItems.length > 0 && openDrop === item.label && (
                      <div className="header-mega-menu animate-fadeIn" style={{ borderTopColor: menuAccent }}>
                        <div className="header-mega-content">
                          <div className="header-mega-taxonomy">
                            {subItems.slice(0, 3).map((sub) => {
                              const childItems = Array.isArray(sub.childItems) ? sub.childItems : [];
                              return (
                                <section key={`mega-${sub.label}`} className="header-mega-column">
                                  <Link href={`/?menu=${encodeURIComponent(item.label)}&sub=${encodeURIComponent(sub.label)}`} className="header-mega-heading" style={{ color: menuAccent }} onClick={() => setOpenDrop(null)}>{sub.label}</Link>
                                  {(childItems.length ? childItems : [{ label: sub.label }]).slice(0, 10).map((child) => (
                                    <Link key={`mega-${sub.label}-${child.label}`} href={`/?menu=${encodeURIComponent(item.label)}&sub=${encodeURIComponent(sub.label)}${childItems.length ? `&child=${encodeURIComponent(child.label)}` : ""}`} className="header-mega-category" onClick={() => setOpenDrop(null)}>{child.label}</Link>
                                  ))}
                                </section>
                              );
                            })}
                          </div>
                          <section className="header-mega-arrivals">
                            <h3 style={{ color: menuAccent }}>New Arrivals</h3>
                            <div className="header-mega-products">
                              {menuProducts.map((product) => (
                                <Link key={`mega-product-${product.id}`} href={`/product/${product.id}`} className="header-mega-product" onClick={() => setOpenDrop(null)}>
                                  <span><Image src={product.image} alt={product.name} fill sizes="120px" className="object-contain" unoptimized /></span>
                                  <p>{product.name}</p>
                                </Link>
                              ))}
                              {menuProducts.length === 0 && <p className="header-mega-loading">Loading products…</p>}
                            </div>
                          </section>
                        </div>
                        <Link href={`/?menu=${encodeURIComponent(item.label)}`} className="header-mega-all" style={{ color: menuAccent }} onClick={() => setOpenDrop(null)}>View All {item.label} →</Link>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* 3. Search */}
          <div className="desktop-search" ref={searchRef}>
            <div className="desktop-search-box">
              <button
                className="desktop-search-button"
                onClick={() => search.trim() && setSearchOpen((o) => !o)}
                aria-label="Search"
              >
                <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search"
                value={search}
                onFocus={loadProducts}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                className="desktop-search-input"
              />
              {search && (
                <button onClick={() => { setSearch(""); setSearchOpen(false); }} style={{ background: "none", border: "none", cursor: "pointer", padding: "0 10px", color: "#999", flexShrink: 0, fontSize: 18, lineHeight: 1 }}>×</button>
              )}
            </div>

            {searchOpen && searchResults.length > 0 && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", borderRadius: 8, border: "1px solid #e5e7eb", zIndex: 9999, maxHeight: 480, overflowY: "auto" }}>
                {searchResults.map((p, idx) => (
                  <Link key={p.id} href={`/product/${p.id}`} onClick={() => { setSearchOpen(false); setSearch(""); }}
                    style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderBottom: idx < searchResults.length - 1 ? "1px solid #f3f4f6" : "none", textDecoration: "none", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <div style={{ width: 50, height: 50, borderRadius: 6, overflow: "hidden", border: "1px solid #e5e7eb", flexShrink: 0, position: "relative", background: "#f9fafb" }}>
                      <Image src={p.image} alt={p.name} fill className="object-contain" unoptimized />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 14, color: "#1f2937", fontWeight: 500 }}>{p.name}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 3 }}>
                        {p.discount > 0 && <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through" }}>৳{p.originalPrice.toLocaleString("en-US")}</span>}
                        <span style={{ fontSize: 13, fontWeight: 700, color: PRIMARY }}>৳{p.discountedPrice.toLocaleString("en-US")}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {searchOpen && search.trim() && searchResults.length === 0 && productsLoaded && (
              <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", boxShadow: "0 8px 32px rgba(0,0,0,0.15)", borderRadius: 8, border: "1px solid #e5e7eb", zIndex: 9999, padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                কোনো পণ্য পাওয়া যায়নি
              </div>
            )}
          </div>

          {/* 4. Right icons */}
          <div className="desktop-actions">
            <Link href="/track-order" className="header-action">
              <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 3v5h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              <span>Track</span>
            </Link>

            <Link href="/stores" className="header-action" aria-label="Stores">
              <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1116 0z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              <span>Stores</span>
            </Link>

            <div
              className="profile-menu"
              style={{ position: "relative", alignSelf: "stretch", display: "flex", alignItems: "center" }}
              onMouseEnter={() => setProfileOpen(true)}
              onMouseLeave={() => setProfileOpen(false)}
              onFocusCapture={() => setProfileOpen(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setProfileOpen(false);
                }
              }}
            >
              <Link href={isLoggedIn ? "/account" : "/login"} className="header-action" aria-haspopup="menu">
                <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                <span>Profile</span>
              </Link>

              <div
                className="profile-menu-dropdown"
                role="menu"
                aria-hidden={!profileOpen}
                style={{
                  position: "absolute",
                  zIndex: 120,
                  top: "100%",
                  right: -28,
                  width: 250,
                  visibility: profileOpen ? "visible" : "hidden",
                  transform: profileOpen ? "translateY(0)" : "translateY(8px)",
                  border: "1px solid #eceef2",
                  background: "#fff",
                  boxShadow: "0 14px 34px rgba(15, 23, 42, 0.16)",
                  opacity: profileOpen ? 1 : 0,
                  pointerEvents: profileOpen ? "auto" : "none",
                  transition: "opacity 0.18s ease, transform 0.18s ease, visibility 0.18s ease",
                }}
              >
                <div className="profile-menu-welcome" style={{ padding: "22px 20px", borderBottom: "1px solid #eceef2" }}>
                  <p style={{ margin: "0 0 10px", color: "#374151", fontSize: 13 }}>Welcome</p>
                  {isLoggedIn ? (
                    <Link href="/account" role="menuitem" style={{ color: PRIMARY, fontSize: 13, fontWeight: 800 }}>{customer?.name || "My Account"}</Link>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Link href="/login" role="menuitem" style={{ color: PRIMARY, fontSize: 13, fontWeight: 800 }}>Sign in</Link>
                      <span style={{ color: "#c4c7cf" }}>/</span>
                      <Link href="/login?mode=register" role="menuitem" style={{ color: PRIMARY, fontSize: 13, fontWeight: 800 }}>Sign up</Link>
                    </div>
                  )}
                </div>

                <div className="profile-menu-links" style={{ padding: "14px 0" }}>
                  {isLoggedIn && (
                    <Link href="/account" role="menuitem" style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 20px", color: "#505666", fontSize: 13 }}>
                      <span aria-hidden="true">●</span> My Account
                    </Link>
                  )}
                  <Link href="/track-order" role="menuitem" style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 20px", color: "#505666", fontSize: 13 }}>
                    <span aria-hidden="true">▣</span> Track Order
                  </Link>
                  <Link href="/page/about-us" role="menuitem" style={{ display: "flex", alignItems: "center", gap: 13, padding: "12px 20px", color: "#505666", fontSize: 13 }}>
                    <span aria-hidden="true">●</span> About Us
                  </Link>
                  {isLoggedIn && (
                    <button type="button" onClick={customerLogout} role="menuitem" style={{ display: "flex", width: "100%", alignItems: "center", gap: 13, padding: "12px 20px", border: 0, background: "transparent", color: "#505666", textAlign: "left", fontSize: 13, cursor: "pointer" }}>
                      <span aria-hidden="true">↪</span> Logout
                    </button>
                  )}
                </div>
              </div>
            </div>

            <Link href="/wishlist" className="header-action" aria-label={`Wishlist, ${wishlistTotal} items`}>
              <div className="relative">
                <svg width={24} height={24} fill="none" stroke="currentColor" strokeWidth={1.6} viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 00-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 00-.1-7.8z" /></svg>
                {wishlistTotal > 0 && <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold text-white" style={{ background: SECONDARY }}>{wishlistTotal}</span>}
              </div>
              <span>Wishlist</span>
            </Link>

            {/* Cart with hover dropdown */}
            <div ref={cartRef} className="relative" onMouseEnter={() => setCartOpen(true)} onMouseLeave={() => setCartOpen(false)}>
              <button className="header-action">
                <div className="relative">
                  <svg width={26} height={26} fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0" />
                  </svg>
                  <span className="absolute -top-2 -right-2 text-white flex items-center justify-center rounded-full font-bold" style={{ background: SECONDARY, width: 18, height: 18, fontSize: 11, lineHeight: "18px" }}>{totalItems}</span>
                </div>
                <span style={{ fontSize: 11 }}>৳{totalPrice.toLocaleString("en-US")}</span>
              </button>

              {cartOpen && (
                <div className="absolute right-0 top-full z-[9999]" style={{ paddingTop: 8 }}>
                  <div className="bg-white shadow-2xl" style={{ width: "min(420px, calc(100vw - 24px))", borderRadius: 8, border: "1px solid #eee" }}>
                    {items.length === 0 ? (
                      <p style={{ padding: "20px 16px", textAlign: "center", color: "#999", fontSize: 13 }}>Cart is empty</p>
                    ) : (
                      <>
                        <div style={{ maxHeight: 380, overflowY: "auto" }}>
                          {items.map((item, idx) => (
                            <div key={idx} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #f5f5f5" }}>
                              <Image src={item.image} alt={item.name} width={64} height={64} style={{ borderRadius: 8, objectFit: "cover", border: "1px solid #eee", flexShrink: 0 }} unoptimized />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#333", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.name}</p>
                                <p style={{ margin: "5px 0 0", fontSize: 13, color: "#777" }}>Qty: {item.qty}</p>
                              </div>
                              <span style={{ fontSize: 14, fontWeight: 700, color: "#333", flexShrink: 0 }}>৳{(item.price * item.qty).toLocaleString("en-US")}</span>
                              <button onClick={() => removeFromCart(idx)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#aaa", flexShrink: 0 }} title="Remove">
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                              </button>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: "12px 14px", borderTop: "2px solid #f0f0f0" }}>
                          <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: "#333" }}>TOTAL : ৳{totalPrice.toLocaleString("en-US")}</span>
                          </div>
                          <button onClick={handleCartCheckout} style={{ width: "100%", background: SECONDARY, color: "#fff", border: "none", borderRadius: 6, padding: "12px 0", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                            Order Now
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {mobileOpen && (
        <nav className="mobile-navigation md:hidden">
          <div className="mobile-navigation-inner">
            {navItems.map((item) => {
              const subItems = Array.isArray(item.sub) ? item.sub : [];
              const isExpanded = mobileExpand === item.label;

              return (
                <div key={item.label}>
                  <div
                    className="flex items-center justify-between text-white border-b cursor-pointer"
                    style={{ fontSize: 14, padding: "12px 16px", borderColor: "rgba(255,255,255,0.2)" }}
                    onClick={() => {
                      if (subItems.length > 0) {
                        setMobileExpand(isExpanded ? null : item.label);
                      } else {
                        router.push(`/?menu=${encodeURIComponent(item.label)}`);
                        setMobileOpen(false);
                      }
                    }}
                  >
                    <Link
                      href={`/?menu=${encodeURIComponent(item.label)}`}
                      className="flex-1 text-white"
                      onClick={(e) => subItems.length > 0 && e.preventDefault()}
                    >
                      {item.label}
                    </Link>
                    {subItems.length > 0 && (
                      <span className="text-white/60 ml-2">{isExpanded ? "▾" : "›"}</span>
                    )}
                  </div>

                  {isExpanded && subItems.length > 0 && (
                    <div style={{ backgroundColor: "rgba(0,0,0,0.25)" }}>
                      {subItems.map((sub) => (
                        <div key={sub.label}>
                          <Link
                            href={`/?menu=${encodeURIComponent(item.label)}&sub=${encodeURIComponent(sub.label)}`}
                            className="flex items-center gap-2 text-white/90 border-b"
                            style={{ fontSize: 13, padding: "10px 28px", borderColor: "rgba(255,255,255,0.1)" }}
                            onClick={() => setMobileOpen(false)}
                          >
                            <span style={{ color: PRIMARY }}>›</span>
                            {sub.label}
                          </Link>
                          {(sub.childItems || []).map((child) => (
                            <Link
                              key={`${sub.label}-${child.label}`}
                              href={`/?menu=${encodeURIComponent(item.label)}&sub=${encodeURIComponent(sub.label)}&child=${encodeURIComponent(child.label)}`}
                              className="flex items-center gap-2 text-white/80 border-b"
                              style={{ fontSize: 12, padding: "9px 28px 9px 46px", borderColor: "rgba(255,255,255,0.08)" }}
                              onClick={() => setMobileOpen(false)}
                            >
                              <span style={{ color: PRIMARY }}>›</span>
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

export default function Header({ logoUrl }: HeaderProps) {
  return (
    <Suspense>
      <HeaderInner logoUrl={logoUrl} />
    </Suspense>
  );
}

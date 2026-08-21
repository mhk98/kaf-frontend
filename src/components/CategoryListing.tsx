"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";
import type { Product } from "@/data/products";
import type { CategoryMenuItem } from "@/services/menuService";

interface Props {
  menu: string;
  sub?: string;
  child?: string;
  products: Product[];
  categories: CategoryMenuItem[];
  initialOffer?: "all" | "deal" | "new" | "top" | "delivery";
}

export default function CategoryListing({ menu, sub, child, products, categories, initialOffer = "all" }: Props) {
  const [sort, setSort] = useState("newest");
  const [stockOnly, setStockOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [offer, setOffer] = useState<"all" | "deal" | "new" | "top" | "delivery">(initialOffer);
  const currentCategory = categories.find((category) => category.label.toLowerCase() === menu.toLowerCase());
  const categoryProducts = useMemo(() => products.filter((product) => product.category?.toLowerCase() === menu.toLowerCase()), [products, menu]);

  const subcategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    categoryProducts.forEach((product) => {
      if (product.subCategory) counts.set(product.subCategory, (counts.get(product.subCategory) || 0) + 1);
    });
    return [...counts.entries()];
  }, [categoryProducts]);

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    const list = categoryProducts.filter((product) => {
      if (sub && product.subCategory?.toLowerCase() !== sub.toLowerCase()) return false;
      if (child && product.childCategory?.toLowerCase() !== child.toLowerCase()) return false;
      if (stockOnly && product.inStock === false) return false;
      if (query && !product.name.toLowerCase().includes(query)) return false;
      if (offer === "deal" && product.discount <= 0) return false;
      if (offer === "top" && !product.bestDeals) return false;
      if (offer === "delivery" && !product.freeShipping) return false;
      if (offer === "new" && !product.createdAt) return false;
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "price-low") return a.discountedPrice - b.discountedPrice;
      if (sort === "price-high") return b.discountedPrice - a.discountedPrice;
      if (sort === "name") return a.name.localeCompare(b.name);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
  }, [categoryProducts, sort, stockOnly, search, offer, sub, child]);

  const countCategory = (label: string) => products.filter((product) => product.category?.toLowerCase() === label.toLowerCase()).length;
  const countSubcategory = (category: string, subcategory: string) => products.filter((product) => product.category?.toLowerCase() === category.toLowerCase() && product.subCategory?.toLowerCase() === subcategory.toLowerCase()).length;

  const title = child || sub || menu;

  return (
    <div className="catalog-page">
      <div className="catalog-breadcrumb"><Link href="/">Home</Link><span>›</span><Link href={`/?menu=${encodeURIComponent(menu)}`}>{menu}</Link>{sub && <><span>›</span><span>{sub}</span></>}{child && <><span>›</span><span>{child}</span></>}</div>
      <div className="catalog-layout">
        <aside className={`catalog-sidebar ${sidebarOpen ? "is-open" : ""}`}>
          <section className="catalog-specials"><h2>Special Offers</h2><button className={offer === "deal" ? "active" : ""} onClick={() => setOffer(offer === "deal" ? "all" : "deal")}>ϟ Mega Deal</button><button className={offer === "new" ? "active" : ""} onClick={() => setOffer(offer === "new" ? "all" : "new")}>ϟ New Arrival</button><button className={offer === "top" ? "active" : ""} onClick={() => setOffer(offer === "top" ? "all" : "top")}>ϟ Top Selling</button><button className={offer === "delivery" ? "active" : ""} onClick={() => setOffer(offer === "delivery" ? "all" : "delivery")}>ϟ Free Delivery</button><button onClick={() => setOffer("all")}>ϟ Merchandise</button></section>
          <section className="catalog-category-tree"><h2>Categories</h2>
            {categories.map((category) => <div key={category.Id} className={`catalog-tree-category ${category.label.toLowerCase() === menu.toLowerCase() ? "current" : ""}`}><Link href={`/?menu=${encodeURIComponent(category.label)}`}><strong>{category.label}</strong><span>{countCategory(category.label)}</span></Link>{(category.sub || []).map((item) => <div key={`${category.Id}-${item.label}`}><Link className={sub?.toLowerCase() === item.label.toLowerCase() && category.label.toLowerCase() === menu.toLowerCase() ? "active" : ""} href={`/?menu=${encodeURIComponent(category.label)}&sub=${encodeURIComponent(item.label)}`}>{item.label}<span>{countSubcategory(category.label, item.label)}</span></Link>{category.label.toLowerCase() === menu.toLowerCase() && sub?.toLowerCase() === item.label.toLowerCase() && (item.childItems || []).map((childItem) => <Link key={childItem.label} className={`catalog-child ${child?.toLowerCase() === childItem.label.toLowerCase() ? "active" : ""}`} href={`/?menu=${encodeURIComponent(category.label)}&sub=${encodeURIComponent(item.label)}&child=${encodeURIComponent(childItem.label)}`}>{childItem.label}</Link>)}</div>)}</div>)}
          </section>
          <section><h2>Availability</h2><label className="catalog-check"><input type="checkbox" checked={stockOnly} onChange={(event) => setStockOnly(event.target.checked)} /> In stock only</label></section>
        </aside>

        <main className="catalog-results">
          <div className="catalog-search-row"><label><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search a product" /></label></div>
          <div className="catalog-audience-row">{categories.filter((category) => /^(men|women|kids|teens)$/i.test(category.label)).slice(0, 4).map((category, index) => <Link key={category.Id} href={`/?menu=${encodeURIComponent(category.label)}`} className={category.label.toLowerCase() === menu.toLowerCase() ? "active" : ""} data-tone={index}>{category.label}</Link>)}</div>
          <div className="catalog-chip-row"><div>{subcategoryCounts.map(([label, count]) => <Link key={label} className={sub?.toLowerCase() === label.toLowerCase() ? "active" : ""} href={`/?menu=${encodeURIComponent(menu)}&sub=${encodeURIComponent(label)}`}>{label} <small>{count}</small></Link>)}</div><Link href="/checkout" className="catalog-cart-shortcut" aria-label="Open cart"><svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3h2l2 12h11l2-8H7"/><circle cx="10" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></svg></Link></div>
          <header className="catalog-header"><div><h1>{title}</h1><p>{visibleProducts.length} products</p></div><div className="catalog-toolbar"><button type="button" className="catalog-filter-toggle" onClick={() => setSidebarOpen((open) => !open)}>☰ Filters</button><label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="newest">Newest</option><option value="price-low">Price: Low to High</option><option value="price-high">Price: High to Low</option><option value="name">Name</option></select></label></div></header>
          {visibleProducts.length > 0 ? <div className="catalog-grid">{visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="catalog-empty"><h2>No products found</h2><p>Try another category or filter.</p></div>}
        </main>
      </div>
    </div>
  );
}

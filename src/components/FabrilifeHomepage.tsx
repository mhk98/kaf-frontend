import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import type { Product } from "@/data/products";
import type { BannerItem } from "@/services/bannerService";
import type { CategoryMenuItem } from "@/services/menuService";
import type { SiteSetting } from "@/services/settingService";
import type { BrandItem } from "@/services/brandService";

interface Props {
  products: Product[];
  categories: CategoryMenuItem[];
  banners: BannerItem[];
  settings: Partial<SiteSetting>;
  brands: BrandItem[];
}

const sectionAccents = ["#173b63", "#9a4f62", "#4f6b45", "#9a6a2f", "#4f4b78", "#246b70"];

function CategorySectionHeader({ category, productCount, index }: { category: CategoryMenuItem; productCount: number; index: number }) {
  const accent = sectionAccents[index % sectionAccents.length];
  return (
    <header className="fl-category-section-header" style={{ borderColor: accent }}>
      <span className="fl-category-section-index" style={{ color: accent }}>{String(index + 1).padStart(2, "0")}</span>
      <div className="fl-category-section-copy">
        <small style={{ color: accent }}>Shop the collection</small>
        <h2>{category.label}</h2>
        <p>{productCount} products in this collection</p>
      </div>
      <Link href={`/?menu=${encodeURIComponent(category.label)}`} className="fl-category-section-link" style={{ color: accent, borderColor: `${accent}55` }}>
        View collection <span aria-hidden="true">→</span>
      </Link>
    </header>
  );
}

const originalPartnerLogos = [
  { name: "Grameenphone", file: "https://commons.wikimedia.org/wiki/Special:FilePath/Grameenphone%20Logo%20GP%20Logo.svg" },
  { name: "HP", file: "https://commons.wikimedia.org/wiki/Special:FilePath/HP%20logo%202008.svg" },
  { name: "Ericsson", file: "https://commons.wikimedia.org/wiki/Special:FilePath/Ericsson%20logo%20(2).svg" },
  { name: "UNDP", file: "https://commons.wikimedia.org/wiki/Special:FilePath/UNDP%20logo.svg" },
  { name: "SKF", file: "https://commons.wikimedia.org/wiki/Special:FilePath/SKF%20logo.svg" },
  { name: "SK+F", file: "https://commons.wikimedia.org/wiki/Special:FilePath/Logo%20of%20SK%2BF.svg" },
  { name: "Qatar Airways", file: "https://commons.wikimedia.org/wiki/Special:FilePath/Qatar%20Airways%20Logo.png" },
  { name: "Wikimedia Bangladesh", file: "https://commons.wikimedia.org/wiki/Special:FilePath/Wikimedia%20Bangladesh%20logo.svg" },
  { name: "Bangladesh", file: "https://commons.wikimedia.org/wiki/Special:FilePath/National%20emblem%20of%20Bangladesh.svg" },
  { name: "British High Commission", file: "https://commons.wikimedia.org/wiki/Special:FilePath/Royal%20Coat%20of%20Arms%20of%20the%20United%20Kingdom.svg" },
  { name: "United Nations", file: "https://commons.wikimedia.org/wiki/Special:FilePath/Emblem%20of%20the%20United%20Nations.svg" },
  { name: "Bangladesh Armed Forces", file: "https://upload.wikimedia.org/wikipedia/commons/5/50/%E0%A6%AC%E0%A6%BE%E0%A6%82%E0%A6%B2%E0%A6%BE%E0%A6%A6%E0%A7%87%E0%A6%B6_%E0%A6%B8%E0%A6%B6%E0%A6%B8%E0%A7%8D%E0%A6%A4%E0%A7%8D%E0%A6%B0_%E0%A6%AC%E0%A6%BE%E0%A6%B9%E0%A6%BF%E0%A6%A8%E0%A7%80%E0%A6%B0_%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%A4%E0%A7%80%E0%A6%95.svg" },
];

function ProductTile({ product, large = false }: { product: Product; large?: boolean }) {
  return (
    <Link href={`/product/${product.id}`} className={`fl-product group ${large ? "fl-product-large" : ""}`}>
      <div className="fl-product-image">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={large ? "33vw" : "16vw"}
          className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.035]"
          unoptimized
        />
      </div>
      <div className="fl-product-price">
        <strong>৳ {product.discountedPrice.toLocaleString("en-US")}</strong>
        {product.originalPrice > product.discountedPrice && <del>৳ {product.originalPrice.toLocaleString("en-US")}</del>}
      </div>
    </Link>
  );
}

function EditorialGroup({ category, products, reverse }: { category: CategoryMenuItem; products: Product[]; reverse?: boolean }) {
  if (!category.imageUrl || products.length === 0) return null;
  return (
    <section className={`fl-editorial ${reverse ? "fl-editorial-reverse" : ""}`}>
      <Link href={`/?menu=${encodeURIComponent(category.label)}`} className="fl-editorial-cover group">
        <Image src={category.imageUrl} alt={category.label} fill sizes="34vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.025]" unoptimized />
        <span>{category.label}</span>
      </Link>
      <div className="fl-editorial-products">
        {products.slice(0, 8).map((product) => <ProductTile key={product.id} product={product} />)}
        <Link href={`/?menu=${encodeURIComponent(category.label)}`} className="fl-view-more">View<br />More</Link>
      </div>
    </section>
  );
}

export default function FabrilifeHomepage({ products, categories, banners, settings, brands }: Props) {
  const promos = banners.filter((banner) => /home promo/i.test(banner.category || ""));
  const stories = banners.filter((banner) => /home story/i.test(banner.category || ""));
  const wideBanners = banners.filter((banner) => /home (app|affiliate|bulk)/i.test(banner.category || ""));
  const categoryGroups = categories.map((category) => ({
    category,
    products: products.filter((product) => product.category?.toLowerCase() === category.label.toLowerCase()),
  }));
  const categoryBatches = Array.from(
    { length: Math.ceil(categoryGroups.length / 6) },
    (_, index) => categoryGroups.slice(index * 6, index * 6 + 6),
  );
  const lowerGroups: typeof categoryGroups = [];
  const topSellingProducts = [
    ...products.filter((product) => product.bestDeals),
    ...products.filter((product) => !product.bestDeals),
  ].slice(0, 12);
  const bulkBanner = wideBanners.find((banner) => /bulk/i.test(banner.category || ""));
  const affiliateBanner = wideBanners.find((banner) => /affiliate|app/i.test(banner.category || ""));

  return (
    <div className="fl-home-shell">
      <nav className="fl-quick-links" aria-label="Quick shop links">
        <Link href="#collections">Shop now</Link>
        {categories.slice(0, 3).map((category) => <Link key={category.Id} href={`/?menu=${encodeURIComponent(category.label)}`}>{category.label}</Link>)}
        <div className="fl-app-links">
          <span>Get 5% off on app</span>
          <a href="#" aria-label="Get it on Google Play" className="fl-store-badge"><b className="fl-play-mark">▶</b><small>GET IT ON</small><strong>Google Play</strong></a>
          <a href="#" aria-label="Download on the App Store" className="fl-store-badge"><b className="fl-apple-mark">●</b><small>Download on the</small><strong>App Store</strong></a>
        </div>
      </nav>

      <div className="fl-announcement"><strong>Event T-shirt ›</strong> {settings.marqueeText || "Custom clothing with your brand logo or design? We deliver quality apparel at unbeatable prices."} <b>Click here ●</b></div>

      <section id="collections" className="fl-new-arrival">
        <h1>New Arrival</h1>
        <div className="fl-new-grid">{products.slice(0, 30).map((product) => <ProductTile key={product.id} product={product} />)}</div>
      </section>

      {topSellingProducts.length > 0 && (
        <section className="fl-top-selling" aria-labelledby="top-selling-title">
          <header className="mb-4 flex flex-col items-center bg-white px-4 py-9 text-center md:mb-5 md:py-12">
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-[0.26em] text-[#b9780d] md:text-[11px]">
              Customer Favorites
            </p>
            <h2
              id="top-selling-title"
              className="text-[26px] font-semibold leading-tight tracking-[-0.025em] text-[#18201d] md:text-[32px]"
            >
              Top Selling Products
            </h2>
            <p className="mt-2.5 max-w-xl text-xs leading-5 text-[#6f7672] md:text-sm">
              Discover the styles our customers love most.
            </p>
            <span className="mt-4 block h-0.5 w-11 bg-[#d69a32]" aria-hidden="true" />
          </header>
          <div className="fl-top-selling-grid grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 lg:gap-3">
            {topSellingProducts.map((product) => <ProductTile key={`top-selling-${product.id}`} product={product} />)}
          </div>
        </section>
      )}

      {promos.length > 0 && (
        <section className="fl-promo-grid">
          {promos.slice(-2).map((banner) => (
            <a key={banner.Id} href={banner.linkUrl || "#collections"} className="fl-promo-card">
              <Image src={banner.file} alt={banner.alt} fill sizes="50vw" className="object-cover" unoptimized />
            </a>
          ))}
        </section>
      )}

      <section className="fl-category-mosaic">
        {categoryBatches[0]?.map((group) => group.category.imageUrl && (
          <Link key={group.category.Id} href={`/?menu=${encodeURIComponent(group.category.label)}`} className="fl-category-tile group">
            <Image src={group.category.imageUrl} alt={group.category.label} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
            <span>{group.category.label}</span>
          </Link>
        ))}
      </section>

      <section className="fl-story">
        <div><h2>{settings.metaTitle || "KAF Lifestyle"} <span>›</span></h2><h3>Because comfort and confidence go hand in hand.</h3><p>{settings.metaDescription || "Thoughtfully selected clothing, dependable quality and comfortable fits made for everyday confidence."}</p></div>
        {stories[0] && <div className="fl-story-image"><Image src={stories[0].file} alt={stories[0].alt} fill sizes="35vw" className="object-cover" unoptimized /></div>}
      </section>

      {categoryBatches[0]?.filter((group) => group.products.length > 0).map((group, index) => (
        <section key={group.category.Id} className="fl-category-section">
          <CategorySectionHeader category={group.category} productCount={group.products.length} index={index} />
          <EditorialGroup category={group.category} products={group.products} reverse={index % 2 === 1} />
        </section>
      ))}

      {categoryBatches.slice(1).map((batch, batchIndex) => (
        <Fragment key={`category-batch-${batchIndex + 1}`}>
          <section className="fl-category-mosaic">
            {batch.map((group) => group.category.imageUrl && (
              <Link key={group.category.Id} href={`/?menu=${encodeURIComponent(group.category.label)}`} className="fl-category-tile group">
                <Image src={group.category.imageUrl} alt={group.category.label} fill sizes="33vw" className="object-cover transition-transform duration-500 group-hover:scale-105" unoptimized />
                <span>{group.category.label}</span>
              </Link>
            ))}
          </section>
          {batch.filter((group) => group.products.length > 0).map((group, index) => (
            <section key={group.category.Id} className="fl-category-section">
              <CategorySectionHeader category={group.category} productCount={group.products.length} index={(batchIndex + 1) * 6 + index} />
              <EditorialGroup category={group.category} products={group.products} reverse={index % 2 === 1} />
            </section>
          ))}
        </Fragment>
      ))}

      <section id="lower-showcase" className="fl-lower-home">
        {lowerGroups.map((group, index) => (
          <div key={`lower-${group.category.Id}`}>
            <EditorialGroup category={group.category} products={group.products} reverse={index % 2 === 1} />
            {index === 0 && <div className="fl-socks-banner"><small>THE BEST EVERYDAY ESSENTIALS FOR BANGLADESH</small><strong>Premium Antibacterial Socks</strong><span>Visit Store ›</span></div>}
            {(index === 1 || index === 2) && (
              <div className="fl-feature-trio compact">
                {products.slice(index === 1 ? 30 : 33, index === 1 ? 33 : 36).map((product) => <ProductTile key={`lifestyle-${product.id}`} product={product} large />)}
              </div>
            )}
          </div>
        ))}

        <section className="fl-bulk-order">
          <div><h2>Bulk Order / Wholesale ›</h2><p>We provide quality apparel for custom branding, teams and organizations. Contact us for dependable bulk production and delivery.</p></div>
          {bulkBanner && <div className="fl-bulk-image"><Image src={bulkBanner.file} alt={bulkBanner.alt} fill sizes="45vw" className="object-cover" unoptimized /></div>}
        </section>

        <section className="fl-partners">
          <h2>Work with us Today</h2>
          <p>We are proud to work with brands and organizations that value long-term relationships and dependable results.</p>
          <div className="fl-partner-grid">
            {brands.map((brand, index) => {
              const seededPlaceholder = /partner-\d+\.svg(?:$|\?)/i.test(brand.file);
              const partner = seededPlaceholder ? originalPartnerLogos[index % originalPartnerLogos.length] : { name: brand.name, file: brand.file };
              return <a key={brand.Id} href={brand.linkUrl || "#"} aria-label={partner.name}><Image src={partner.file} alt={partner.name} width={110} height={65} className="object-contain" unoptimized /></a>;
            })}
          </div>
        </section>

        {affiliateBanner && <a href={affiliateBanner.linkUrl || "#"} className="fl-affiliate-banner"><Image src={affiliateBanner.file} alt={affiliateBanner.alt} fill sizes="100vw" className="object-cover" unoptimized /></a>}
      </section>
    </div>
  );
}

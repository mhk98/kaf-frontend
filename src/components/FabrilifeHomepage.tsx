import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import type { Product } from "@/data/products";
import type { BannerItem } from "@/services/bannerService";
import type { CategoryMenuItem } from "@/services/menuService";
import type { SiteSetting } from "@/services/settingService";
import type { BrandItem } from "@/services/brandService";
import HorizontalCarousel from "./HorizontalCarousel";

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
  const defaultCategory = categories.find((category) => /^men$/i.test(category.label))?.label || categories[0]?.label || products.find((product) => product.category)?.category || "Men";
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
  const megaDealProducts = products
    .filter((product) => product.discount > 0 || product.originalPrice > product.discountedPrice)
    .slice(0, 12);
  const bulkBanner = wideBanners.find((banner) => /bulk/i.test(banner.category || ""));
  const affiliateBanner = wideBanners.find((banner) => /affiliate|app/i.test(banner.category || ""));

  return (
    <div className="fl-home-shell">
      <nav className="fl-quick-links" aria-label="Quick shop links">
        <Link href="#new-arrival">Shop now</Link>
        {categories.slice(0, 3).map((category) => <Link key={category.Id} href={`/?menu=${encodeURIComponent(category.label)}`}>{category.label}</Link>)}
        <Link href={`/?menu=${encodeURIComponent("Teens")}`}>Teens</Link>
        <Link href={`/?menu=${encodeURIComponent("Sports")}`}>Sports</Link>
      </nav>

      {/* <div className="fl-announcement"><strong>Event T-shirt ›</strong> {settings.marqueeText || "Custom clothing with your brand logo or design? We deliver quality apparel at unbeatable prices."} <b>Click here ●</b></div> */}

      <section id="new-arrival" className="fl-new-arrival">
        <h1><Link href={`/?menu=${encodeURIComponent(defaultCategory)}&offer=new`}>New Arrival</Link></h1>
        <div className="fl-new-grid">{products.slice(0, 30).map((product) => <ProductTile key={product.id} product={product} />)}</div>
      </section>

      {topSellingProducts.length > 0 && (
        <section id="top-selling" className="fl-top-selling">
          <h2><Link href={`/?menu=${encodeURIComponent(defaultCategory)}&offer=top`}>Top Selling Products</Link></h2>
          <div className="fl-new-grid">
            {topSellingProducts.map((product) => <ProductTile key={`top-selling-${product.id}`} product={product} />)}
          </div>
        </section>
      )}

      {products.some((product) => product.freeShipping) && (
        <section id="free-delivery" className="fl-top-selling">
          <h2><Link href={`/?menu=${encodeURIComponent(defaultCategory)}&offer=delivery`}>Free Delivery</Link></h2>
          <div className="fl-new-grid">
            {products.filter((product) => product.freeShipping).slice(0, 12).map((product) => <ProductTile key={`free-delivery-${product.id}`} product={product} />)}
          </div>
        </section>
      )}

      {megaDealProducts.length > 0 && (
        <section id="mega-deal" className="fl-top-selling">
          <h2><Link href={`/?menu=${encodeURIComponent(defaultCategory)}&offer=deal`}>Mega Deal</Link></h2>
          <div className="fl-new-grid">
            {megaDealProducts.map((product) => <ProductTile key={`mega-deal-${product.id}`} product={product} />)}
          </div>
        </section>
      )}

      {promos.length > 0 && (
        <section className="fl-promo-grid">
          <HorizontalCarousel
            itemWidthClass="w-full md:w-[calc(50%-8px)]"
            gap={16}
            autoplay={promos.length > 2}
            interval={4500}
            showArrows={promos.length > 2}
          >
            {promos.map((banner) => (
              <a key={banner.Id} href={banner.linkUrl || "#new-arrival"} className="fl-promo-card">
                <Image src={banner.file} alt={banner.alt} fill sizes="(max-width: 767px) 100vw, 50vw" className="object-cover" unoptimized />
              </a>
            ))}
          </HorizontalCarousel>
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
        <div><h2>{settings.metaTitle || "KAF LifeStyle"} <span>›</span></h2><h3>Because comfort and confidence go hand in hand.</h3><p>{settings.metaDescription || "Thoughtfully selected clothing, dependable quality and comfortable fits made for everyday confidence."}</p></div>
        {stories.length > 0 && (
          <div className="fl-story-carousel">
            <HorizontalCarousel
              itemWidthClass="fl-story-carousel-item"
              gap={12}
              autoplay={stories.length > 2}
              interval={4500}
              showArrows={stories.length > 2}
            >
              {stories.map((banner) => (
                <a key={banner.Id} href={banner.linkUrl || "#new-arrival"} className="fl-story-image">
                  <Image
                    src={banner.file}
                    alt={banner.alt}
                    width={800}
                    height={500}
                    sizes="35vw"
                    className="fl-story-banner-image"
                    loading="eager"
                    unoptimized
                  />
                </a>
              ))}
            </HorizontalCarousel>
          </div>
        )}
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

import Header from "@/components/Header";
import HeroBanner from "@/components/HeroBanner";
import PopupBanner from "@/components/PopupBanner";
import Footer from "@/components/KafFooter";
import FloatingContact from "@/components/FloatingContact";
import ScrollToTop from "@/components/ScrollToTop";
import FabrilifeHomepage from "@/components/FabrilifeHomepage";
import ServiceBenefits from "@/components/ServiceBenefits";
import CategoryListing from "@/components/CategoryListing";
import { fetchStorefrontProducts } from "@/services/productService";
import { fetchSiteSettings, type SiteSetting } from "@/services/settingService";
import { fetchBanners } from "@/services/bannerService";
import { fetchBrands } from "@/services/brandService";
import { fetchCategoryMenus, type CategoryMenuItem } from "@/services/menuService";
import type { Product } from "@/data/products";
import type { BannerItem } from "@/services/bannerService";
import type { BrandItem } from "@/services/brandService";

function groupByCategory(products: Product[]): { title: string; products: Product[] }[] {
  const map = new Map<string, Product[]>();
  for (const p of products) {
    const key = p.category || "Other Products";
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(p);
  }
  return [...map.entries()].map(([title, products]) => ({ title: title.toUpperCase(), products }));
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ menu?: string; sub?: string; child?: string; offer?: string }>;
}) {
  const { menu, sub, child, offer } = await searchParams;
  let allProducts: Product[] = [];
  let settings: Partial<SiteSetting> = {};
  let banners: { slides: BannerItem[]; sideBanners: BannerItem[]; popupBanners: BannerItem[]; customBanners: BannerItem[] } = { slides: [], sideBanners: [], popupBanners: [], customBanners: [] };
  let brands: BrandItem[] = [];
  let categoryMenus: CategoryMenuItem[] = [];

  const [productsResult, settingsResult, bannersResult, brandsResult, categoryMenusResult] = await Promise.all([
    fetchStorefrontProducts({ limit: 200, page: 1 }).catch(() => ({ products: [] as Product[] })),
    fetchSiteSettings().catch(() => ({} as Partial<SiteSetting>)),
    fetchBanners().catch(() => ({ slides: [] as BannerItem[], sideBanners: [] as BannerItem[], popupBanners: [] as BannerItem[], customBanners: [] as BannerItem[] })),
    fetchBrands().catch(() => [] as BrandItem[]),
    fetchCategoryMenus().catch(() => [] as CategoryMenuItem[]),
  ]);
  allProducts   = productsResult.products;
  settings      = settingsResult;
  banners       = bannersResult;
  brands        = brandsResult;
  categoryMenus = categoryMenusResult;

  let sections: { title: string; products: Product[] }[] = [];

  if (menu) {
    const filtered = allProducts.filter((p) => {
      const catMatch = p.category?.toLowerCase() === menu.toLowerCase();
      if (!catMatch) return false;
      if (child) return p.childCategory?.toLowerCase() === child.toLowerCase();
      if (sub) return p.subCategory?.toLowerCase() === sub.toLowerCase();
      return true;
    });
    const sectionTitle = child
      ? `${menu.toUpperCase()} — ${sub ?? ""} — ${child}`
      : sub
        ? `${menu.toUpperCase()} — ${sub}`
      : menu.toUpperCase();
    sections = filtered.length > 0 ? [{ title: sectionTitle, products: filtered }] : [];
  } else {
    const configured = [
      { title: "NEW ARRIVALS", products: allProducts.slice(0, 12) },
      { title: "FEATURED PRODUCTS", products: allProducts.filter((p) => p.bestDeals).slice(0, 12) },
      { title: "BEST SELLING", products: allProducts.filter((p) => p.bestDeals).slice(0, 12).reverse() },
      { title: "FREE DELIVERY", products: allProducts.filter((p) => p.freeShipping).slice(0, 12) },
    ].filter((section) => section.products.length > 0);
    const categorySections = groupByCategory(allProducts)
      .filter((section) => section.products.length >= 3)
      .slice(0, 5);
    sections = [...configured, ...categorySections];
  }

  const isFiltered = Boolean(menu);
  const initialOffer = (["deal", "new", "top", "delivery"] as const).find((value) => value === offer) || "all";

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header logoUrl={settings.logoUrl ?? null} />
      <main className="flex-1">
        {!isFiltered && <HeroBanner slides={banners.slides} sideBanners={banners.sideBanners} />}
        {!isFiltered && <PopupBanner banners={banners.popupBanners} />}
        {!isFiltered && <FabrilifeHomepage products={allProducts} categories={categoryMenus} banners={banners.customBanners} settings={settings} brands={brands} />}

        {isFiltered && <CategoryListing menu={menu!} sub={sub} child={child} products={allProducts} categories={categoryMenus} initialOffer={initialOffer} />}

        {!isFiltered && <ServiceBenefits />}

      </main>
      <Footer settings={settings} />
      <FloatingContact settings={settings} />
      <ScrollToTop />
    </div>
  );
}

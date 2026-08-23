import Header from "@/components/Header";
import Footer from "@/components/KafFooter";
import FloatingContact from "@/components/FloatingContact";
import StoresView from "./StoresView";
import Image from "next/image";
import { fetchBanners } from "@/services/bannerService";
import {
  fetchSiteSettings,
  type StoreLocationSetting,
} from "@/services/settingService";

const fallbackStores: StoreLocationSetting[] = [
  {
    id: "mirpur-1",
    name: "Mirpur 1 (Dhaka)",
    address:
      "Rupayan Latifa Shamsuddin Square (opposite of Sony Square), 1st Floor, Mirpur Section 1, Dhaka",
    hotline: "01332502911",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Mirpur%201%20Dhaka&z=15&output=embed",
    mapLink: "https://maps.google.com/?q=Mirpur+1+Dhaka",
  },
  {
    id: "dhanmondi",
    name: "Dhanmondi (Dhaka)",
    address: "Dhanmondi, Dhaka",
    hotline: "01332502911",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Dhanmondi%20Dhaka&z=15&output=embed",
    mapLink: "https://maps.google.com/?q=Dhanmondi+Dhaka",
  },
  {
    id: "uttara",
    name: "Uttara (Dhaka)",
    address: "Uttara, Dhaka",
    hotline: "01332502911",
    mapEmbedUrl:
      "https://maps.google.com/maps?q=Uttara%20Dhaka&z=15&output=embed",
    mapLink: "https://maps.google.com/?q=Uttara+Dhaka",
  },
];

const STORE_BANNER_PATTERN = /store|stores|outlet|outlets|visit kaf/i;

export const metadata = {
  title: "Our Stores | KAF LifeStyle",
  description:
    "Find your nearest KAF outlet in Dhaka, contact the store, and get directions.",
};

export default async function StoresPage() {
  const [settings, banners] = await Promise.all([
    fetchSiteSettings(),
    fetchBanners(),
  ]);
  const stores =
    settings.storeLocations.length > 0
      ? settings.storeLocations
      : fallbackStores;
  const storeBanners = [
    ...banners.customBanners,
    ...banners.slides,
    ...banners.sideBanners,
  ];
  const storeBanner =
    storeBanners.find((banner) =>
      STORE_BANNER_PATTERN.test(`${banner.category || ""} ${banner.alt || ""}`),
    ) || null;

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <Header logoUrl={settings.logoUrl} />
      <main className="stores-page-container pb-6 sm:pb-8">
        {storeBanner ? (
          <a
            href={storeBanner.linkUrl || "#"}
            className="stores-banner"
            target={
              storeBanner.linkUrl?.startsWith("http") ? "_blank" : undefined
            }
            rel={
              storeBanner.linkUrl?.startsWith("http") ? "noreferrer" : undefined
            }
            aria-label={storeBanner.alt || "Stores banner"}
          >
            <Image
              src={storeBanner.file}
              alt={storeBanner.alt || "Stores banner"}
              fill
              sizes="(max-width: 768px) 100vw, 1520px"
              className="object-contain"
              priority
              unoptimized
            />
            <span className="stores-banner-copy">
              <span className="stores-banner-kicker">Visit KAF</span>
              <strong>Our Stores</strong>
              <span>
                Find your nearest KAF outlet, contact the store, and get
                directions.
              </span>
            </span>
          </a>
        ) : (
          <div
            className="stores-banner stores-banner-demo"
            aria-label="Stores banner demo"
          >
            <span className="stores-banner-demo-mark">KAF</span>
            <span className="stores-banner-demo-card stores-banner-demo-card-one" />
            <span className="stores-banner-demo-card stores-banner-demo-card-two" />
            <span className="stores-banner-copy">
              <span className="stores-banner-kicker">Visit KAF</span>
              <strong>Our Stores</strong>
              <span>
                Find your nearest KAF outlet, contact the store, and get
                directions.
              </span>
            </span>
          </div>
        )}

        <StoresView stores={stores} />
      </main>
      <Footer settings={settings} />
      <FloatingContact settings={settings} />
    </div>
  );
}

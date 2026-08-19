import Header from "@/components/Header";
import Footer from "@/components/KafFooter";
import FloatingContact from "@/components/FloatingContact";
import StoresView from "./StoresView";
import { fetchSiteSettings, type StoreLocationSetting } from "@/services/settingService";

const fallbackStores: StoreLocationSetting[] = [
  { id: "mirpur-1", name: "Mirpur 1 (Dhaka)", address: "Rupayan Latifa Shamsuddin Square (opposite of Sony Square), 1st Floor, Mirpur Section 1, Dhaka", hotline: "01332502911", mapEmbedUrl: "https://maps.google.com/maps?q=Mirpur%201%20Dhaka&z=15&output=embed", mapLink: "https://maps.google.com/?q=Mirpur+1+Dhaka" },
  { id: "dhanmondi", name: "Dhanmondi (Dhaka)", address: "Dhanmondi, Dhaka", hotline: "01332502911", mapEmbedUrl: "https://maps.google.com/maps?q=Dhanmondi%20Dhaka&z=15&output=embed", mapLink: "https://maps.google.com/?q=Dhanmondi+Dhaka" },
  { id: "uttara", name: "Uttara (Dhaka)", address: "Uttara, Dhaka", hotline: "01332502911", mapEmbedUrl: "https://maps.google.com/maps?q=Uttara%20Dhaka&z=15&output=embed", mapLink: "https://maps.google.com/?q=Uttara+Dhaka" },
];

export const metadata = {
  title: "Our Stores | KAF LifeStyle",
  description: "Find your nearest KAF outlet in Dhaka, contact the store, and get directions.",
};

export default async function StoresPage() {
  const settings = await fetchSiteSettings();
  const stores = settings.storeLocations.length > 0 ? settings.storeLocations : fallbackStores;

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <Header logoUrl={settings.logoUrl} />
      <main className="stores-page-container py-6 sm:py-8">
        <header className="mb-5 px-2 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b9780d]">Visit KAF</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-[#18201d] md:text-3xl">Our Stores</h1>
          <p className="mx-auto mt-2 max-w-xl text-xs sm:text-sm leading-5 text-[#6f7672]">Find your nearest KAF outlet, contact the store, and get directions.</p>
        </header>

        <StoresView stores={stores} />
      </main>
      <Footer settings={settings} />
      <FloatingContact settings={settings} />
    </div>
  );
}

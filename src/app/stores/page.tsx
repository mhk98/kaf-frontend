import Header from "@/components/Header";
import Footer from "@/components/KafFooter";
import FloatingContact from "@/components/FloatingContact";
import { fetchSiteSettings, type StoreLocationSetting } from "@/services/settingService";

const fallbackStores: StoreLocationSetting[] = [
  { id: "mirpur-1", name: "Mirpur 1 (Dhaka)", address: "Rupayan Latifa Shamsuddin Square (opposite of Sony Square), 1st Floor, Mirpur Section 1, Dhaka", hotline: "01332502911", mapEmbedUrl: "https://maps.google.com/maps?q=Mirpur%201%20Dhaka&z=15&output=embed", mapLink: "https://maps.google.com/?q=Mirpur+1+Dhaka" },
  { id: "dhanmondi", name: "Dhanmondi (Dhaka)", address: "Dhanmondi, Dhaka", hotline: "01332502911", mapEmbedUrl: "https://maps.google.com/maps?q=Dhanmondi%20Dhaka&z=15&output=embed", mapLink: "https://maps.google.com/?q=Dhanmondi+Dhaka" },
  { id: "uttara", name: "Uttara (Dhaka)", address: "Uttara, Dhaka", hotline: "01332502911", mapEmbedUrl: "https://maps.google.com/maps?q=Uttara%20Dhaka&z=15&output=embed", mapLink: "https://maps.google.com/?q=Uttara+Dhaka" },
];

const mapEmbedFor = (store: StoreLocationSetting) =>
  store.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&z=15&output=embed`;

export default async function StoresPage() {
  const settings = await fetchSiteSettings();
  const stores = settings.storeLocations.length > 0 ? settings.storeLocations : fallbackStores;

  return (
    <div className="min-h-screen bg-[#f6f7f8]">
      <Header logoUrl={settings.logoUrl} />
      <main className="site-page-container py-10 md:py-16">
        <header className="mb-9 text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#b9780d]">Visit KAF</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[#18201d] md:text-4xl">Our Stores</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#6f7672]">Find your nearest KAF outlet, contact the store, and get directions.</p>
        </header>

        <div className="space-y-7">
          {stores.map((store, index) => (
            <article key={store.id || `${store.name}-${index}`} className="overflow-hidden rounded-2xl border border-[#e4e6e5] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
              <div className="p-5 md:p-7">
                <div className="flex items-start gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f4ac35] font-bold text-white" aria-hidden="true">i</span>
                  <div>
                    <h2 className="text-lg font-bold text-[#303634]">{store.name}</h2>
                    <p className="mt-2 text-sm leading-6 text-[#555d59]"><strong className="text-[#303634]">Address:</strong> {store.address}</p>
                    {store.hotline && <p className="mt-1 text-sm text-[#555d59]"><strong className="text-[#303634]">Outlet Hotline:</strong> <a className="hover:text-[#073763]" href={`tel:${store.hotline}`}>{store.hotline}</a></p>}
                  </div>
                </div>
              </div>
              <div className="relative h-[300px] border-t border-[#e7e9e8] md:h-[390px]">
                <iframe src={mapEmbedFor(store)} title={`${store.name} map`} className="h-full w-full border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                {store.mapLink && <a href={store.mapLink} target="_blank" rel="noopener noreferrer" className="absolute right-4 top-4 rounded-lg bg-white px-4 py-2 text-xs font-bold text-[#073763] shadow-lg">Open in Maps</a>}
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer settings={settings} />
      <FloatingContact settings={settings} />
    </div>
  );
}

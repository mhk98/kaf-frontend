import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { CustomerProvider } from "@/context/CustomerContext";
import { WishlistProvider } from "@/context/WishlistContext";
import MetaPixel from "@/components/MetaPixel";
import VisitorTracker from "@/components/VisitorTracker";
import { fetchSiteSettings } from "@/services/settingService";

const lato = Lato({
  weight: ["300", "400", "700", "900"],
  subsets: ["latin"],
  display: "swap",
});

const baseMetadata: Metadata = {
  title: "KAF LifeStyle - KAF LifeStyle is the best level ecommerce in Bangladesh",
  description: "Best level ecommerce in Bangladesh",
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: { url: "/apple-icon.png", sizes: "256x256", type: "image/png" },
  },
};

export async function generateMetadata(): Promise<Metadata> {
  const settings = await fetchSiteSettings();
  const iconUrl = settings.faviconUrl || "/icon.png";

  return {
    ...baseMetadata,
    title: settings.metaTitle || baseMetadata.title,
    description: settings.metaDescription || baseMetadata.description,
    keywords: settings.metaKeyword || undefined,
    icons: {
      icon: [{ url: iconUrl }],
      apple: { url: iconUrl, sizes: "256x256" },
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={lato.className} suppressHydrationWarning>
      <body suppressHydrationWarning>
        <MetaPixel />
        <VisitorTracker />
        <CustomerProvider>
          <WishlistProvider>
            <CartProvider>{children}</CartProvider>
          </WishlistProvider>
        </CustomerProvider>
      </body>
    </html>
  );
}

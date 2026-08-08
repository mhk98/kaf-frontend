"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchPublicPages, type WebsitePage } from "@/services/pageService";
import { fetchSiteSettings, type SiteSetting } from "@/services/settingService";

const SOCIALS = [
  { key: "facebookUrl", name: "Facebook", color: "#1877f2", icon: "f" }, { key: "whatsappUrl", name: "WhatsApp", color: "#25d366", icon: "◔" },
  { key: "instagramUrl", name: "Instagram", color: "#e1306c", icon: "◎" }, { key: "tiktokUrl", name: "TikTok", color: "#00e5e5", icon: "♪" },
  { key: "youtubeUrl", name: "YouTube", color: "#ff0000", icon: "▶" }, { key: "linkedinUrl", name: "LinkedIn", color: "#0a66c2", icon: "in" },
] as const;
const BRAND = [{ label: "About KAF Lifestyle", url: "/page/about-us" }, { label: "Brand Story", url: "/page/brand-story" }, { label: "Company Information", url: "/page/company-information" }, { label: "Blogs & News", url: "/page/blogs" }, { label: "FAQs", url: "/page/faqs" }, { label: "Contact Us", url: "/contact" }];
const SHOPPING = [{ label: "How To Order", url: "/page/how-to-order" }, { label: "Order Tracking", url: "/track-order" }, { label: "Payment Methods", url: "/page/payment-methods" }, { label: "Shipping Information", url: "/page/shipping-information" }, { label: "Delivery Coverage", url: "/page/delivery-coverage" }, { label: "Become a Reseller", url: "/page/become-a-reseller" }, { label: "Join KAF Squad", url: "/page/join-kaf-squad" }, { label: "Outlets & Factory", url: "/page/outlets" }];
const POLICIES = [{ label: "Terms & Conditions", url: "/page/terms-conditions" }, { label: "Privacy Policy", url: "/page/privacy-policy" }, { label: "Refund Policy", url: "/page/refund-policy" }, { label: "Return Policy", url: "/page/return-policy" }, { label: "Exchange Policy", url: "/page/exchange-policy" }, { label: "Cancellation Policy", url: "/page/cancellation-policy" }, { label: "Pre-Order Policy", url: "/page/pre-order-policy" }, { label: "Jobs & Careers", url: "/page/careers" }];

function Heading({ children }: { children: ReactNode }) { return <h3 className="kaf-footer-heading">{children}</h3>; }
function Links({ items }: { items: { label: string; url: string }[] }) { return <ul>{items.map((item) => <li key={`${item.label}-${item.url}`}><Link href={item.url} className="kaf-footer-link">{item.label}</Link></li>)}</ul>; }

export default function KafFooter({ settings }: { settings?: Partial<SiteSetting> | null }) {
  const [resolved, setResolved] = useState<Partial<SiteSetting> | null>(settings || null);
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const s = settings || resolved || {};
  const footer = s.websiteFooter || {};
  useEffect(() => { if (!settings) fetchSiteSettings().then(setResolved).catch(() => setResolved({})); }, [settings]);
  useEffect(() => { fetchPublicPages().then(setPages).catch(() => setPages([])); }, []);
  if (footer.status === false) return null;

  const brandLinks = pages.length ? pages.slice(0, 6).map((page) => ({ label: page.title || page.name, url: `/page/${page.slug}` })) : BRAND;
  const shoppingLinks = footer.customerLinks?.length ? footer.customerLinks : SHOPPING;
  const policyLinks = footer.importantLinks?.length ? footer.importantLinks : footer.quickLinks?.length ? footer.quickLinks : POLICIES;
  const configuredByPlatform = new Map((footer.socialLinks || []).map((item) => [item.platform?.toLowerCase(), item]));
  const socials = SOCIALS.map((entry) => {
    const configured = configuredByPlatform.get(entry.name.toLowerCase());
    return { ...entry, name: configured?.label || entry.name, url: configured?.url || String(s[entry.key] || "#") };
  });
  const facebook = socials.find((social) => social.name.toLowerCase().includes("facebook"));
  const logo = footer.logoUrl || s.logoUrl;

  return <footer className="kaf-footer"><div className="kaf-footer-main"><div className="kaf-footer-grid">
    <section className="kaf-footer-brand">{logo && <Link href="/" className="kaf-footer-logo"><Image src={logo} alt="KAF Lifestyle" fill className="object-contain object-left" unoptimized /></Link>}<p className="kaf-footer-tagline">{s.metaTitle || "Wear Your Style, Live Your LifeStyle"}</p><Links items={brandLinks} />{(footer.address || footer.phone || footer.email) && <div className="kaf-footer-contact">{footer.address && <span>{footer.address}</span>}{footer.phone && <a href={`tel:${footer.phone}`}>{footer.phone}</a>}{footer.email && <a href={`mailto:${footer.email}`}>{footer.email}</a>}</div>}</section>
    <section><Heading>{footer.customerLinksTitle || "SHOPPING WITH US"}</Heading><Links items={shoppingLinks} /></section>
    <section><Heading>{footer.importantLinksTitle || footer.quickLinksTitle || "POLICIES"}</Heading><Links items={policyLinks} /></section>
    <section className="kaf-footer-follow"><Heading>{footer.socialLinksTitle || "FOLLOW US"}</Heading><p>Stay updated on our latest arrivals, exclusive promotions and events.</p><div className="kaf-footer-socials">{socials.map((social) => <a key={`${social.name}-${social.url}`} href={social.url} target={social.url === "#" ? undefined : "_blank"} rel={social.url === "#" ? undefined : "noreferrer"} title={social.name} style={{ color: social.color }}>{social.icon}</a>)}</div>{facebook && <a href={facebook.url} target={facebook.url === "#" ? undefined : "_blank"} rel={facebook.url === "#" ? undefined : "noreferrer"} className="kaf-facebook-card"><i style={{ color: facebook.color }}>{facebook.icon}</i><strong>KAF Lifestyle<small>Official Facebook page</small></strong><b>Follow</b></a>}<div className="kaf-app-badges"><Image src="/images/app-store-badges.jpg" alt="Download KAF Lifestyle on Google Play and the App Store" fill sizes="330px" className="object-contain object-left" /></div></section>
  </div></div><div className="kaf-footer-bottom"><p>Every Order is Packed with Care <span>♥</span> and Delivered with Trust.</p><p>{s.copyrightText || `Copyright © ${new Date().getFullYear()} KAF Lifestyle. All Rights Reserved.`}</p></div></footer>;
}

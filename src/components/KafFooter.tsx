"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { fetchPublicPages, type WebsitePage } from "@/services/pageService";
import { fetchSiteSettings, type SiteSetting } from "@/services/settingService";

const SOCIALS = [
  { key: "facebookUrl", name: "Facebook", color: "#1877f2", icon: "f" },
  { key: "whatsappUrl", name: "WhatsApp", color: "#25d366", icon: "◔" },
  { key: "instagramUrl", name: "Instagram", color: "#e1306c", icon: "◎" },
  { key: "tiktokUrl", name: "TikTok", color: "#00e5e5", icon: "♪" },
  { key: "youtubeUrl", name: "YouTube", color: "#ff0000", icon: "▶" },
  { key: "linkedinUrl", name: "LinkedIn", color: "#0a66c2", icon: "in" },
] as const;
const FACEBOOK_PAGE_URL = "https://www.facebook.com/kaflifestyle";
const BRAND = [
  { label: "About KAF LifeStyle", url: "/page/about-us" },
  { label: "Brand Story", url: "/page/brand-story" },
  { label: "Company Information", url: "/page/company-information" },
  { label: "Blogs & News", url: "/page/blogs" },
  { label: "FAQs", url: "/page/faqs" },
  { label: "Contact Us", url: "/contact" },
];
const SHOPPING = [
  { label: "How To Order", url: "/page/how-to-order" },
  { label: "Order Tracking", url: "/track-order" },
  { label: "Payment Methods", url: "/page/payment-methods" },
  { label: "Shipping Information", url: "/page/shipping-information" },
  { label: "Delivery Coverage", url: "/page/delivery-coverage" },
  { label: "Become a Reseller", url: "/page/become-a-reseller" },
  { label: "Join KAF Squad", url: "/page/join-kaf-squad" },
  { label: "Outlets & Factory", url: "/page/outlets" },
];
const POLICIES = [
  { label: "Terms & Conditions", url: "/page/terms-conditions" },
  { label: "Privacy Policy", url: "/page/privacy-policy" },
  { label: "Refund Policy", url: "/page/refund-policy" },
  { label: "Return Policy", url: "/page/return-policy" },
  { label: "Exchange Policy", url: "/page/exchange-policy" },
  { label: "Cancellation Policy", url: "/page/cancellation-policy" },
  { label: "Pre-Order Policy", url: "/page/pre-order-policy" },
  { label: "Jobs & Careers", url: "/page/careers" },
];

function Heading({ children }: { children: ReactNode }) {
  return <h3 className="kaf-footer-heading">{children}</h3>;
}
function Links({ items }: { items: { label: string; url: string }[] }) {
  return (
    <ul>
      {items.map((item) => (
        <li key={`${item.label}-${item.url}`}>
          <Link href={item.url} className="kaf-footer-link">
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
function SocialIcon({ platform }: { platform: string }) {
  const name = platform.toLowerCase();
  if (name.includes("facebook"))
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.7 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5H17V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.5V13h2.8v8h3.4Z" />
      </svg>
    );
  if (name.includes("whatsapp"))
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M19.1 4.9A9.9 9.9 0 0 0 3.5 16.8L2.1 22l5.3-1.4A9.9 9.9 0 0 0 22 11.9c0-2.6-1-5.1-2.9-7Zm-7 15a8 8 0 0 1-4.1-1.1l-.3-.2-3.1.8.8-3-.2-.3a8 8 0 1 1 6.9 3.8Zm4.4-6c-.2-.1-1.4-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.5 6.5 0 0 1-3.2-2.8c-.2-.3 0-.4.1-.5l.4-.5.2-.4c.1-.2 0-.4 0-.5l-.8-2c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.4-.6 1.6-1.1.2-.6.2-1 .2-1.1 0-.2-.2-.3-.4-.4Z" />
      </svg>
    );
  if (name.includes("instagram"))
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm-.1 2A3.1 3.1 0 0 0 4 7.1v9.8A3.1 3.1 0 0 0 7.1 20h9.8a3.1 3.1 0 0 0 3.1-3.1V7.1A3.1 3.1 0 0 0 16.9 4H7.1Zm10.2 1.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 6.9a5.1 5.1 0 1 1 0 10.2 5.1 5.1 0 0 1 0-10.2Zm0 2a3.1 3.1 0 1 0 0 6.2 3.1 3.1 0 0 0 0-6.2Z" />
      </svg>
    );
  if (name.includes("tiktok"))
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15.6 2c.3 2.3 1.6 3.7 3.9 3.9v3.2a8.6 8.6 0 0 1-3.9-1v6.2a6.3 6.3 0 1 1-5.4-6.2v3.3a3.1 3.1 0 1 0 2.2 3V2h3.2Z" />
      </svg>
    );
  if (name.includes("youtube"))
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5.3 7.9H1.8V21h3.5V7.9ZM3.5 2A2 2 0 1 0 3.5 6a2 2 0 0 0 0-4Zm17.7 5.6c-2.3 0-3.4 1.3-3.9 2.2V7.9H8.8V21h3.5v-6.5c0-1.7.3-3.4 2.5-3.4 2.2 0 2.2 2 2.2 3.5V21h3.5v-7.5c0-4-2.1-5.9-5-5.9Z" />
    </svg>
  );
}

export default function KafFooter({
  settings,
}: {
  settings?: Partial<SiteSetting> | null;
}) {
  const [resolved, setResolved] = useState<Partial<SiteSetting> | null>(
    settings || null,
  );
  const [pages, setPages] = useState<WebsitePage[]>([]);
  const s = settings || resolved || {};
  const footer = s.websiteFooter || {};
  useEffect(() => {
    if (!settings)
      fetchSiteSettings()
        .then(setResolved)
        .catch(() => setResolved({}));
  }, [settings]);
  useEffect(() => {
    fetchPublicPages()
      .then(setPages)
      .catch(() => setPages([]));
  }, []);
  if (footer.status === false) return null;

  const brandLinks = pages.length
    ? pages.slice(0, 6).map((page) => ({
        label: page.title || page.name,
        url: `/page/${page.slug}`,
      }))
    : BRAND;
  const shoppingLinks = footer.customerLinks?.length
    ? footer.customerLinks
    : SHOPPING;
  const policyLinks = footer.importantLinks?.length
    ? footer.importantLinks
    : footer.quickLinks?.length
      ? footer.quickLinks
      : POLICIES;
  const configuredByPlatform = new Map(
    (footer.socialLinks || []).map((item) => [
      item.platform?.toLowerCase(),
      item,
    ]),
  );
  const socials = SOCIALS.map((entry) => {
    const configured = configuredByPlatform.get(entry.name.toLowerCase());
    const fallbackUrl = entry.key === "facebookUrl" ? FACEBOOK_PAGE_URL : "#";
    return {
      ...entry,
      name: configured?.label || entry.name,
      url: configured?.url || String(s[entry.key] || fallbackUrl),
    };
  });
  const facebook = socials.find((social) =>
    social.name.toLowerCase().includes("facebook"),
  );
  const logo = footer.logoUrl || s.logoUrl;

  return (
    <footer className="kaf-footer">
      <div className="kaf-footer-main">
        <div className="kaf-footer-grid">
          <section className="kaf-footer-brand">
            {logo && (
              <Link href="/" className="kaf-footer-logo">
                <Image
                  src={logo}
                  alt="KAF LifeStyle"
                  fill
                  className="object-contain object-left"
                  unoptimized
                />
              </Link>
            )}
            <p className="kaf-footer-tagline">
              {s.metaTitle || "Wear Your Style, Live Your LifeStyle"}
            </p>
            <Links items={brandLinks} />
            {(footer.address || footer.phone || footer.email) && (
              <div className="kaf-footer-contact">
                {footer.address && <span>{footer.address}</span>}
                {footer.phone && (
                  <a href={`tel:${footer.phone}`}>{footer.phone}</a>
                )}
                {footer.email && (
                  <a href={`mailto:${footer.email}`}>{footer.email}</a>
                )}
              </div>
            )}
          </section>
          <section>
            <Heading>{footer.customerLinksTitle || "SHOPPING WITH US"}</Heading>
            <Links items={shoppingLinks} />
          </section>
          <section>
            <Heading>
              {footer.importantLinksTitle ||
                footer.quickLinksTitle ||
                "POLICIES"}
            </Heading>
            <Links items={policyLinks} />
          </section>
          <section className="kaf-footer-follow">
            <Heading>{footer.socialLinksTitle || "FOLLOW US"}</Heading>
            <p>
              Stay updated on our latest arrivals, exclusive promotions and
              events.
            </p>
            <div className="kaf-footer-socials">
              {socials.map((social) => (
                <a
                  key={`${social.name}-${social.url}`}
                  href={social.url}
                  target={social.url === "#" ? undefined : "_blank"}
                  rel={social.url === "#" ? undefined : "noreferrer"}
                  aria-label={social.name}
                  title={social.name}
                  style={{ color: social.color }}
                >
                  <SocialIcon platform={social.name} />
                </a>
              ))}
            </div>
            {facebook && (
              <a
                href={facebook.url}
                target="_blank"
                rel="noopener noreferrer"
                className="kaf-facebook-card"
                aria-label="Visit KAF LifeStyle on Facebook"
              >
                <div
                  style={{
                    backgroundColor: "#F0F4FF",
                    padding: "0.5rem",
                    borderRadius: "10px",
                  }}
                >
                  <i style={{ color: facebook.color }}>
                    <SocialIcon platform="Facebook" />
                  </i>
                </div>

                <strong>
                  <span>
                    KAF LifeStyle <em aria-label="Verified">✓</em>
                  </span>
                  <small>
                    {s.facebookFollowers
                      ? `${s.facebookFollowers} followers`
                      : "Official Facebook page"}
                    {s.facebookFollowing
                      ? ` · ${s.facebookFollowing} following`
                      : ""}
                  </small>
                </strong>
                <b>Follow</b>
              </a>
            )}
            <div className="kaf-app-badges">
              <Image
                src="/images/app-store-badges.jpg"
                alt="Download KAF LifeStyle on Google Play and the App Store"
                fill
                sizes="330px"
                className="object-contain object-left"
              />
            </div>
          </section>
        </div>
      </div>
      <div className="kaf-footer-bottom py-6 border-t border-white/10 bg-[#080909] text-center">
        <div className="kaf-footer-bottom-inner text-center space-y-1.5 px-4">
          <p className="text-xs sm:text-sm text-gray-300 font-medium text-center">
            Every Order is Packed with Care{" "}
            <span className="text-red-500 mx-0.5">♥</span> and Delivered with
            Trust.
          </p>
          <p className="text-xs text-gray-400 text-center">
            {s.copyrightText ||
              `Copyright © ${new Date().getFullYear()} KAF LifeStyle. All Rights Reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
}

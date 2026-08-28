"use client";

import { useEffect, useState } from "react";
import { fetchSiteSettings, type SiteSetting } from "@/services/settingService";
import { trackPixelEvent } from "@/lib/pixel";

const CONTACT_DEFS = [
  {
    key: "whatsappUrl" as const,
    label: "WhatsApp",
    href: (value: string) => value,
    color: "#25d366",
    icon: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.136.563 4.14 1.544 5.876L.057 23.6a.5.5 0 00.61.666l5.878-1.54A11.954 11.954 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.888a9.87 9.87 0 01-5.032-1.378l-.36-.214-3.733.979.998-3.648-.235-.374A9.863 9.863 0 012.112 12C2.112 6.58 6.58 2.112 12 2.112c5.42 0 9.888 4.468 9.888 9.888 0 5.42-4.468 9.888-9.888 9.888z"/>
      </svg>
    ),
  },
  {
    key: "phone" as const,
    label: "Direct Call",
    href: (value: string) => `tel:${value}`,
    color: "#8b5cf6",
    icon: (
      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63A2 2 0 012 .98h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
  },
  {
    key: "messengerUrl" as const,
    label: "Messenger",
    href: (value: string) => value,
    color: "#0099ff",
    icon: (
      <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.149 0 11.5c0 3.612 1.852 6.836 4.75 8.934V24l4.333-2.375c1.16.312 2.386.48 3.66.48C20.627 22.105 24 17.044 24 11.5 24 5.15 18.627 0 12 0zm1.208 15.484l-3.093-3.28-6.054 3.28L10.98 8.516l3.168 3.28 5.98-3.28-6.92 6.968z"/>
      </svg>
    ),
  },
];

interface Props {
  settings?: Partial<SiteSetting> | null;
}

const FALLBACK_PHONE = "01332502911";
const FALLBACK_MESSENGER_URL = "https://m.me/kaflifestyle";

function trackContact(label: string, value: string) {
  trackPixelEvent("Contact", {
    content_ids: [],
    content_name: label,
    content_type: "contact",
    value: 0,
    currency: "BDT",
    num_items: 1,
  }, { phone: value });
}

export default function FloatingContact({ settings }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [resolvedSettings, setResolvedSettings] = useState<Partial<SiteSetting> | null>(settings || null);
  const source = settings || resolvedSettings || {};
  const footerSettings = source.websiteFooter || {};
  const floatingSettings = source.floatingContact || {};
  const contacts = CONTACT_DEFS
    .map((contact) => {
      let value = source[contact.key];
      if (contact.key === "phone") {
        value = floatingSettings.phoneNumber || source.phone || source.phoneNumber || source.hotlineNumber || footerSettings.phone || FALLBACK_PHONE;
      }
      if (contact.key === "whatsappUrl" && !value) {
        const configuredWhatsApp = footerSettings.socialLinks?.find((link) =>
          link.platform?.toLowerCase().includes("whatsapp"),
        )?.url;
        const rawNumber = floatingSettings.whatsappNumber || source.whatsappNumber || source.phone || source.phoneNumber ||
          source.hotlineNumber || footerSettings.phone || FALLBACK_PHONE;
        const number = rawNumber.replace(/\D/g, "").replace(/^0/, "880");
        value = configuredWhatsApp || (number ? `https://wa.me/${number}` : null);
      }
      if (contact.key === "messengerUrl" && !value) {
        value = floatingSettings.messengerUrl || footerSettings.socialLinks?.find((link) =>
          link.platform?.toLowerCase().includes("messenger"),
        )?.url || FALLBACK_MESSENGER_URL;
      }
      if (!value) return null;
      return {
        ...contact,
        href: contact.href(value),
      };
    })
    .filter((contact): contact is NonNullable<typeof contact> => Boolean(contact));

  useEffect(() => {
    if (settings) return;
    fetchSiteSettings().then(setResolvedSettings).catch(() => setResolvedSettings({}));
  }, [settings]);

  if (contacts.length === 0) return null;
  if (floatingSettings.status === false) return null;

  return (
    <aside
      aria-label="Contact options"
      className="floating-contact"
    >
      {/* Contact Options (Visible when open) */}
      <div
        className={`flex flex-col gap-2.5 items-center transition-all duration-300 origin-bottom ${
          isOpen
            ? "opacity-100 scale-100 max-h-[300px] pointer-events-auto"
            : "opacity-0 scale-90 max-h-0 pointer-events-none overflow-hidden"
        }`}
      >
        {contacts.map((contact) => (
          <a
            key={contact.key}
            href={contact.href}
            target={contact.href.startsWith("http") ? "_blank" : undefined}
            rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
            onClick={() => trackContact(contact.label, contact.href)}
            aria-label={contact.label}
            title={contact.label}
            className="floating-contact-button flex items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ backgroundColor: contact.color }}
          >
            {contact.icon}
          </a>
        ))}
      </div>

      {/* Main Open/Close Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close contact options" : "Open contact options"}
        title={isOpen ? "Close contact menu" : "Contact Us"}
        className={`floating-contact-button flex items-center justify-center rounded-full text-white shadow-lg transition-all duration-300 cursor-pointer ${
          isOpen
            ? "bg-[#7c3aed] hover:bg-[#6d28d9] rotate-0"
            : "bg-[#10B8C4] hover:bg-[#0d9ba5] rotate-180"
        }`}
      >
        {isOpen ? (
          /* Close 'X' icon */
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          /* Chat / Call Open icon with pulse badge */
          <div className="relative flex items-center justify-center">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008H8.625V12zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12zm3.75 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h.008v.008h-.008V12c0 3.5-3.5 6-7.5 6a8.96 8.96 0 01-3.243-.603L2 18l1.233-3.287A7.544 7.544 0 012.25 12c0-4.142 4.03-7.5 9-7.5s9 3.358 9 7.5z" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
          </div>
        )}
      </button>
    </aside>
  );
}

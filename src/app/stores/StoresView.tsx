"use client";

import { useState, useEffect, useRef } from "react";
import type { StoreLocationSetting } from "@/services/settingService";

interface StoresViewProps {
  stores: StoreLocationSetting[];
}

const mapEmbedFor = (store: StoreLocationSetting) =>
  store.mapEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(store.address)}&z=15&output=embed`;

export default function StoresView({ stores }: StoresViewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const storeRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    storeRefs.current.forEach((el, index) => {
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveIndex(index);
            }
          });
        },
        { threshold: 0.4 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, [stores.length]);

  const scrollToStore = (index: number) => {
    const el = storeRefs.current[index];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="w-full">
      {/* Floating Store Navigation Pills */}
      <div className="sticky top-[70px] sm:top-[80px] z-30 w-full py-2.5 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm mb-6 rounded-xl">
        <div className="px-4 flex items-center justify-between gap-3 overflow-x-auto py-0.5 scrollbar-hide">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#073763] shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#f4ac35] animate-pulse" />
            Our Outlets ({stores.length})
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {stores.map((store, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={store.id || `nav-${idx}`}
                  onClick={() => scrollToStore(idx)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#073763] text-white shadow-md scale-[1.02]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label={`Jump to ${store.name}`}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={isActive ? "text-[#f4ac35]" : "text-gray-500"}>
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{store.name.replace(/\s*\(Dhaka\)/i, "")}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Stores List with Full Height Cards & Map stretching to bottom */}
      <div className="stores-list space-y-8 sm:space-y-12">
        {stores.map((store, index) => {
          const mapUrl = mapEmbedFor(store);
          const hasNext = index < stores.length - 1;

          return (
            <article
              key={store.id || `${store.name}-${index}`}
              ref={(el) => {
                storeRefs.current[index] = el;
              }}
              className="store-card-full flex flex-col overflow-hidden rounded-xl border border-[#e4e6e5] bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] sm:rounded-2xl h-[calc(100vh-140px)] min-h-[580px] sm:min-h-[640px] snap-start scroll-mt-28"
            >
              {/* Store Info Header */}
              <div className="p-4 sm:p-5 md:p-6 shrink-0 bg-white border-b border-gray-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#f4ac35] font-bold text-white text-base shadow-sm" aria-hidden="true">
                      i
                    </span>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-[#303634]">{store.name}</h2>
                      <p className="mt-1 text-sm leading-6 text-[#555d59]">
                        <strong className="text-[#303634]">Address:</strong> {store.address}
                      </p>
                      {store.hotline && (
                        <p className="mt-1 text-sm text-[#555d59]">
                          <strong className="text-[#303634]">Outlet Hotline:</strong>{" "}
                          <a className="font-semibold text-[#073763] hover:text-[#10B8C4]" href={`tel:${store.hotline}`}>
                            {store.hotline}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {store.mapLink && (
                    <a
                      href={store.mapLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline-flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-xl bg-[#073763] text-white text-xs font-bold shadow hover:bg-[#052646] transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Open Directions
                    </a>
                  )}
                </div>
              </div>

              {/* Full Height Map Container - fills all remaining space down to bottom */}
              <div className="relative flex-1 w-full overflow-hidden bg-gray-100">
                <iframe
                  src={mapUrl}
                  title={`${store.name} map`}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />

                {store.mapLink && (
                  <a
                    href={store.mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-4 top-4 inline-flex sm:hidden items-center gap-1.5 rounded-lg bg-white/95 backdrop-blur-sm px-3.5 py-2 text-xs font-bold text-[#073763] shadow-md hover:bg-white transition-colors"
                  >
                    Open in Maps
                  </a>
                )}

                {/* Scroll hint to next store if available */}
                {hasNext && (
                  <button
                    onClick={() => scrollToStore(index + 1)}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-gray-200 shadow-lg text-xs font-bold text-[#073763] hover:bg-white transition-all cursor-pointer"
                  >
                    <span>Scroll for next store</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-bounce">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

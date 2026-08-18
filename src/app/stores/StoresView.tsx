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

  // Track active store using IntersectionObserver
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
        { threshold: 0.5 }
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
    <div className="relative w-full">
      {/* Floating Store Navigation Bar */}
      <div className="sticky top-[80px] z-40 w-full py-3 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
        <div className="site-page-container flex items-center justify-between gap-3 overflow-x-auto py-1 scrollbar-hide">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#073763] shrink-0">
            <span className="inline-block w-2 h-2 rounded-full bg-[#10B8C4] animate-pulse" />
            Our Outlets ({stores.length})
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {stores.map((store, idx) => {
              const isActive = activeIndex === idx;
              return (
                <button
                  key={store.id || `nav-${idx}`}
                  onClick={() => scrollToStore(idx)}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#073763] text-white shadow-md scale-[1.03]"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                  aria-label={`Jump to ${store.name}`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={isActive ? "text-[#10B8C4]" : "text-gray-500"}>
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

      {/* Fullscreen Snap Sections for Stores */}
      <div className="stores-snap-container divide-y divide-gray-200">
        {stores.map((store, index) => {
          const mapUrl = mapEmbedFor(store);
          const hasNext = index < stores.length - 1;

          return (
            <section
              key={store.id || `${store.name}-${index}`}
              ref={(el) => {
                storeRefs.current[index] = el;
              }}
              className="store-fullscreen-section min-h-[calc(100vh-130px)] lg:min-h-[calc(100vh-80px)] flex flex-col justify-center py-10 lg:py-16 bg-[#f8f9fa] snap-start snap-always relative"
            >
              <div className="site-page-container w-full my-auto">
                <div className="bg-white rounded-2xl lg:rounded-3xl border border-gray-200/90 shadow-[0_12px_40px_rgba(15,23,42,0.07)] p-6 sm:p-8 lg:p-12">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                    
                    {/* Left Column: Store Details */}
                    <div className="lg:col-span-7 flex flex-col justify-center">
                      {/* Badge */}
                      <div className="flex items-center gap-2.5 mb-4">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-widest bg-[#073763]/10 text-[#073763]">
                          Outlet {String(index + 1).padStart(2, "0")} / {String(stores.length).padStart(2, "0")}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Open Now
                        </span>
                      </div>

                      {/* Store Title */}
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#152a24]">
                        {store.name}
                      </h2>

                      {/* Store Address */}
                      <div className="mt-5 flex items-start gap-3.5 text-gray-700 bg-gray-50/80 p-4 rounded-xl border border-gray-100">
                        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#073763] text-white">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Store Address</p>
                          <p className="mt-1 text-sm sm:text-base font-medium text-gray-800 leading-relaxed">
                            {store.address}
                          </p>
                        </div>
                      </div>

                      {/* Hotline & Hours */}
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {store.hotline && (
                          <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-white">
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#10B8C4]/15 text-[#073763]">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-gray-500 uppercase">Outlet Hotline</p>
                              <a
                                href={`tel:${store.hotline}`}
                                className="text-sm font-bold text-[#073763] hover:text-[#10B8C4] transition-colors"
                              >
                                {store.hotline}
                              </a>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 p-3.5 rounded-xl border border-gray-100 bg-white">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-amber-100 text-amber-800">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10" />
                              <polyline points="12 6 12 12 16 14" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-gray-500 uppercase">Opening Hours</p>
                            <p className="text-sm font-bold text-gray-800">10:00 AM - 10:00 PM</p>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-6 flex flex-wrap items-center gap-3.5">
                        {store.mapLink && (
                          <a
                            href={store.mapLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#073763] text-white text-sm font-bold shadow-md hover:bg-[#052646] hover:shadow-lg transition-all"
                          >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            Get Directions
                          </a>
                        )}

                        {store.hotline && (
                          <a
                            href={`tel:${store.hotline}`}
                            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-gray-300 text-gray-800 text-sm font-bold hover:bg-gray-50 hover:border-gray-400 transition-all"
                          >
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                            Call Outlet
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Right Column: Square Map (aspect-square) */}
                    <div className="lg:col-span-5 flex justify-center">
                      <div className="relative w-full max-w-[460px] aspect-square rounded-2xl overflow-hidden border-2 border-gray-200 shadow-xl bg-gray-100 group">
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
                            className="absolute right-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-lg bg-white/95 backdrop-blur-sm px-3.5 py-2 text-xs font-bold text-[#073763] shadow-md hover:bg-white transition-all"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                              <polyline points="15 3 21 3 21 9" />
                              <line x1="10" y1="14" x2="21" y2="3" />
                            </svg>
                            Open in Maps
                          </a>
                        )}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Scroll to next store prompt */}
                {hasNext && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => scrollToStore(index + 1)}
                      className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#073763] transition-colors py-2 px-4 rounded-full bg-white/80 border border-gray-200/80 shadow-sm cursor-pointer"
                    >
                      <span>Scroll for next store</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-bounce">
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

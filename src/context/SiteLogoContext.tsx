"use client";

import { createContext, useContext } from "react";

const SiteLogoContext = createContext<string | null>(null);

export function SiteLogoProvider({
  logoUrl,
  children,
}: {
  logoUrl: string | null;
  children: React.ReactNode;
}) {
  return (
    <SiteLogoContext.Provider value={logoUrl}>
      {children}
    </SiteLogoContext.Provider>
  );
}

export function useSiteLogo() {
  return useContext(SiteLogoContext);
}

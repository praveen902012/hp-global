"use client";

import { createContext, useContext, useMemo } from "react";
import { defaultSiteDetails, siteLinks, type SiteDetails } from "../../data/siteDetails";

const SiteDetailsContext = createContext<SiteDetails>(defaultSiteDetails);

/** Makes the saved Site details available to interactive parts of the website. */
export function SiteDetailsProvider({ details, children }: { details: SiteDetails; children: React.ReactNode }) {
  return <SiteDetailsContext.Provider value={details}>{children}</SiteDetailsContext.Provider>;
}

export function useSiteLinks() {
  const details = useContext(SiteDetailsContext);
  return useMemo(() => siteLinks(details), [details]);
}

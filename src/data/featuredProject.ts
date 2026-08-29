export interface FeaturedProjectContent {
  hero: { eyebrow: string; title: string; accentTitle: string; location: string; image_url: string };
  home: { eyebrow: string; heading: string; accentHeading: string; description: string; cardImage: string; cardTitle: string; cardDescription: string; tags: string[]; galleryImages: string[] };
  iframe: { src: string; title: string; autoplay: boolean; mute: boolean; loop: boolean; controls: boolean; allow_fullscreen: boolean; referrer_policy: string };
  gallery: { src: string; alt: string }[];
  amenities: { name: string; icon: string }[];
  layout: { image_url: string; alt: string };
  construction: { video_url: string; poster_url: string; images: string[] };
  documents: { name: string; url: string; size: string }[];
  sidebar: { status: string; items: string[]; button_label: string; note: string };
}

export const defaultFeaturedProject: FeaturedProjectContent = {
  hero: { eyebrow: "Premium Residences", title: "Amrit", accentTitle: "Aarogyam", location: "Haridwar, Uttarakhand", image_url: "/assets/featured-project-details/projects-image/overview-img.jpg" },
  home: { eyebrow: "Exclusive Showcase", heading: "Featured", accentHeading: "Project", description: "Discover our latest masterpiece. A perfect blend of luxury, comfort, and modern architecture designed for the future.", cardImage: "/assets/featured-project-details/projects-image/slider-05.jpg", cardTitle: "Amrit Aarogyam", cardDescription: "Premium apartments in Haridwar, Uttarakhand offering unparalleled living with state-of-the-art amenities.", tags: ["Apartments", "Penthouses"], galleryImages: ["/assets/featured-project-details/projects-image/slider-06.jpg", "/assets/featured-project-details/projects-image/slider-03.jpg"] },
  iframe: { src: "https://www.youtube.com/embed/z4nivwEVlgM", title: "Explore Amrit Aarogyam | Complete Project Walkthrough by HP Global Infrra", autoplay: true, mute: true, loop: false, controls: true, allow_fullscreen: true, referrer_policy: "strict-origin-when-cross-origin" },
  gallery: ["1.jpeg", "2.jpeg", "3.jpg", "slider-01.jpg", "slider-03.jpg", "slider-05.jpg", "slider-06.jpg", "overview-img1.jpg", "overview-img2.jpg"].map((file, index) => ({ src: `/assets/featured-project-details/projects-image/${file}`, alt: `Project image ${index + 1}` })),
  amenities: [{ name: "Children Park", icon: "/assets/featured-project-details/projects-image/children-park.png" }, { name: "Jogging Track", icon: "/assets/featured-project-details/projects-image/jogging.png" }, { name: "Multi-Purpose Hall", icon: "/assets/featured-project-details/projects-image/multi-purpose-hall.png" }],
  layout: { image_url: "/assets/featured-project-details/projects-image/layout-plan1.jpg", alt: "Layout plan" },
  construction: { video_url: "/assets/featured-project-details/new-files/Amrit Construction Video.mp4", poster_url: "/assets/featured-project-details/new-files/Amrit construction.jpeg", images: ["Amrit construction.jpeg", "Amrit Construction 2.jpeg", "Amrit Construction 3.jpeg", "Amrit Construction 4.jpeg", "Amrit Construction 5.jpeg", "Amrit Construction 6.jpeg"].map((file) => `/assets/featured-project-details/new-files/${file}`) },
  documents: [{ name: "Apartments Brochure (Latest)", url: "/assets/featured-project-details/new-files/apartments Latest.pdf", size: "26.6 MB" }, { name: "Penthouses Layout & FP (Latest)", url: "/assets/featured-project-details/new-files/Penthouses_All _FP_latest.pdf", size: "24.5 MB" }, { name: "HPG Price List (June 2026)", url: "/assets/featured-project-details/new-files/Amrit-Aarogyam  Hp-Global-Infrra_Price List 13.6.26.pdf", size: "5.4 MB" }, { name: "Penthouses Price List (July 2026)", url: "/assets/featured-project-details/new-files/Penthouses Price List July 26.pdf", size: "9.0 MB" }],
  sidebar: { status: "Now Booking", items: ["Premium Apartments & Luxury Penthouses", "State-of-the-art security features", "Strategic urban location with great connectivity"], button_label: "Register Interest", note: "Our team will contact you within 24 hours to discuss your requirements." },
};

export function iframeUrl(iframe: FeaturedProjectContent["iframe"]) {
  try { const url = new URL(iframe.src); url.searchParams.set("autoplay", iframe.autoplay ? "1" : "0"); url.searchParams.set("mute", iframe.mute ? "1" : "0"); url.searchParams.set("loop", iframe.loop ? "1" : "0"); url.searchParams.set("controls", iframe.controls ? "1" : "0"); return url.toString(); } catch { return iframe.src; }
}

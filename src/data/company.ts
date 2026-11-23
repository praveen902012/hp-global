/** Company contact details used across the public site. */
export const company = {
  name: "HP Global Infrra",
  phoneDisplay: "+91 78279 55579",
  phoneHref: "tel:+917827955579",
  whatsappHref: "https://wa.me/917827955579?text=Hello%20HP%20Global%20Infrra%2C%20I%27d%20like%20to%20know%20more.",
  email: "info@hpglobalinfra.com",
  addressLines: ["D-184, D Block, Sector-63,", "Noida 201309, Uttar Pradesh"],
  mapsHref: "https://www.google.com/maps/search/?api=1&query=D-184%2C%20D%20Block%2C%20Sector%2063%2C%20Noida%20201309",
  tagline: "Shaping the future of real estate across NCR and Uttarakhand. Partner in vision, invest in growth.",
  social: [
    { label: "Instagram", href: "https://www.instagram.com/hpglobalinfra/" },
    { label: "Facebook", href: "https://www.facebook.com/hpglobalinfra/" },
  ],
} as const;

export const whatsappFor = (message: string) => `https://wa.me/917827955579?text=${encodeURIComponent(message)}`;

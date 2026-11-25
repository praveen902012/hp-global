import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };
const base = (size: number, props: SVGProps<SVGSVGElement>) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, ...props });

export function WhatsAppIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M12 3.2a8.8 8.8 0 0 0-7.6 13.2L3.2 20.8l4.5-1.2A8.8 8.8 0 1 0 12 3.2z" />
      <path d="M9.1 8.2c.2-.4.5-.4.7-.4h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .5-.1.6l-.5.6c-.1.1-.1.3 0 .5.6 1 1.4 1.8 2.5 2.4.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.6.7c.3.1.4.3.4.5 0 .5-.2 1.3-1 1.6-.7.3-1.8.3-3.4-.5-1.7-.9-3.1-2.5-3.7-3.9-.5-1.3-.3-2.4.1-2.8z" />
    </svg>
  );
}

export function InstagramIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <path d="M14.5 8H16V4.8h-2.2A3.8 3.8 0 0 0 10 8.6V11H8v3.2h2V21h3.2v-6.8h2.3l.5-3.2h-2.8V9c0-.6.4-1 1-1z" />
    </svg>
  );
}

export function LinkedInIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 10.5V16M8 7.8v.1M11.5 16v-3.2c0-1.4.9-2.3 2.1-2.3s2 .9 2 2.3V16M11.5 10.5V16" />
    </svg>
  );
}

export function YouTubeIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...base(size, props)}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.2 9.3v5.4l4.6-2.7z" />
    </svg>
  );
}

/** Icon for a social network saved in Site details. */
export function SocialIcon({ network, size = 18 }: { network: "instagram" | "facebook" | "linkedin" | "youtube"; size?: number }) {
  if (network === "instagram") return <InstagramIcon size={size} />;
  if (network === "facebook") return <FacebookIcon size={size} />;
  if (network === "linkedin") return <LinkedInIcon size={size} />;
  return <YouTubeIcon size={size} />;
}

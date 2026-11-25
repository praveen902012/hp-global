import {
  Building2, CalendarDays, CircleCheck, Clock, FileText, Globe, Handshake, House, KeyRound, LandPlot, Layers, Mail, MapPin,
  Phone, Search, ShieldCheck, Sparkles, Star, TrendingUp, UserRound, UserRoundCheck, Wallet, type LucideIcon,
} from "lucide-react";

/** Icons editors can choose for icon cards and boxes (names match `iconOptions` in data/pages). */
export const sectionIcons: Record<string, LucideIcon> = {
  "trending-up": TrendingUp, "key-round": KeyRound, "land-plot": LandPlot, "shield-check": ShieldCheck, "user-round-check": UserRoundCheck,
  "file-text": FileText, "user-round": UserRound, globe: Globe, layers: Layers, search: Search, "calendar-days": CalendarDays,
  building: Building2, house: House, handshake: Handshake, phone: Phone, mail: Mail, "map-pin": MapPin, star: Star, clock: Clock,
  "circle-check": CircleCheck, wallet: Wallet, sparkles: Sparkles,
};

export function SectionIcon({ name, size = 22, className }: { name: string; size?: number; className?: string }) {
  const Icon = sectionIcons[name] ?? CircleCheck;
  return <Icon size={size} className={className} aria-hidden />;
}

export type GuestSection =
  | "home"
  | "heritage"
  | "villas"
  | "experiences"
  | "sustainability";

export interface GuestNavLink {
  label: string;
  href: string;
  section: Exclude<GuestSection, "home">;
}

export const GUEST_NAV_LINKS: GuestNavLink[] = [
  { label: "Our Heritage", href: "/heritage", section: "heritage" },
  { label: "The Villas", href: "/villas", section: "villas" },
  { label: "Experiences", href: "/experiences", section: "experiences" },
  { label: "Sustainability", href: "/sustainability", section: "sustainability" },
];

export function sectionFromPathname(pathname: string | null): GuestSection {
  if (!pathname || pathname === "/") return "home";
  if (pathname.startsWith("/villas")) return "villas";
  if (pathname.startsWith("/heritage")) return "heritage";
  if (pathname.startsWith("/experiences")) return "experiences";
  if (pathname.startsWith("/sustainability")) return "sustainability";
  return "home";
}

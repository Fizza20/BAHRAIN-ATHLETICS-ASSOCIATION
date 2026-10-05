import type { DictKey } from "@/lib/i18n/dict";

export type NavItem = { label: DictKey; href: string };

/** Primary navigation: always visible on desktop, hamburger below `lg`. */
export const NAV: NavItem[] = [
  { label: "nav.home", href: "/" },
  { label: "nav.about", href: "/about" },
  { label: "nav.athletes", href: "/athletes" },
  { label: "nav.results", href: "/results" },
  { label: "nav.events", href: "/events" },
  { label: "nav.news", href: "/news" },
  { label: "nav.contact", href: "/contact" },
];

/**
 * Sections that are not in the primary bar. They stay reachable from the mobile menu,
 * the footer and the contextual links on About, Results and Events.
 */
export const MORE_NAV: NavItem[] = [
  { label: "nav.competitions", href: "/competitions" },
  { label: "nav.achievements", href: "/achievements" },
  { label: "nav.clean", href: "/clean-athletics" },
  { label: "nav.board", href: "/about/board" },
  { label: "nav.governance", href: "/about/governance" },
  { label: "nav.documents", href: "/about/documents" },
];

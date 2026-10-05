"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Menu, Search, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { ScrollProgress } from "@/components/ui/motion";
import { BrandLockup } from "./brand";
import { LanguageSwitch } from "./language-switch";
import { MORE_NAV, NAV } from "./nav-config";

export function SiteHeader() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Close the mobile menu on navigation (state adjusted during render, not in an effect).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setMobileOpen(false);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));

  return (
    <>
      <a href="#main" className="sr-only z-[100] bg-brand-600 px-4 py-3 text-white focus:not-sr-only focus:fixed focus:start-4 focus:top-4">
        {t("header.skip")}
      </a>
      <ScrollProgress />
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-white/95 backdrop-blur transition-shadow duration-300",
          scrolled ? "border-line shadow-[0_6px_24px_-12px_rgb(20_20_23/0.25)]" : "border-transparent",
        )}
      >
        <div className="container-x flex h-[72px] items-center justify-between gap-4">
          <BrandLockup />

          {/* Desktop: the full primary navigation is always visible. */}
          <nav aria-label={t("nav.main")} className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {NAV.map((item) => {
                const active = isActive(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative flex h-11 items-center rounded-xs px-3 text-[0.9375rem] font-semibold transition-colors",
                        active ? "text-brand-700" : "text-ink-700 hover:bg-pearl hover:text-ink-950",
                        "after:absolute after:inset-x-3 after:-bottom-[15px] after:h-0.5 after:origin-center after:rounded-full after:bg-brand-600 after:transition-transform after:duration-300",
                        active ? "after:scale-x-100" : "after:scale-x-0 hover:after:scale-x-100",
                      )}
                    >
                      {t(item.label)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <LanguageSwitch className="me-1" />
            <button
              onClick={() => setSearchOpen(true)}
              className="flex h-11 items-center gap-2 rounded-xs px-3 font-semibold text-ink-700 transition-colors hover:bg-pearl hover:text-ink-950"
              aria-label={t("header.searchSite")}
            >
              <Search className="size-5" aria-hidden />
              <span className="hidden text-[0.9375rem] xl:inline">{t("header.search")}</span>
            </button>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="flex size-11 items-center justify-center rounded-xs text-ink-900 hover:bg-pearl lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              aria-label={mobileOpen ? t("header.closeMenu") : t("header.openMenu")}
            >
              {mobileOpen ? <X className="size-6" aria-hidden /> : <Menu className="size-6" aria-hidden />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && <MobileMenu isActive={isActive} onNavigate={() => setMobileOpen(false)} />}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}

/** Tablet and mobile only. Primary links first, then the secondary sections. */
function MobileMenu({ isActive, onNavigate }: { isActive: (h: string) => boolean; onNavigate: () => void }) {
  const { t } = useI18n();
  return (
    <div id="mobile-menu" data-lenis-prevent className="fixed inset-x-0 bottom-0 top-[72px] z-40 overflow-y-auto bg-white lg:hidden">
      <nav aria-label={t("nav.mobile")} className="container-x pb-12 pt-4">
        <ul className="divide-y divide-line">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn(
                  "flex min-h-14 items-center justify-between gap-4 text-lg font-semibold",
                  isActive(item.href) ? "text-brand-700" : "text-ink-900",
                )}
              >
                {t(item.label)}
                <ArrowRight className={cn("size-5", isActive(item.href) ? "text-brand-600" : "text-ink-300")} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-eyebrow mb-1 mt-8 text-ink-500">{t("nav.more")}</p>
        <ul className="grid grid-cols-2 gap-x-4">
          {MORE_NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                aria-current={isActive(item.href) ? "page" : undefined}
                className={cn("flex min-h-12 items-center text-base font-medium", isActive(item.href) ? "text-brand-700" : "text-ink-700")}
              >
                {t(item.label)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

const QUICK = [
  { name: "Birhanu Balew", key: undefined, href: "/athletes/birhanu-balew" },
  { name: "Salwa Eid Naser", key: undefined, href: "/athletes/salwa-eid-naser" },
  { name: "", key: "search.quick.results" as const, href: "/results?year=2026" },
  { name: "", key: "search.quick.antidoping" as const, href: "/clean-athletics" },
];

function SearchDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { t } = useI18n();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-ink-950/50" />
        <Dialog.Content
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
          }}
          className="fixed left-1/2 top-[12vh] z-[61] w-[min(680px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-md bg-white shadow-2xl"
        >
          <Dialog.Title className="sr-only">{t("header.searchSite")}</Dialog.Title>
          <Dialog.Description className="sr-only">{t("search.desc")}</Dialog.Description>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = inputRef.current?.value.trim();
              if (q) {
                onOpenChange(false);
                router.push(`/search?q=${encodeURIComponent(q)}`);
              }
            }}
            className="flex items-center gap-3 border-b border-line px-5"
            role="search"
          >
            <Search className="size-5 text-ink-500" aria-hidden />
            <input
              ref={inputRef}
              name="q"
              type="search"
              placeholder={t("search.placeholder")}
              aria-label={t("header.search")}
              className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-ink-400"
            />
            <Dialog.Close className="flex size-10 items-center justify-center rounded-xs text-ink-600 hover:bg-pearl" aria-label={t("header.closeSearch")}>
              <X className="size-5" aria-hidden />
            </Dialog.Close>
          </form>
          <div className="p-5">
            <p className="text-eyebrow mb-3 text-ink-500">{t("search.popular")}</p>
            <ul className="flex flex-wrap gap-2">
              {QUICK.map((q) => (
                <li key={q.href}>
                  <Link href={q.href} onClick={() => onOpenChange(false)} className="tab-pill">
                    {q.key ? t(q.key) : q.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

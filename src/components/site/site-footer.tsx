import Link from "next/link";
import { MapPin, Phone, Mail } from "lucide-react";
import { organisation } from "@/db/seed-data/real";
import { getT } from "@/lib/i18n/server";
import type { DictKey } from "@/lib/i18n/dict";
import { BrandLockup } from "./brand";
import { SocialLinks } from "./social";

const COLS: { title: DictKey; links: { label: DictKey; href: string }[] }[] = [
  {
    title: "footer.compete",
    links: [
      { label: "nav.athletes", href: "/athletes" },
      { label: "nav.results", href: "/results" },
      { label: "nav.competitions", href: "/competitions" },
      { label: "footer.link.calendar", href: "/events" },
      { label: "nav.achievements", href: "/achievements" },
    ],
  },
  {
    title: "footer.federation",
    links: [
      { label: "footer.link.about", href: "/about" },
      { label: "nav.board", href: "/about/board" },
      { label: "nav.governance", href: "/about/governance" },
      { label: "nav.documents", href: "/about/documents" },
      { label: "nav.news", href: "/news" },
      { label: "nav.contact", href: "/contact" },
    ],
  },
  {
    title: "footer.clean",
    links: [
      { label: "nav.clean", href: "/clean-athletics" },
      { label: "footer.link.medication", href: "/clean-athletics/check-your-medication" },
      { label: "footer.link.tue", href: "/clean-athletics/therapeutic-use-exemptions" },
      { label: "footer.link.report", href: "/clean-athletics/report-doping" },
      { label: "footer.link.whistle", href: "/clean-athletics/whistleblowing" },
    ],
  },
];

export async function SiteFooter() {
  const { t } = await getT();
  return (
    <footer className="border-t-4 border-brand-600 bg-ink-950 text-white">
      <div className="container-x">
        <div className="grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
          <div className="lg:col-span-4">
            <BrandLockup inverse />
            <p className="mt-5 max-w-sm text-white/80">{t("footer.tagline")}</p>
            <ul className="mt-6 space-y-3 text-[0.9375rem] text-white/85">
              <li className="flex gap-3">
                <MapPin className="mt-1 size-4 shrink-0 text-white/70" aria-hidden />
                <address className="not-italic" dir="ltr">{organisation.address}</address>
              </li>
              <li className="flex gap-3">
                <Phone className="mt-1 size-4 shrink-0 text-white/70" aria-hidden />
                <a href={`tel:${organisation.phone.replace(/\s/g, "")}`} className="underline-offset-4 hover:underline" dir="ltr">
                  {organisation.phone}
                </a>
              </li>
              <li className="flex gap-3">
                <Mail className="mt-1 size-4 shrink-0 text-white/70" aria-hidden />
                <a href={`mailto:${organisation.email}`} className="break-all underline-offset-4 hover:underline">
                  {organisation.email}
                </a>
              </li>
            </ul>
          </div>
          <nav aria-label={t("footer.nav")} className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-8 lg:ps-12">
            {COLS.map((col) => (
              <div key={col.title}>
                <h2 className="text-eyebrow mb-4 text-white/70">{t(col.title)}</h2>
                <ul>
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link href={l.href} className="flex min-h-10 items-center text-[0.9375rem] text-white/90 underline-offset-4 hover:text-white hover:underline">
                        {t(l.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/15 py-6 md:flex-row md:items-center md:justify-between">
          <SocialLinks tone="inverse" />
          <p className="max-w-2xl text-sm leading-relaxed text-white/70 md:text-end">
            © {new Date().getFullYear()} {t("footer.rights")}{" "}
            <Link href="/admin" className="underline underline-offset-4 hover:text-white" lang="en" dir="ltr">
              {t("footer.admin")}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}

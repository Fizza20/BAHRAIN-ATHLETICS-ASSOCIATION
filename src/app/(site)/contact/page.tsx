import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { organisation } from "@/db/seed-data/real";
import { PageHero } from "@/components/site/page-hero";
import { SocialLinks } from "@/components/site/social";
import { getT } from "@/lib/i18n/server";
import { ContactForm } from "./contact-form";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return { title: t("contact.meta.title"), description: t("contact.meta.desc"), alternates: { canonical: "/contact" } };
}

export default async function ContactPage() {
  const { t, locale } = await getT();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SportsOrganization",
    name: organisation.name,
    alternateName: organisation.nameAr,
    sport: "Athletics",
    email: organisation.email,
    telephone: organisation.phone,
    address: { "@type": "PostalAddress", streetAddress: "Building 333, Road 435, Block 67", addressLocality: "Riffa", addressCountry: "BH" },
    sameAs: Object.values(organisation.social),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero eyebrow={t("contact.eyebrow")} title={t("contact.title")} intro={t("contact.intro")} crumbs={[{ label: t("contact.crumb.federation"), href: "/about" }, { label: t("contact.title") }]} />
      <div className="container-x section-y grid gap-12 lg:grid-cols-12 lg:gap-16">
        <aside className="lg:col-span-4">
          <ul className="space-y-8">
            <li className="flex gap-4">
              <MapPin className="mt-1 size-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-eyebrow text-ink-500">{t("contact.address")}</p>
                <address className="mt-2 not-italic text-lg text-ink-900">{locale === "ar" ? t("contact.addressText") : organisation.address}</address>
              </div>
            </li>
            <li className="flex gap-4">
              <Phone className="mt-1 size-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-eyebrow text-ink-500">{t("contact.phone")}</p>
                <a href={`tel:${organisation.phone.replace(/\s/g, "")}`} dir="ltr" className="mt-2 block text-start text-lg tabular text-ink-900 hover:text-brand-700 hover:underline">
                  {organisation.phone}
                </a>
              </div>
            </li>
            <li className="flex gap-4">
              <Mail className="mt-1 size-5 shrink-0 text-brand-600" aria-hidden />
              <div>
                <p className="text-eyebrow text-ink-500">{t("contact.email")}</p>
                <a href={`mailto:${organisation.email}`} dir="ltr" className="mt-2 block break-all text-start text-lg text-ink-900 hover:text-brand-700 hover:underline">
                  {organisation.email}
                </a>
              </div>
            </li>
          </ul>
          <div className="card mt-10 p-6">
            <p className="text-eyebrow mb-3 text-ink-500">{t("contact.follow")}</p>
            <SocialLinks />
          </div>
        </aside>
        <div className="lg:col-span-7 lg:col-start-6">
          <h2 className="text-h2 mb-8 text-ink-950">{t("contact.send")}</h2>
          <ContactForm />
        </div>
      </div>
    </>
  );
}

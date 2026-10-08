import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { organisation } from "@/db/seed-data/real";
import { PageHero } from "@/components/site/page-hero";
import { SocialLinks } from "@/components/site/social";
import { LaneArcs } from "@/components/ui/lane-arcs";
import { Reveal } from "@/components/ui/motion";
import { getT } from "@/lib/i18n/server";
import { ContactForm } from "./contact-form";
import { jsonLd as jsonLdScript } from "@/lib/security/json-ld";

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

  const item = "group flex items-start gap-4 rounded-sm p-3 -m-3 transition-colors hover:bg-white/[0.07]";
  const icon =
    "flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-all duration-300 group-hover:scale-110 group-hover:bg-brand-600 group-hover:ring-brand-500";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }} />
      <PageHero eyebrow={t("contact.eyebrow")} title={t("contact.title")} intro={t("contact.intro")} crumbs={[{ label: t("contact.crumb.federation"), href: "/about" }, { label: t("contact.title") }]} />

      <section className="relative isolate bg-gradient-to-b from-pearl to-white section-y">
        <div className="container-x">
          <Reveal className="overflow-hidden rounded-[28px] border border-line bg-white shadow-[0_40px_80px_-40px_rgb(16_18_27/0.35)] lg:grid lg:grid-cols-12">
            {/* Contact details */}
            <aside className="relative isolate overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-brand-950 p-8 text-white md:p-10 lg:col-span-5 lg:p-12">
              <LaneArcs className="absolute inset-0 -z-10 size-full text-white/[0.09]" lanes={8} />
              <div className="absolute -bottom-24 -start-24 -z-10 size-72 rounded-full bg-brand-500/30 blur-3xl" aria-hidden />

              <p className="text-eyebrow text-white/80">{t("contact.eyebrow")}</p>
              <h2 className="mt-3 text-h2">{t("contact.title")}</h2>
              <p className="mt-3 max-w-sm text-white/80">{t("contact.intro")}</p>

              <ul className="mt-10 space-y-7">
                <li>
                  <div className={item}>
                    <span className={icon}>
                      <MapPin className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-eyebrow text-white/70">{t("contact.address")}</p>
                      <address className="mt-1.5 not-italic text-lg leading-snug text-white">{locale === "ar" ? t("contact.addressText") : organisation.address}</address>
                    </div>
                  </div>
                </li>
                <li>
                  <a href={`tel:${organisation.phone.replace(/\s/g, "")}`} className={item}>
                    <span className={icon}>
                      <Phone className="size-5" aria-hidden />
                    </span>
                    <div>
                      <p className="text-eyebrow text-white/70">{t("contact.phone")}</p>
                      <p dir="ltr" className="mt-1.5 text-start text-lg tabular text-white">
                        {organisation.phone}
                      </p>
                    </div>
                  </a>
                </li>
                <li>
                  <a href={`mailto:${organisation.email}`} className={item}>
                    <span className={icon}>
                      <Mail className="size-5" aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="text-eyebrow text-white/70">{t("contact.email")}</p>
                      <p dir="ltr" className="mt-1.5 break-all text-start text-lg text-white">
                        {organisation.email}
                      </p>
                    </div>
                  </a>
                </li>
              </ul>

              <div className="mt-10 border-t border-white/15 pt-6">
                <p className="text-eyebrow mb-2 text-white/70">{t("contact.follow")}</p>
                <SocialLinks tone="inverse" className="-ms-3" />
              </div>
            </aside>

            {/* Form */}
            <div className="p-6 sm:p-8 md:p-10 lg:col-span-7 lg:p-14">
              <h2 className="text-h2 mb-8 text-ink-950">{t("contact.send")}</h2>
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

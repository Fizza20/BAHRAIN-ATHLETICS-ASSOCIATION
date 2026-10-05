import type { Metadata } from "next";
import { getEvents } from "@/lib/queries";
import { PageHero } from "@/components/site/page-hero";
import { ButtonLink } from "@/components/ui/button";
import { EventsExplorer } from "@/components/domain/events-calendar";
import { getT } from "@/lib/i18n/server";
import { INTL_TAG } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getT();
  return {
    title: t("events.meta.title"),
    description: t("events.meta.desc"),
    alternates: { canonical: "/events" },
  };
}

export default async function EventsPage({ searchParams }: PageProps<"/events">) {
  const { t, locale } = await getT();
  const sp = await searchParams;
  const events = await getEvents();
  const next = events.find((e) => e.live === "upcoming");
  const tab = typeof sp.status === "string" ? sp.status : events.some((e) => e.live === "ongoing") ? "ongoing" : "upcoming";

  return (
    <>
      <PageHero
        eyebrow={t("events.eyebrow")}
        title={t("events.title")}
        intro={t("events.intro")}
        crumbs={[{ label: t("events.crumb") }]}
        aside={
          next && (
            <div className="card p-6">
              <p className="text-eyebrow text-brand-700">{t("events.nextUp")}</p>
              <p className="mt-2 text-h3 text-ink-950">{next.title}</p>
              <p className="mt-2 text-[0.9375rem] text-ink-600">
                {next.location} · {new Intl.DateTimeFormat(INTL_TAG[locale], { day: "numeric", month: "long", timeZone: "Asia/Bahrain" }).format(new Date(next.startAt!))}
              </p>
              <ButtonLink href={`/events/${next.slug}`} variant="secondary" size="sm" className="mt-4">
                {t("events.view")}
              </ButtonLink>
            </div>
          )
        }
      />
      <div className="container-x pb-16 md:pb-24">
        <EventsExplorer
          initialTab={tab}
          events={events.map((e) => ({
            slug: e.slug,
            title: e.title,
            type: e.type,
            startAt: e.startAt,
            endAt: e.endAt,
            location: e.location,
            live: e.live,
            isDemo: e.isDemo,
            competition: e.competition ? { slug: e.competition.slug, name: e.competition.name } : null,
          }))}
        />
      </div>
    </>
  );
}

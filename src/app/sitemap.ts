import type { MetadataRoute } from "next";
import { getSitemapEntities } from "@/lib/queries";
import { TOPICS } from "@/lib/clean-athletics";
import { SITE_URL } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { athletes, competitions, events, news } = await getSitemapEntities();
  const now = new Date();
  const statics = ["", "/athletes", "/results", "/competitions", "/events", "/news", "/achievements", "/about", "/about/board", "/about/governance", "/about/documents", "/clean-athletics", "/contact"];
  return [
    ...statics.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: now, changeFrequency: "daily" as const, priority: p === "" ? 1 : 0.8 })),
    ...TOPICS.map((t) => ({ url: `${SITE_URL}/clean-athletics/${t.slug}`, lastModified: now, priority: 0.5 })),
    ...athletes.map((a) => ({ url: `${SITE_URL}/athletes/${a.slug}`, lastModified: a.updatedAt, priority: 0.7 })),
    ...competitions.map((c) => ({ url: `${SITE_URL}/competitions/${c.slug}`, lastModified: c.updatedAt, priority: 0.7 })),
    ...events.map((e) => ({ url: `${SITE_URL}/events/${e.slug}`, lastModified: e.updatedAt, priority: 0.6 })),
    ...news.map((n) => ({ url: `${SITE_URL}/news/${n.slug}`, lastModified: n.updatedAt, priority: 0.6 })),
  ];
}

import { TOPICS, PARTNERS, type Topic } from "@/lib/clean-athletics";
import { TOPICS_AR, PARTNERS_AR } from "@/lib/clean-athletics.ar";
import type { Locale } from "@/lib/i18n/config";

/** Topics in the requested locale. Links, slugs and legacy URLs always come from the English source. */
export function getTopics(locale: Locale): Topic[] {
  if (locale !== "ar") return TOPICS;
  return TOPICS.map((en) => {
    const ar = TOPICS_AR.find((x) => x.slug === en.slug);
    if (!ar) return en;
    return {
      ...en,
      title: ar.title,
      short: ar.short,
      lead: ar.lead,
      sections: ar.sections,
      actions: en.actions?.map((a, i) => ({ ...a, label: ar.actionLabels?.[i] ?? a.label })),
    };
  });
}

export function getPartners(locale: Locale) {
  if (locale !== "ar") return PARTNERS;
  return PARTNERS.map((p) => ({ ...p, full: PARTNERS_AR[p.name] ?? p.full }));
}

"use client";

import Link from "next/link";
import { Photo } from "@/components/ui/photo";
import { DemoBadge } from "@/components/ui/badge";
import { RevealCard } from "@/components/ui/motion";
import { photoForGroup } from "@/lib/images";
import { useI18n } from "@/lib/i18n/client";
import { keyOf } from "@/lib/i18n/dict";

export type AthleteLike = {
  slug: string;
  firstName: string;
  lastName: string;
  gender: string;
  category: string;
  status: string;
  imageUrl: string | null;
  headline: string | null;
  isDemo: boolean;
};

/**
 * Athlete card: photo on top, name and event below. The whole card is one link.
 * Without an official portrait it uses an atmospheric discipline photo, never a stranger's face as the athlete.
 */
export function AthleteCard({
  a,
  discipline,
  stat,
}: {
  a: AthleteLike;
  discipline?: { name: string; group: string } | null;
  stat?: { label: string; value: string };
  /** Kept for existing callers; cards are no longer numbered. */
  index?: number;
}) {
  const { t } = useI18n();
  const photo = a.imageUrl ? { src: a.imageUrl } : photoForGroup(discipline?.group);
  return (
    <RevealCard className="h-full">
      <article className="card card-interactive group relative flex h-full flex-col overflow-hidden">
        <div className="relative aspect-[4/3] overflow-hidden bg-pearl">
          <Photo
            src={photo.src}
            alt={a.imageUrl ? `${a.firstName} ${a.lastName}` : ""}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
            className={a.imageUrl ? "transition-transform duration-700 group-hover:scale-110" : "opacity-60 grayscale transition-transform duration-700 group-hover:scale-110"}
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 bg-brand-600 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
          {a.isDemo && <DemoBadge className="absolute start-3 top-3 bg-white" />}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <p className="text-sm font-semibold text-brand-700">{discipline?.name ?? t("common.athlete")}</p>
          <h3 className="mt-1 text-h3 text-ink-950">
            <Link href={`/athletes/${a.slug}`} className="after:absolute after:inset-0 after:content-['']">
              {a.firstName} {a.lastName}
            </Link>
          </h3>
          <div className="mt-auto flex items-end justify-between gap-3 pt-4 text-sm text-ink-600">
            <span>
              {t(keyOf("category", a.category))} · {t(keyOf("gender", a.gender))}
              {a.status === "retired" && ` · ${t("athlete.status.retired")}`}
            </span>
            {stat && (
              <span className="shrink-0 text-end">
                <span className="block text-lg leading-none text-mark text-ink-950">{stat.value}</span>
                <span className="text-sm">{stat.label}</span>
              </span>
            )}
          </div>
        </div>
      </article>
    </RevealCard>
  );
}

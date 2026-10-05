"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { DemoBadge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { keyOf } from "@/lib/i18n/dict";
import { RevealCard } from "@/components/ui/motion";

export type Story = {
  slug: string;
  title: string;
  excerpt: string | null;
  category: string;
  imageUrl: string | null;
  publishedAt: string | null;
  isDemo: boolean;
};

function Meta({ s }: { s: Story }) {
  const { t, locale } = useI18n();
  return (
    <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-600">
      <span className="font-semibold text-brand-700">{t(keyOf("newscat", s.category))}</span>
      <span aria-hidden>·</span>
      <time dateTime={s.publishedAt ?? undefined}>{formatDate(s.publishedAt, undefined, locale)}</time>
      {s.isDemo && <DemoBadge />}
    </p>
  );
}

const link = "after:absolute after:inset-0 after:content-['']";

/** Featured story: image and text side by side on desktop. Same card surface as every other story. */
export function LeadStory({ s, priority }: { s: Story; priority?: boolean }) {
  const { t } = useI18n();
  return (
    <RevealCard className="h-full">
    <article className="card card-interactive group relative grid overflow-hidden lg:grid-cols-2">
      <div className="relative aspect-[16/10] overflow-hidden bg-pearl lg:aspect-auto lg:min-h-[340px]">
        <Photo src={s.imageUrl} alt="" priority={priority} sizes="(min-width: 1024px) 50vw, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-col justify-center p-6 md:p-8">
        <Meta s={s} />
        <h3 className="mt-3 text-h2 text-ink-950 group-hover:text-brand-700">
          <Link href={`/news/${s.slug}`} className={link}>
            {s.title}
          </Link>
        </h3>
        {s.excerpt && <p className="mt-3 line-clamp-3 text-ink-600">{s.excerpt}</p>}
        <span className="mt-5 inline-flex items-center gap-1 text-[0.9375rem] font-semibold text-brand-700" aria-hidden>
          {t("common.readStory")} <ArrowRight className="size-4" />
        </span>
      </div>
    </article>
    </RevealCard>
  );
}

/** Compact story: small image left, text right. */
export function SideStory({ s }: { s: Story }) {
  return (
    <RevealCard className="h-full">
    <article className="card card-interactive group relative grid grid-cols-[112px_1fr] gap-4 p-3 sm:grid-cols-[144px_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-pearl">
        <Photo src={s.imageUrl} alt="" sizes="144px" className="transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="min-w-0 self-center">
        <Meta s={s} />
        <h3 className="mt-1.5 text-base font-bold leading-snug text-ink-950 group-hover:text-brand-700">
          <Link href={`/news/${s.slug}`} className={link}>
            {s.title}
          </Link>
        </h3>
      </div>
    </article>
    </RevealCard>
  );
}

/** Standard story for grids. */
export function StoryCard({ s }: { s: Story; size?: "md" | "lg" }) {
  return (
    <RevealCard className="h-full">
    <article className="card card-interactive group relative flex h-full flex-col overflow-hidden">
      <div className="relative aspect-[3/2] overflow-hidden bg-pearl">
        <Photo src={s.imageUrl} alt="" sizes="(min-width: 1024px) 33vw, 100vw" className="transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <Meta s={s} />
        <h3 className="mt-2 text-h3 text-ink-950 group-hover:text-brand-700">
          <Link href={`/news/${s.slug}`} className={link}>
            {s.title}
          </Link>
        </h3>
        {s.excerpt && <p className="mt-2 line-clamp-2 text-ink-600">{s.excerpt}</p>}
      </div>
    </article>
    </RevealCard>
  );
}

/** Text-only card for older stories. */
export function CompactStory({ s }: { s: Story; index?: number }) {
  return (
    <RevealCard className="h-full">
    <article className="card card-interactive group relative p-5">
      <Meta s={s} />
      <h3 className="mt-2 font-semibold leading-snug text-ink-950 group-hover:text-brand-700">
        <Link href={`/news/${s.slug}`} className={link}>
          {s.title}
        </Link>
      </h3>
    </article>
    </RevealCard>
  );
}

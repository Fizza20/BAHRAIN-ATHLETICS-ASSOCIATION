"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { photos } from "@/lib/images";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { RecordTag } from "@/components/ui/badge";
import { Magnetic, MarkCounter, Parallax, WordReveal } from "@/components/ui/motion";
import { LaneArcs } from "@/components/ui/lane-arcs";
import { useI18n } from "@/lib/i18n/client";
import { formatDate, fullName } from "@/lib/utils";

export type RailItem = {
  id: number;
  athlete: { slug: string; firstName: string; lastName: string };
  discipline: string;
  mark: string | null;
  position: number | null;
  competition?: string | null;
  record?: string | null;
  date: string;
};

const EASE = [0.16, 1, 0.3, 1] as const;

/** Photographic hero: the one dark surface on the page, with a flag-edge finish. */
export function Hero({ headline }: { headline: RailItem }) {
  const { t, locale } = useI18n();
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: EASE, delay },
  });

  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden bg-ink-950 text-white">
      <Parallax className="absolute inset-0 -z-20" distance={80}>
        <div className="animate-kenburns absolute inset-0">
          <Photo src={photos.blocks.src} alt="" priority sizes="100vw" className="object-[70%_center] opacity-80" />
        </div>
      </Parallax>
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/75 to-ink-950/10 rtl:bg-gradient-to-l" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950/70 via-transparent to-transparent" />
      <LaneArcs className="absolute inset-y-0 end-0 -z-10 h-full w-[70%] text-white/15" lanes={9} />
      {/* Red lane accent */}
      <motion.div
        aria-hidden
        className="absolute inset-y-0 start-0 -z-10 w-1.5 origin-top bg-brand-600"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 1.1, ease: EASE }}
      />

      <div className="container-x grid items-center gap-10 pb-24 pt-14 md:pb-32 md:pt-20 lg:grid-cols-12 lg:pb-36 lg:pt-24">
        <div className="lg:col-span-7">
          <motion.p {...fade(0.05)} className="text-eyebrow mb-5 flex items-center gap-3 text-white/85">
            <span className="h-0.5 w-10 bg-brand-500" aria-hidden />
            {t("home.hero.eyebrow")}
          </motion.p>
          <h1 id="hero-title" className="text-display text-white">
            <WordReveal text={t("home.hero.title1")} delay={0.1} />
            <br />
            <WordReveal text={t("home.hero.title2")} delay={0.35} className="text-brand-500" />
          </h1>
          <motion.p {...fade(0.6)} className="mt-6 max-w-xl text-lg text-white/85">
            {t("home.hero.intro")}
          </motion.p>
          <motion.div {...fade(0.75)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Magnetic className="w-full sm:w-auto">
              <ButtonLink href="/athletes" size="lg" className="w-full sm:w-auto">
                {t("home.hero.cta1")}
              </ButtonLink>
            </Magnetic>
            <Magnetic className="w-full sm:w-auto">
              <ButtonLink href="/results" size="lg" variant="outline-inverse" className="w-full sm:w-auto">
                {t("home.hero.cta2")}
              </ButtonLink>
            </Magnetic>
          </motion.div>
        </div>

        {/* The season's defining mark */}
        <motion.div {...fade(0.9)} className="lg:col-span-5 lg:justify-self-end">
          <Link
            href={`/athletes/${headline.athlete.slug}`}
            className="group block max-w-md rounded-md border border-white/20 bg-white/10 p-6 shadow-2xl backdrop-blur-md transition-colors hover:bg-white/15"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-eyebrow text-white/85">{t("home.hero.mark")}</span>
              {headline.record && <RecordTag record={headline.record} />}
            </div>
            <p className="mt-3 text-6xl leading-none text-mark text-white" dir="ltr">
              {headline.mark ? <MarkCounter mark={headline.mark} /> : "—"}
            </p>
            <p className="mt-4 font-semibold">
              {fullName(headline.athlete)} <span className="font-normal text-white/80">· {headline.discipline}</span>
            </p>
            <p className="mt-1 text-[0.9375rem] text-white/80">
              {headline.competition} · {formatDate(headline.date, undefined, locale)}
            </p>
            <span className="mt-4 block h-0.5 w-12 bg-brand-500 transition-all duration-500 group-hover:w-full" aria-hidden />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/** Live-style results ticker in Bahrain red. Pauses on hover; static for reduced motion. */
export function ResultsTicker({ items }: { items: RailItem[] }) {
  const { t } = useI18n();
  if (!items.length) return null;
  const row = (suffix: string) =>
    items.map((r) => (
      <li key={`${r.id}-${suffix}`} className="flex shrink-0 items-center gap-3 px-6">
        <span className="flex size-7 items-center justify-center rounded-full bg-white text-sm font-extrabold text-ink-950 tabular">{r.position ?? "–"}</span>
        <Link href={`/athletes/${r.athlete.slug}`} className="font-semibold underline-offset-4 hover:underline">
          {fullName(r.athlete)}
        </Link>
        <span className="text-white/85">
          {r.discipline} · <span dir="ltr">{r.mark ?? t("common.tbc")}</span>
        </span>
        <span aria-hidden className="ms-3 text-white/50">
          ◆
        </span>
      </li>
    ));
  return (
    <section aria-label={t("home.ticker")} className="overflow-hidden border-b border-white/10 bg-ink-950 py-3 text-white">
      <div className="flex items-center">
        <span className="text-eyebrow relative z-10 shrink-0 bg-brand-600 px-4 py-2 sm:px-5">{t("home.hero.latest")}</span>
        <div className="min-w-0 flex-1 overflow-hidden">
          <ul className="animate-marquee flex w-max motion-reduce:animate-none">
            {row("a")}
            <span aria-hidden className="contents">
              {row("b")}
            </span>
          </ul>
        </div>
      </div>
    </section>
  );
}

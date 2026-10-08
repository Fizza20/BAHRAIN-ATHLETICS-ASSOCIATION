"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { photos } from "@/lib/images";
import { Photo } from "@/components/ui/photo";
import { ButtonLink } from "@/components/ui/button";
import { RecordTag } from "@/components/ui/badge";
import { Magnetic, MarkCounter, Parallax, TiltCard, WordReveal } from "@/components/ui/motion";
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

/** Cinematic full-screen hero: photo, aurora glow, film grain, giant type with a serif accent word. */
export function Hero({ headline }: { headline: RailItem }) {
  const { t, locale } = useI18n();
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 28 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.9, ease: EASE, delay },
  });

  return (
    <section aria-labelledby="hero-title" className="under-header grain relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-ink-950 text-white">
      <Parallax className="absolute inset-0 -z-20" distance={90}>
        <div className="animate-kenburns absolute inset-0">
          <Photo src={photos.blocks.src} alt="" priority sizes="100vw" className="object-[68%_center] opacity-90" />
        </div>
      </Parallax>
      {/* Grading */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/70 to-ink-950/10 rtl:bg-gradient-to-l" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-ink-950/20 to-ink-950/50" />
      {/* Aurora */}
      <div aria-hidden className="animate-drift-a absolute -start-32 top-1/4 -z-10 size-[34rem] rounded-full bg-brand-600/22 blur-[130px]" />
      <div aria-hidden className="animate-drift-b absolute -bottom-40 end-0 -z-10 size-[30rem] rounded-full bg-brand-500/15 blur-[140px]" />
      <LaneArcs className="absolute inset-y-0 end-0 -z-10 h-full w-[75%] text-white/[0.09]" lanes={9} />

      <div className="container-x relative z-[2] flex flex-1 flex-col justify-end pb-10 pt-24 md:pb-14 lg:pb-16">
        <motion.p {...fade(0.05)} className="text-eyebrow mb-6 flex items-center gap-3 text-white/85">
          <span className="h-px w-10 bg-brand-500" aria-hidden />
          {t("home.hero.eyebrow")}
        </motion.p>

        <h1 id="hero-title" className="text-[clamp(2.6rem,8.2vw,7.25rem)] font-bold leading-[0.98] tracking-[-0.04em] text-white rtl:leading-[1.15] rtl:tracking-normal">
          <WordReveal text={t("home.hero.title1")} delay={0.1} />
          <br />
          <WordReveal text={t("home.hero.title2")} delay={0.4} className="font-accent pe-2 text-[1.08em] text-brand-500" />
        </h1>

        <div className="mt-10 grid items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <motion.p {...fade(0.7)} className="max-w-xl text-lg text-white/85 md:text-xl">
              {t("home.hero.intro")}
            </motion.p>
            <motion.div {...fade(0.85)} className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Magnetic className="w-full sm:w-auto">
                <ButtonLink href="/athletes" size="lg" className="h-14 w-full rounded-full px-8 shadow-[0_18px_40px_-14px_rgb(206_17_38/0.8)] sm:w-auto">
                  {t("home.hero.cta1")}
                </ButtonLink>
              </Magnetic>
              <Magnetic className="w-full sm:w-auto">
                <ButtonLink href="/results" size="lg" variant="outline-inverse" className="glass h-14 w-full rounded-full px-8 sm:w-auto">
                  {t("home.hero.cta2")}
                </ButtonLink>
              </Magnetic>
            </motion.div>
          </div>

          {/* The season's defining mark */}
          <motion.div {...fade(1)} className="lg:col-span-5 lg:col-start-8">
            <TiltCard className="relative">
              <Link href={`/athletes/${headline.athlete.slug}`} className="glass group relative block overflow-hidden rounded-[28px] p-6 shadow-2xl transition-colors hover:bg-white/15 md:p-7">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-eyebrow text-white/85">{t("home.hero.mark")}</span>
                  {headline.record && <RecordTag record={headline.record} />}
                </div>
                <p className="mt-3 text-[clamp(3.25rem,6vw,5.25rem)] leading-none text-mark text-white" dir="ltr">
                  {headline.mark ? <MarkCounter mark={headline.mark} /> : "—"}
                </p>
                <p className="mt-4 font-semibold">
                  {fullName(headline.athlete)} <span className="font-normal text-white/80">· {headline.discipline}</span>
                </p>
                <p className="mt-1 text-[0.9375rem] text-white/80">
                  {headline.competition} · {formatDate(headline.date, undefined, locale)}
                </p>
                <span className="mt-5 block h-0.5 w-12 bg-brand-500 transition-all duration-700 group-hover:w-full" aria-hidden />
              </Link>
            </TiltCard>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div {...fade(1.3)} className="mt-10 hidden items-center gap-3 text-sm font-medium text-white/70 md:flex" aria-hidden>
          <span className="relative block h-10 w-px overflow-hidden bg-white/25">
            <span className="absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_1.8s_ease-in-out_infinite] bg-white" />
          </span>
          {t("home.scroll")}
        </motion.div>
      </div>
    </section>
  );
}

/** Giant outlined words drifting across the page. Decorative, so hidden from assistive tech. */
export function BigMarquee({ words }: { words: string[] }) {
  const row = (k: string) =>
    words.map((w, i) => (
      <li key={`${k}${i}`} className="flex shrink-0 items-center gap-8 pe-8 md:gap-12 md:pe-12">
        <span className="text-outline text-[clamp(2.75rem,8vw,6.5rem)] font-bold uppercase leading-none tracking-[-0.03em] rtl:tracking-normal">{w}</span>
        <span className="font-accent text-[clamp(2rem,6vw,5rem)] leading-none text-brand-600">✦</span>
      </li>
    ));
  return (
    <div aria-hidden className="overflow-hidden bg-white py-6 text-ink-950/20 md:py-9">
      <ul className="animate-marquee flex w-max motion-reduce:animate-none">
        {row("a")}
        {row("b")}
      </ul>
    </div>
  );
}

/** Live-style results ticker. Pauses on hover; static for reduced motion. */
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
    <section aria-label={t("home.ticker")} className="overflow-hidden border-y border-white/10 bg-ink-950 py-3 text-white">
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

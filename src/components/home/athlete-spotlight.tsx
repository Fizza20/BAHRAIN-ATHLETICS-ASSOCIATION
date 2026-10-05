"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Pause, Play } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { photoForGroup } from "@/lib/images";
import { cn, formatDate, ordinal } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { keyOf } from "@/lib/i18n/dict";
import { ButtonLink } from "@/components/ui/button";
import { RecordTag } from "@/components/ui/badge";

export type SpotlightAthlete = {
  slug: string;
  firstName: string;
  lastName: string;
  category: string;
  gender: string;
  headline: string | null;
  imageUrl: string | null;
  discipline: { name: string; group: string } | null;
  latest: { mark: string | null; position: number | null; competition: string | null; date: string; record: string | null; discipline: string } | null;
};

const EASE = [0.16, 1, 0.3, 1] as const;
const INTERVAL = 7000;

/**
 * Showcase for the dark feature band: one athlete at a time with a cross-fading portrait,
 * and an auto-advancing tab rail. Autoplay can be paused, pauses on
 * hover/focus, and is off for reduced motion.
 */
export function AthleteSpotlight({ athletes }: { athletes: SpotlightAthlete[] }) {
  const { t, locale } = useI18n();
  const reduce = useReducedMotion();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hover, setHover] = useState(false);
  const a = athletes[active];
  if (!a) return null;
  const playing = !paused && !hover && !reduce && athletes.length > 1;
  const photo = a.imageUrl ? { src: a.imageUrl, alt: `${a.firstName} ${a.lastName}` } : photoForGroup(a.discipline?.group);
  const next = () => setActive((i) => (i + 1) % athletes.length);

  return (
    <div onPointerEnter={() => setHover(true)} onPointerLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      <div id="spotlight-panel" role="tabpanel" aria-labelledby={`spotlight-tab-${active}`} className="relative grid items-center gap-8 lg:grid-cols-12 lg:gap-12">
        <div className="relative lg:col-span-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={a.slug}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.55, ease: EASE }}
            >
              <p className="text-eyebrow text-brand-300">
                {a.discipline?.name} · {t(keyOf("category", a.category))}
              </p>
              <h3 className="mt-3 text-display text-white">
                {a.firstName}
                <br />
                {a.lastName}
              </h3>
              {a.headline && <p className="mt-4 max-w-lg text-lg text-white/85">{a.headline}</p>}

              {a.latest && (
                <div className="mt-6 inline-block rounded-md border border-white/20 bg-white/10 p-4 backdrop-blur">
                  <p className="text-sm font-semibold text-white/85">
                    {t("home.athletes.latest")} · {a.latest.discipline}
                  </p>
                  <p className="mt-1 flex items-center gap-3 text-4xl text-mark text-white">
                    <span dir="ltr">{a.latest.mark ?? ordinal(a.latest.position, locale)}</span>
                    {a.latest.record && <RecordTag record={a.latest.record} />}
                  </p>
                  <p className="mt-1 text-[0.9375rem] text-white/80">
                    {a.latest.mark && a.latest.position ? `${ordinal(a.latest.position, locale)} · ` : ""}
                    {a.latest.competition} · {formatDate(a.latest.date, { month: "short", year: "numeric" }, locale)}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <ButtonLink href={`/athletes/${a.slug}`} variant="inverse" size="lg">
                  {t("common.fullProfile")}
                </ButtonLink>
              </div>
              {!a.imageUrl && <p className="mt-4 text-sm text-white/75">{t("home.athletes.placeholder")}</p>}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative lg:col-span-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-ink-900 ring-1 ring-white/15 lg:aspect-[5/4]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={a.slug}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.08 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: EASE }}
              >
                <Photo src={photo.src} alt={a.imageUrl ? photo.alt : ""} sizes="(min-width: 1024px) 45vw, 100vw" className={cn(!a.imageUrl && "opacity-70 grayscale")} />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 via-transparent to-transparent" />
          </div>
          <div className="absolute -bottom-3 -end-3 -z-10 size-2/3 rounded-md border-2 border-brand-600/60" aria-hidden />
        </div>
      </div>

      {/* Tab rail with autoplay progress */}
      <div className="mt-10 flex items-stretch gap-3">
        <div role="tablist" aria-label={t("home.athletes.tabs")} className="scrollbar-none grid min-w-0 flex-1 auto-cols-fr grid-flow-col gap-3 overflow-x-auto">
          {athletes.map((x, i) => (
            <button
              key={x.slug}
              role="tab"
              id={`spotlight-tab-${i}`}
              aria-selected={i === active}
              aria-controls="spotlight-panel"
              onClick={() => setActive(i)}
              className={cn(
                "relative min-w-[8.5rem] overflow-hidden rounded-sm border px-4 pb-3 pt-4 text-start transition-colors",
                i === active ? "border-white/40 bg-white/10 text-white" : "border-white/15 text-white/75 hover:border-white/40 hover:text-white",
              )}
            >
              <span className="block text-xs font-bold tabular opacity-70">{String(i + 1).padStart(2, "0")}</span>
              <span className="mt-1 block truncate font-semibold">
                {x.firstName} {x.lastName}
              </span>
              <span className="absolute inset-x-0 bottom-0 h-1 bg-white/10" aria-hidden />
              {i === active && (
                <span
                  key={`${active}-${playing}`}
                  className="absolute inset-x-0 bottom-0 h-1 origin-left bg-brand-500 rtl:origin-right"
                  style={playing ? { animation: `spotlight-progress ${INTERVAL}ms linear forwards` } : { transform: "scaleX(1)" }}
                  onAnimationEnd={next}
                  aria-hidden
                />
              )}
            </button>
          ))}
        </div>
        {!reduce && athletes.length > 1 && (
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            className="flex size-12 shrink-0 items-center justify-center self-center rounded-full border border-white/30 text-white hover:bg-white/10"
            aria-label={paused ? t("home.athletes.play") : t("home.athletes.pause")}
          >
            {paused ? <Play className="size-5" aria-hidden /> : <Pause className="size-5" aria-hidden />}
          </button>
        )}
      </div>
    </div>
  );
}

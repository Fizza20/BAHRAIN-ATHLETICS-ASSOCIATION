"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Counter, MarkCounter, Stagger, StaggerItem } from "@/components/ui/motion";
import { useI18n } from "@/lib/i18n/client";
import type { DictKey } from "@/lib/i18n/dict";

export type SeasonFigure = { value: string | number; label: DictKey; detail: DictKey; href?: string; kind?: "mark" | "count" };

/**
 * Season in numbers, on a red band. Every figure is computed from sourced results in the
 * database or quoted from a BAA report. Nothing is a made-up total.
 */
export function SeasonNumbers({ figures }: { figures: SeasonFigure[] }) {
  const { t } = useI18n();
  return (
    <section aria-labelledby="season-title" className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-700 to-brand-900 py-14 text-white md:py-20">
      <div className="container-x relative">
        <div className="max-w-2xl">
          <p className="text-eyebrow mb-3 text-white/85">{t("home.season.eyebrow")}</p>
          <h2 id="season-title" className="text-h2">
            {t("home.season.title")}
          </h2>
          <p className="mt-3 text-lg text-white/85">{t("home.season.intro")}</p>
        </div>
        <Stagger as="dl" className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {figures.map((f) => (
            <StaggerItem key={f.label}>
              <div className="group relative flex h-full flex-col rounded-md border border-white/20 bg-white/10 p-6 backdrop-blur transition-colors hover:bg-white/15">
                <dt className="order-2 mt-3 font-semibold">
                  {f.href ? (
                    <Link href={f.href} className="after:absolute after:inset-0 after:content-['']">
                      {t(f.label)}
                    </Link>
                  ) : (
                    t(f.label)
                  )}
                </dt>
                <dd className="order-1 text-4xl leading-none text-mark md:text-5xl" dir="ltr">
                  {f.kind === "mark" ? <MarkCounter mark={String(f.value)} /> : <Counter value={Number(f.value)} />}
                </dd>
                <dd className="order-3 mt-1 text-[0.9375rem] text-white/85">{t(f.detail)}</dd>
                {f.href && <ArrowUpRight className="absolute end-5 top-5 size-5 text-white/70 transition-transform group-hover:-translate-y-0.5" aria-hidden />}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}

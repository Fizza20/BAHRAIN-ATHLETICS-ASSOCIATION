"use client";

import { cn } from "@/lib/utils";
import type { LiveStatus } from "@/lib/status";
import { useI18n } from "@/lib/i18n/client";
import { keyOf } from "@/lib/i18n/dict";

const tones = {
  neutral: "bg-ink-100 text-ink-700",
  dark: "bg-ink-900 text-white",
  brand: "bg-brand-600 text-white",
  outline: "border border-ink-300 bg-white text-ink-700",
  inverse: "bg-white/15 text-white ring-1 ring-inset ring-white/30",
  success: "bg-success/10 text-success",
  warning: "bg-warning/12 text-warning",
  info: "bg-info/10 text-info",
  gold: "bg-gold/15 text-[#7a5c12]",
} as const;

/** Short status label. Uppercase is reserved for labels like this one. */
export function Badge({
  tone = "neutral",
  className,
  children,
}: {
  tone?: keyof typeof tones;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-bold uppercase leading-none tracking-wide", tones[tone], className)}>
      {children}
    </span>
  );
}

/** Marks placeholder content so nobody mistakes it for an official BAA fact. */
export function DemoBadge({ className, inverse }: { className?: string; inverse?: boolean }) {
  const { t } = useI18n();
  return (
    <span
      title={t("badge.demoTitle")}
      className={cn(
        "inline-flex h-6 items-center rounded-full border border-dashed px-2 text-xs font-bold uppercase leading-none tracking-wide",
        inverse ? "border-white/60 text-white" : "border-ink-400 text-ink-600",
        className,
      )}
    >
      {t("badge.demo")}
    </span>
  );
}

export function StatusBadge({ status, inverse, className }: { status: LiveStatus; inverse?: boolean; className?: string }) {
  const { t } = useI18n();
  const map: Record<LiveStatus, keyof typeof tones> = {
    upcoming: inverse ? "inverse" : "neutral",
    ongoing: "brand",
    completed: inverse ? "inverse" : "outline",
    postponed: "warning",
    cancelled: "neutral",
  };
  return (
    <Badge tone={map[status]} className={className}>
      {status === "ongoing" && <span className="size-1.5 animate-live rounded-full bg-white" aria-hidden />}
      {t(keyOf("status", status))}
    </Badge>
  );
}

const medalColor = { gold: "bg-gold", silver: "bg-silver", bronze: "bg-bronze" } as const;

export function MedalDot({ medal, className, label = true }: { medal: "gold" | "silver" | "bronze"; className?: string; label?: boolean }) {
  const { t } = useI18n();
  const name = t(keyOf("medal", medal));
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm font-semibold", className)}>
      <span className={cn("size-3 rounded-full ring-2 ring-white", medalColor[medal])} aria-hidden />
      {label ? name : <span className="sr-only">{name}</span>}
    </span>
  );
}

export function RecordTag({ record, className }: { record: string; className?: string }) {
  const { t } = useI18n();
  const known = ["WR", "AR", "NR", "WL", "CR", "MR"].includes(record);
  return (
    <abbr
      title={known ? t(keyOf("rec", record)) : record}
      className={cn("inline-flex h-6 items-center rounded-full bg-gold px-2 text-xs font-bold uppercase leading-none tracking-wide text-ink-950 no-underline", className)}
    >
      {record}
    </abbr>
  );
}

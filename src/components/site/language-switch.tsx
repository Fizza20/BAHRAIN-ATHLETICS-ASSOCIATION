"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { setLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

/** Switches between English and Arabic. The label is the language you will switch TO. */
export function LanguageSwitch({ className }: { className?: string }) {
  const { t, locale } = useI18n();
  const [pending, start] = useTransition();
  const next = locale === "ar" ? "en" : "ar";
  return (
    <button
      type="button"
      onClick={() => start(() => setLocale(next))}
      disabled={pending}
      lang={next}
      aria-label={t("lang.switchLabel")}
      className={cn(
        "flex h-11 items-center gap-2 rounded-xs border border-ink-200 px-2.5 text-[0.9375rem] font-semibold text-ink-800 transition-colors hover:border-ink-900 hover:bg-pearl disabled:opacity-60 sm:px-3",
        className,
      )}
    >
      <Languages className="size-5" aria-hidden />
      <span className="hidden min-[420px]:inline lg:hidden xl:inline">{t("lang.switchTo")}</span>
    </button>
  );
}

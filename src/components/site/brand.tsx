"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

export function BrandLockup({ className, inverse = false, compact }: { className?: string; inverse?: boolean; compact?: boolean }) {
  const { t, locale } = useI18n();
  return (
    <Link href="/" className={cn("group flex items-center gap-3", className)} aria-label={t("brand.aria")}>
      <span className="relative block size-11 shrink-0 overflow-hidden rounded-full bg-white p-0.5 ring-1 ring-line">
        <Image src="/brand/baa-crest.png" alt="" width={96} height={96} className="size-full object-contain" priority />
      </span>
      {!compact && (
        <span className="hidden flex-col whitespace-nowrap leading-tight min-[360px]:flex">
          <span className={cn("text-[0.9375rem] font-bold tracking-tight sm:text-base", inverse ? "text-white" : "text-ink-950")}>{t("brand.name")}</span>
          {locale === "ar" ? (
            <span className={cn("hidden text-sm font-semibold xl:block", inverse ? "text-white/75" : "text-ink-500")} lang="en" dir="ltr">
              Bahrain Athletics Association
            </span>
          ) : (
            <span className={cn("hidden font-arabic text-sm font-semibold xl:block", inverse ? "text-white/75" : "text-ink-500")} lang="ar" dir="rtl">
              الاتحاد البحريني لألعاب القوى
            </span>
          )}
        </span>
      )}
    </Link>
  );
}

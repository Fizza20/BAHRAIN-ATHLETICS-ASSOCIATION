"use client";

import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/client";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return (
    <section className="section-y flex min-h-[60svh] items-center bg-bone">
      <div className="container-x">
        <p className="text-eyebrow text-brand-700">{t("error.eyebrow")}</p>
        <h1 className="text-h1 mt-4 text-ink-950">{t("error.title")}</h1>
        <p className="mt-4 max-w-lg text-lg text-ink-600">{t("error.body")}</p>
        <Button onClick={reset} className="mt-8" arrow="right">{t("error.retry")}</Button>
      </div>
    </section>
  );
}

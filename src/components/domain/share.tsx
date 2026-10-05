"use client";

import { useState } from "react";
import { Check, Link2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";

export function ShareBar({ url, title }: { url: string; title: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);
  const enc = encodeURIComponent;
  const links = [
    { label: "X", href: `https://x.com/intent/post?url=${enc(url)}&text=${enc(title)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { label: "WhatsApp", href: `https://wa.me/?text=${enc(`${title} ${url}`)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
  ];
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-eyebrow me-2 text-ink-600">{t("share.label")}</span>
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center rounded-xs border border-ink-300 bg-white px-4 text-sm font-semibold text-ink-900 transition-colors hover:border-ink-900"
        >
          {l.label}
          <span className="sr-only"> {t("common.opensNewTab")}</span>
        </a>
      ))}
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch {
            /* clipboard blocked */
          }
        }}
        className="inline-flex h-11 items-center gap-1.5 rounded-xs bg-brand-600 px-4 text-sm font-semibold text-white hover:bg-brand-700"
      >
        {copied ? <Check className="size-4" aria-hidden /> : <Link2 className="size-4" aria-hidden />}
        <span aria-live="polite">{copied ? t("share.copied") : t("share.copy")}</span>
      </button>
    </div>
  );
}

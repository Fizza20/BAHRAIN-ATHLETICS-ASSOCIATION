"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Photo } from "@/components/ui/photo";
import { LaneArcs } from "@/components/ui/lane-arcs";
import { WordReveal } from "@/components/ui/motion";
import { cn, SITE_URL } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, inverse = false }: { items: Crumb[]; inverse?: boolean }) {
  const { t } = useI18n();
  const all: Crumb[] = [{ label: t("crumb.home"), href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: c.href ? `${SITE_URL}${c.href}` : undefined })),
  };
  return (
    <nav aria-label={t("crumb.label")}>
      <ol className={cn("flex flex-wrap items-center gap-x-1 text-sm font-medium", inverse ? "text-white/80" : "text-ink-600")}>
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="size-4 opacity-60" aria-hidden />}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className={cn("inline-flex min-h-8 items-center underline-offset-4 hover:underline", inverse ? "hover:text-white" : "hover:text-brand-700")}>
                {c.label}
              </Link>
            ) : (
              <span aria-current="page" className={inverse ? "text-white" : "text-ink-900"}>
                {c.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}

/**
 * Standard page header: light surface, breadcrumb, label, title, intro.
 * The end-hand column shows `aside` if given, otherwise the optional `image`.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  crumbs,
  image,
  children,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  crumbs: Crumb[];
  image?: string | null;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  /** Kept for existing callers; every page header now uses the same scale. */
  size?: "md" | "lg";
}) {
  const right = aside ?? (image ? <HeroImage src={image} /> : null);
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-pearl">
      <div className="absolute -top-24 end-0 -z-10 size-[420px] rounded-full bg-brand-600/[0.07] blur-3xl" aria-hidden />
      <LaneArcs className="absolute inset-y-0 end-0 -z-10 h-full w-[60%] text-brand-600/[0.13]" />
      <div className="container-x py-10 md:py-14 lg:py-16">
        <Breadcrumbs items={crumbs} />
        <div className={cn("mt-6 grid gap-8 md:mt-8", right && "lg:grid-cols-12 lg:items-center")}>
          <div className={right ? "lg:col-span-7" : "max-w-3xl"}>
            <p className="text-eyebrow mb-3 text-brand-700">{eyebrow}</p>
            <h1 className="text-h1 text-ink-950">{typeof title === "string" ? <WordReveal text={title} /> : title}</h1>
            {intro && <p className="mt-4 max-w-2xl text-lg text-ink-600">{intro}</p>}
          </div>
          {right && <div className="lg:col-span-5">{right}</div>}
        </div>
        {children}
      </div>
    </section>
  );
}

function HeroImage({ src }: { src: string }) {
  return (
    <div className="relative hidden aspect-[16/9] overflow-hidden rounded-md bg-ink-100 lg:block">
      <Photo src={src} alt="" priority sizes="(min-width: 1024px) 40vw, 0px" />
    </div>
  );
}

/** Two or three headline figures for the end-hand side of a page header. */
export function HeroStats({ items }: { items: { label: string; value: React.ReactNode }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-4">
      {items.map((i) => (
        <div key={i.label} className="card p-5">
          <dt className="text-sm font-medium text-ink-600">{i.label}</dt>
          <dd className="mt-1 text-3xl text-mark text-ink-950">{i.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-ink-300 bg-pearl px-6 py-16 text-center">
      <h2 className="text-h3">{title}</h2>
      {body && <p className="mt-2 max-w-md text-ink-600">{body}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

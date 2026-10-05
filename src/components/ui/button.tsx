"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

/**
 * primary    the one main action in a section (red)
 * secondary  every other action (outlined)
 * ghost      low-emphasis action
 * inverse / outline-inverse  only on red or dark surfaces
 */
type Variant = "primary" | "secondary" | "ghost" | "inverse" | "outline-inverse" | "danger" | "link";
type Size = "sm" | "md" | "lg";

const base =
  "group/btn relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800",
  secondary: "border border-ink-300 bg-white text-ink-900 hover:border-ink-900 hover:bg-ink-50",
  ghost: "text-ink-900 hover:bg-pearl",
  inverse: "bg-white text-ink-950 hover:bg-pearl",
  "outline-inverse": "border border-white/60 text-white hover:border-white hover:bg-white/10",
  danger: "bg-brand-700 text-white hover:bg-brand-800",
  link: "px-0! py-0! h-auto! min-h-0! text-brand-700 underline underline-offset-4 hover:text-brand-800",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm rounded-xs",
  md: "h-11 px-5 text-[0.9375rem] rounded-xs",
  lg: "h-12 px-6 text-base rounded-xs",
};

type Common = { variant?: Variant; size?: Size; className?: string; arrow?: "right" | "up" | false; children: React.ReactNode };

export function Button({
  variant = "primary",
  size = "md",
  className,
  arrow = false,
  children,
  ...props
}: Common & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
      <Arrow kind={arrow} />
    </button>
  );
}

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  arrow = "right",
  children,
  external,
  ...rest
}: Common & { href: string; external?: boolean } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  const { t } = useI18n();
  const cls = cn(base, variants[variant], sizes[size], className);
  if (external) {
    return (
      <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
        {children}
        <Arrow kind="up" />
        <span className="sr-only">{t("common.opensNewTab")}</span>
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
      <Arrow kind={arrow} />
    </Link>
  );
}

function Arrow({ kind }: { kind: Common["arrow"] }) {
  if (!kind) return null;
  const Icon = kind === "up" ? ArrowUpRight : ArrowRight;
  return <Icon aria-hidden className="size-4 shrink-0 transition-transform duration-200 group-hover/btn:translate-x-0.5" strokeWidth={2.25} />;
}

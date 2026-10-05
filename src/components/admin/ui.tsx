import Link from "next/link";
import { ExternalLink, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

/* ---------- typography ---------- */

export const headingCls = "font-extrabold uppercase leading-[0.95] tracking-[-0.01em] [font-variation-settings:'wdth'_72]";
export const labelCls = "text-[0.6875rem] font-semibold uppercase tracking-[0.14em] [font-variation-settings:'wdth'_110]";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("mb-6 flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className={cn(labelCls, "mb-2.5 flex items-center gap-2 text-ink-500")}>
            <span className="h-3 w-0.5 bg-brand-600" aria-hidden />
            {eyebrow}
          </p>
        )}
        <h1 className={cn(headingCls, "text-[1.875rem] text-ink-950 md:text-[2.25rem]")}>{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-sm text-ink-600">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/* ---------- surfaces ---------- */

export function Panel({
  title,
  action,
  children,
  className,
  bodyClassName,
  id,
}: {
  title?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("min-w-0 rounded-sm border border-line bg-white", className)} aria-labelledby={id && title ? `${id}-title` : undefined}>
      {title && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3.5">
          <h2 id={id ? `${id}-title` : undefined} className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-ink-950 [font-variation-settings:'wdth'_85]">
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function PanelLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-xs font-semibold text-ink-500 underline-offset-4 hover:text-brand-600 hover:underline">
      {children}
    </Link>
  );
}

/* ---------- tables ---------- */

export function TableWrap({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("relative overflow-x-auto rounded-sm border border-line bg-white", className)}>
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">{children}</table>
    </div>
  );
}

export const thCls = cn(labelCls, "h-10 whitespace-nowrap bg-pearl/70 px-4 text-ink-500 font-semibold border-b border-line");
export const tdCls = "px-4 py-3 align-middle";
export const trCls = "border-b border-line last:border-b-0 transition-colors hover:bg-pearl/40";

export function Th({ children, className, ...rest }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th scope="col" className={cn(thCls, className)} {...rest}>
      {children}
    </th>
  );
}

export function Td({ children, className, ...rest }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={cn(tdCls, className)} {...rest}>
      {children}
    </td>
  );
}

/* ---------- small pieces ---------- */

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-sm border border-dashed border-ink-200 bg-white px-6 py-14 text-center">
      <svg className="pointer-events-none absolute -bottom-24 left-1/2 h-48 w-[36rem] -translate-x-1/2 stroke-ink-100" viewBox="0 0 600 200" fill="none" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <ellipse key={i} cx="300" cy="200" rx={120 + i * 40} ry={60 + i * 26} strokeWidth="1" />
        ))}
      </svg>
      <div className="relative">
        {icon && <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-sm bg-ink-950 text-white">{icon}</div>}
        <p className={cn(headingCls, "text-xl text-ink-950")}>{title}</p>
        {description && <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">{description}</p>}
        {action && <div className="mt-5 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}

export function SourceLink({ href, className }: { href?: string | null; className?: string }) {
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Source: ${href}`}
      className={cn("inline-flex size-6 items-center justify-center rounded-xs text-ink-400 hover:bg-ink-950/5 hover:text-info", className)}
    >
      <Link2 className="size-3.5" aria-hidden />
      <span className="sr-only">Source (opens in a new tab)</span>
    </a>
  );
}

export function ViewOnSite({ href, label = "View on site" }: { href: string; label?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex size-8 items-center justify-center rounded-xs text-ink-500 hover:bg-ink-950/5 hover:text-ink-950"
      title={label}
    >
      <ExternalLink className="size-4" aria-hidden />
      <span className="sr-only">{label} (opens in a new tab)</span>
    </a>
  );
}

export function EditLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="inline-flex h-8 items-center rounded-xs px-2.5 text-xs font-semibold text-ink-700 hover:bg-ink-950/5 hover:text-ink-950">
      Edit<span className="sr-only"> {label}</span>
    </Link>
  );
}

export function Dot({ tone }: { tone: "success" | "warning" | "neutral" | "brand" | "info" }) {
  const c = { success: "bg-success", warning: "bg-warning", neutral: "bg-ink-300", brand: "bg-brand-600", info: "bg-info" }[tone];
  return <span className={cn("inline-block size-1.5 shrink-0 rounded-full", c)} aria-hidden />;
}

export function ContentStatus({ status }: { status: "draft" | "review" | "published" }) {
  const map = {
    draft: { tone: "neutral" as const, label: "Draft", cls: "text-ink-600 bg-ink-950/[0.05]" },
    review: { tone: "warning" as const, label: "In review", cls: "text-warning bg-warning/10" },
    published: { tone: "success" as const, label: "Published", cls: "text-success bg-success/10" },
  }[status];
  return (
    <span className={cn("inline-flex h-6 items-center gap-1.5 rounded-xs px-2 text-[0.625rem] font-semibold uppercase tracking-[0.12em]", map.cls)}>
      <Dot tone={map.tone} />
      {map.label}
    </span>
  );
}

export function RowActions({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-0.5">{children}</div>;
}

export function Kbd({ children }: { children: React.ReactNode }) {
  return <kbd className="rounded-xs border border-white/15 px-1.5 py-0.5 font-sans text-[0.625rem] text-white/50">{children}</kbd>;
}

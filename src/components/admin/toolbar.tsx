"use client";

import Form from "next/form";
import Link from "next/link";
import { useRef } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type FilterDef = { name: string; label: string; options: { value: string; label: string }[]; value?: string };

/**
 * GET-form filter bar. next/form turns submission into a client-side navigation, so filters
 * live in the URL (shareable, back-button friendly) and the server does the querying.
 */
export function Toolbar({
  base,
  q,
  placeholder = "Search…",
  filters = [],
  keep = {},
  children,
  searchable = true,
}: {
  searchable?: boolean;
  base: string;
  q?: string;
  placeholder?: string;
  filters?: FilterDef[];
  /** Params preserved across filter changes (e.g. sort, dir, tab). */
  keep?: Record<string, string | undefined>;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const active = !!q || filters.some((f) => f.value);
  return (
    <Form ref={ref} action={base} scroll={false} className="mb-4 flex flex-col gap-2 lg:flex-row lg:items-center" role="search" aria-label="Filter list">
      {Object.entries(keep).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      {searchable && (
      <label className="relative block flex-1 lg:max-w-sm">
        <span className="sr-only">Search</span>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder={placeholder}
          className="h-10 w-full rounded-xs border border-line bg-white pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-400 hover:border-ink-300 focus:border-ink-950 focus:outline-none"
        />
      </label>
      )}
      <div className="flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <label key={f.name} className="relative min-w-0 max-w-full">
            <span className="sr-only">{f.label}</span>
            <select
              name={f.name}
              defaultValue={f.value ?? ""}
              onChange={() => ref.current?.requestSubmit()}
              className={cn(
                "h-10 max-w-full appearance-none truncate rounded-xs border bg-white pl-3 pr-8 text-sm sm:max-w-[16rem] hover:border-ink-300 focus:border-ink-950 focus:outline-none",
                f.value ? "border-ink-950 font-semibold text-ink-950" : "border-line text-ink-600",
              )}
            >
              <option value="">{f.label}: All</option>
              {f.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <svg className="pointer-events-none absolute right-2.5 top-1/2 size-3 -translate-y-1/2 text-ink-400" viewBox="0 0 12 12" aria-hidden>
              <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </label>
        ))}
        <button type="submit" className="h-10 rounded-xs bg-ink-950 px-4 text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-white hover:bg-ink-800">
          Apply
        </button>
        {active && (
          <Link href={base} className="inline-flex h-10 items-center gap-1 rounded-xs px-2.5 text-xs font-semibold text-ink-500 hover:bg-ink-950/5 hover:text-ink-950">
            <X className="size-3.5" aria-hidden /> Clear
          </Link>
        )}
        {children}
      </div>
    </Form>
  );
}

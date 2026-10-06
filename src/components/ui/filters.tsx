"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState, useTransition } from "react";
import { Search, X, ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

/**
 * URL-driven filters: every filter state is a shareable, crawlable URL and the
 * list is rendered on the server. A transition dims results while they load.
 */
const PendingCtx = createContext(false);

export function FilterProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function useSetParam() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const set = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    if (!("page" in updates)) next.delete("page");
    const qs = next.toString();
    start(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  return { set, pending, params };
}

export function FilterBar({
  searchPlaceholder = "Search",
  filters,
  sorts,
  children,
  count,
  noun = "results",
}: {
  searchPlaceholder?: string;
  filters: { key: string; label: string; options: { value: string; label: string }[] }[];
  sorts?: { value: string; label: string }[];
  children: React.ReactNode;
  count?: number;
  noun?: string;
}) {
  const { t } = useI18n();
  const { set, pending, params } = useSetParam();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [open, setOpen] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => set({ q: q.trim() || null }), 280);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const active = filters.filter((f) => params.get(f.key));
  const field = cn(
    "h-12 w-full appearance-none rounded-xs border bg-white ps-4 pe-10 text-[0.9375rem] font-medium text-ink-900 transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20",
    "border-ink-200 hover:border-ink-400",
  );

  return (
    <PendingCtx.Provider value={pending}>
      <div className="sticky top-16 sm:top-[72px] z-30 -mx-4 border-b border-line bg-white/95 px-4 py-4 backdrop-blur md:mx-0 md:px-0">
        <div className="flex gap-3">
          <label className="relative flex-1">
            <span className="sr-only">{searchPlaceholder}</span>
            <Search className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-ink-500" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={searchPlaceholder}
              className="h-12 w-full rounded-xs border border-ink-200 bg-white ps-11 pe-4 text-base text-ink-900 placeholder:text-ink-500 hover:border-ink-400 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/20"
            />
          </label>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-12 items-center gap-2 rounded-xs border border-ink-300 bg-white px-4 text-[0.9375rem] font-semibold text-ink-900 hover:border-ink-900 lg:hidden"
            aria-expanded={open}
            aria-controls="filter-panel"
          >
            <SlidersHorizontal className="size-4" aria-hidden />
            {t("filter.filters")}
            {active.length > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-brand-600 text-xs text-white">{active.length}</span>}
          </button>
        </div>

        <div id="filter-panel" className={cn("mt-3 grid-cols-2 gap-3 sm:grid-cols-3 lg:grid lg:grid-cols-[repeat(auto-fit,minmax(150px,1fr))]", open ? "grid" : "hidden")}>
          {filters.map((f) => (
            <label key={f.key} className="relative block">
              <span className="sr-only">{f.label}</span>
              <select value={params.get(f.key) ?? ""} onChange={(e) => set({ [f.key]: e.target.value || null })} className={cn(field, params.get(f.key) && "border-brand-600")}>
                <option value="">{f.label}: {t("filter.all")}</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" aria-hidden />
            </label>
          ))}
          {sorts && (
            <label className="relative block">
              <span className="sr-only">{t("filter.sortBy")}</span>
              <select value={params.get("sort") ?? ""} onChange={(e) => set({ sort: e.target.value || null })} className={field}>
                {sorts.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t("filter.sort")}: {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-500" aria-hidden />
            </label>
          )}
        </div>

        {(active.length > 0 || params.get("q")) && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {params.get("q") && <Chip remove={t("filter.remove", { label: `“${params.get("q")}”` })} label={`“${params.get("q")}”`} onClear={() => { setQ(""); set({ q: null }); }} />}
            {active.map((f) => (
              <Chip key={f.key} remove={t("filter.remove", { label: `${f.label}: ${f.options.find((o) => o.value === params.get(f.key))?.label ?? params.get(f.key)}` })} label={`${f.label}: ${f.options.find((o) => o.value === params.get(f.key))?.label ?? params.get(f.key)}`} onClear={() => set({ [f.key]: null })} />
            ))}
            <button
              type="button"
              onClick={() => {
                setQ("");
                set(Object.fromEntries([["q", null], ...filters.map((f) => [f.key, null])]));
              }}
              className="inline-flex h-10 items-center px-2 text-sm font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-800"
            >
              {t("filter.clearAll")}
            </button>
          </div>
        )}
      </div>

      {count !== undefined && (
        <p className="mt-6 text-[0.9375rem] text-ink-600" aria-live="polite">
          <strong className="text-ink-950">{count}</strong> {noun}
          {pending && ` · ${t("filter.updating")}`}
        </p>
      )}
      <div className={cn("transition-opacity duration-200", pending && "pointer-events-none opacity-40")} aria-busy={pending}>
        {children}
      </div>
    </PendingCtx.Provider>
  );
}

export function usePending() {
  return useContext(PendingCtx);
}

function Chip({ label, remove, onClear }: { label: string; remove: string; onClear: () => void }) {
  return (
    <span className="inline-flex h-9 items-center gap-1 rounded-full bg-brand-50 ps-3.5 pe-1 text-sm font-medium text-brand-800 ring-1 ring-inset ring-brand-200">
      {label}
      <button type="button" onClick={onClear} className="flex size-7 items-center justify-center rounded-full hover:bg-brand-100" aria-label={remove}>
        <X className="size-4" aria-hidden />
      </button>
    </span>
  );
}

/** Server-friendly pagination that preserves current filters. */
export function Pagination({ page, pages }: { page: number; pages: number }) {
  const { t } = useI18n();
  const { set, params } = useSetParam();
  void params;
  if (pages <= 1) return null;
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label={t("filter.pagination")} className="mt-8 flex items-center justify-between gap-4 border-t border-line pt-6">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => set({ page: String(page - 1) })}
        className="inline-flex h-11 items-center rounded-xs border border-ink-300 bg-white px-4 text-[0.9375rem] font-semibold text-ink-900 hover:border-ink-900 disabled:pointer-events-none disabled:opacity-40"
      >
        {t("filter.prev")}
      </button>
      <ol className="flex items-center gap-1">
        {nums.map((n, i) => (
          <li key={n} className="flex items-center gap-1">
            {i > 0 && nums[i - 1] !== n - 1 && <span className="px-1 text-ink-600">…</span>}
            <button
              type="button"
              onClick={() => set({ page: String(n) })}
              aria-current={n === page ? "page" : undefined}
              className={cn("size-11 rounded-xs text-sm font-semibold tabular", n === page ? "bg-brand-600 text-white" : "text-ink-700 hover:bg-pearl")}
            >
              {n}
            </button>
          </li>
        ))}
      </ol>
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => set({ page: String(page + 1) })}
        className="inline-flex h-11 items-center rounded-xs border border-ink-300 bg-white px-4 text-[0.9375rem] font-semibold text-ink-900 hover:border-ink-900 disabled:pointer-events-none disabled:opacity-40"
      >
        {t("filter.next")}
      </button>
    </nav>
  );
}

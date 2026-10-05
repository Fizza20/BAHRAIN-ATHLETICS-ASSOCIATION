import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { thCls } from "./ui";

export type SP = Record<string, string | string[] | undefined>;
export type Params = Record<string, string>;

/** Normalises Next's searchParams into a flat string map. */
export function flat(sp: SP): Params {
  const out: Params = {};
  for (const [k, v] of Object.entries(sp)) {
    const val = Array.isArray(v) ? v[0] : v;
    if (val !== undefined && val !== "") out[k] = val;
  }
  return out;
}

export function listParams<S extends string>(sp: SP, opts: { sorts: readonly S[]; sort: S; dir?: "asc" | "desc"; pageSize?: number }) {
  const p = flat(sp);
  const sort = (opts.sorts as readonly string[]).includes(p.sort ?? "") ? (p.sort as S) : opts.sort;
  const dir: "asc" | "desc" = p.dir === "asc" || p.dir === "desc" ? p.dir : (opts.dir ?? "asc");
  const page = Math.max(1, Math.min(10_000, Number.parseInt(p.page ?? "1", 10) || 1));
  const pageSize = opts.pageSize ?? 15;
  return { p, q: (p.q ?? "").slice(0, 100), sort, dir, page, pageSize, offset: (page - 1) * pageSize };
}

export function hrefWith(base: string, p: Params, overrides: Record<string, string | null | undefined>) {
  const next = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...p, ...overrides })) {
    if (v !== null && v !== undefined && v !== "" && k !== "toast") next.set(k, v);
  }
  const qs = next.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Column header that toggles server-side sorting via the URL. */
export function SortTh({
  base,
  p,
  col,
  sort,
  dir,
  children,
  className,
  align = "left",
}: {
  base: string;
  p: Params;
  col: string;
  sort: string;
  dir: "asc" | "desc";
  children: React.ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  const active = sort === col;
  const nextDir = active && dir === "asc" ? "desc" : "asc";
  const Icon = !active ? ChevronsUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th scope="col" aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : "none"} className={cn(thCls, align === "right" && "text-right", className)}>
      <Link
        href={hrefWith(base, p, { sort: col, dir: nextDir, page: null })}
        className={cn("inline-flex items-center gap-1 hover:text-ink-950", active && "text-ink-950", align === "right" && "flex-row-reverse")}
        scroll={false}
      >
        {children}
        <Icon className={cn("size-3", active ? "text-brand-600" : "text-ink-300")} aria-hidden />
        <span className="sr-only">{active ? `, sorted ${dir === "asc" ? "ascending" : "descending"}` : ", sortable"}</span>
      </Link>
    </th>
  );
}

export function Pagination({ base, p, page, pageSize, total }: { base: string; p: Params; page: number; pageSize: number; total: number }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);
  const nums: (number | "gap")[] = [];
  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) nums.push(i);
    else if (nums[nums.length - 1] !== "gap") nums.push("gap");
  }
  const btn = "inline-flex h-8 min-w-8 items-center justify-center rounded-xs px-2 text-xs font-semibold tabular";
  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-col items-center justify-between gap-3 text-xs text-ink-500 sm:flex-row">
      <p className="tabular">
        Showing <span className="font-semibold text-ink-900">{from}–{to}</span> of <span className="font-semibold text-ink-900">{total}</span>
      </p>
      {pages > 1 && (
        <ul className="flex items-center gap-1">
          <li>
            {page > 1 ? (
              <Link className={cn(btn, "hover:bg-ink-950/5")} href={hrefWith(base, p, { page: String(page - 1) })} aria-label="Previous page">
                <ChevronLeft className="size-4" aria-hidden />
              </Link>
            ) : (
              <span className={cn(btn, "text-ink-300")} aria-hidden>
                <ChevronLeft className="size-4" />
              </span>
            )}
          </li>
          {nums.map((n, i) =>
            n === "gap" ? (
              <li key={`g${i}`} className="px-1 text-ink-300" aria-hidden>
                …
              </li>
            ) : (
              <li key={n}>
                <Link
                  href={hrefWith(base, p, { page: n === 1 ? null : String(n) })}
                  aria-current={n === page ? "page" : undefined}
                  className={cn(btn, n === page ? "bg-ink-950 text-white" : "text-ink-700 hover:bg-ink-950/5")}
                >
                  {n}
                </Link>
              </li>
            ),
          )}
          <li>
            {page < pages ? (
              <Link className={cn(btn, "hover:bg-ink-950/5")} href={hrefWith(base, p, { page: String(page + 1) })} aria-label="Next page">
                <ChevronRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <span className={cn(btn, "text-ink-300")} aria-hidden>
                <ChevronRight className="size-4" />
              </span>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}

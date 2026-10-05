import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { adminSearch } from "@/lib/admin-queries";
import { can, type Resource } from "@/lib/permissions";
import { formatDate } from "@/lib/utils";
import { DemoBadge } from "@/components/ui/badge";
import { ContentStatus, EmptyState, PageHeader, Panel } from "@/components/admin/ui";
import { inputCls } from "@/components/admin/styles";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: PageProps<"/admin/search">) {
  const user = await requireUser();
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);
  const r = q.length >= 2 ? await adminSearch(q, user.role) : null;
  const total = r ? r.athletes.length + r.news.length + r.competitions.length + r.events.length : 0;

  const href = (res: Resource, id: number) => (can(user.role, res, "write") ? `/admin/${res}/${id}` : `/admin/${res}?q=${encodeURIComponent(q)}`);
  const row = "flex items-center justify-between gap-3 border-t border-line px-5 py-3 first:border-t-0 hover:bg-pearl/40";
  return (
    <div>
      <PageHeader eyebrow="Search" title={q ? <>Results for “{q}”</> : "Search"} description="Athletes, news, competitions and events you have access to." />
      <form action="/admin/search" className="relative mb-6 max-w-xl" role="search">
        <label htmlFor="q" className="sr-only">
          Search
        </label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
        <input id="q" name="q" type="search" defaultValue={q} autoFocus placeholder="Type at least two characters…" className={`${inputCls} h-12 pl-10`} />
      </form>

      {!r ? (
        <EmptyState title="Find anything" description="Search across the federation’s data by name, title or city." />
      ) : total === 0 ? (
        <EmptyState title="No matches" description={`Nothing matched “${q}”. Try a surname, a city or part of a headline.`} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {r.athletes.length > 0 && (
            <Panel title={`Athletes · ${r.athletes.length}`}>
              <ul>
                {r.athletes.map((a) => (
                  <li key={a.id} className={row}>
                    <Link href={href("athletes", a.id)} className="font-semibold text-ink-950 hover:text-brand-600">
                      {a.firstName} {a.lastName}
                    </Link>
                    <span className="flex items-center gap-2 text-xs text-ink-500">
                      {a.club}
                      {a.isDemo && <DemoBadge />}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
          {r.news.length > 0 && (
            <Panel title={`News · ${r.news.length}`}>
              <ul>
                {r.news.map((n) => (
                  <li key={n.id} className={row}>
                    <Link href={href("news", n.id)} className="min-w-0 truncate font-semibold text-ink-950 hover:text-brand-600">
                      {n.title}
                    </Link>
                    <span className="flex shrink-0 items-center gap-2">
                      <ContentStatus status={n.status} />
                      {n.isDemo && <DemoBadge />}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
          {r.competitions.length > 0 && (
            <Panel title={`Competitions · ${r.competitions.length}`}>
              <ul>
                {r.competitions.map((c) => (
                  <li key={c.id} className={row}>
                    <Link href={href("competitions", c.id)} className="min-w-0 truncate font-semibold text-ink-950 hover:text-brand-600">
                      {c.name}
                    </Link>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-ink-500 tabular">
                      {c.city} · {formatDate(c.startDate)}
                      {c.isDemo && <DemoBadge />}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
          {r.events.length > 0 && (
            <Panel title={`Events · ${r.events.length}`}>
              <ul>
                {r.events.map((e) => (
                  <li key={e.id} className={row}>
                    <Link href={href("events", e.id)} className="min-w-0 truncate font-semibold text-ink-950 hover:text-brand-600">
                      {e.title}
                    </Link>
                    <span className="flex shrink-0 items-center gap-2 text-xs text-ink-500 tabular">
                      {formatDate(e.startAt)}
                      {e.isDemo && <DemoBadge />}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </div>
  );
}

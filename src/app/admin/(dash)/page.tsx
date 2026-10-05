import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, ShieldAlert } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can, ROLE_LABEL, ROLE_SUMMARY, RESOURCES, type Resource } from "@/lib/permissions";
import { getOverview } from "@/lib/admin-queries";
import { cn, dateParts, formatDateRange, ordinal } from "@/lib/utils";
import { effectiveStatus } from "@/lib/status";
import { DemoBadge, MedalDot, RecordTag, StatusBadge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { ResultsChart } from "@/components/admin/chart";
import { actionDot, timeAgo } from "@/components/admin/format";
import { headingCls, labelCls, Panel, PanelLink } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Overview" };

function greeting() {
  const h = Number(new Intl.DateTimeFormat("en-GB", { hour: "numeric", hour12: false, timeZone: "Asia/Bahrain" }).format(new Date()));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export default async function OverviewPage({ searchParams }: PageProps<"/admin">) {
  const user = await requireUser();
  const sp = await searchParams;
  const denied = typeof sp.denied === "string" && (RESOURCES as readonly string[]).includes(sp.denied) ? (sp.denied as Resource) : null;
  const d = await getOverview();
  const r = user.role;

  const kpis = [
    { label: "Athletes", value: d.kpis.athletes, href: "/admin/athletes", res: "athletes" as const, note: "in the database" },
    { label: "Upcoming", value: d.kpis.upcoming, href: "/admin/events", res: "events" as const, note: "events on the calendar" },
    { label: "Results", value: d.kpis.results, href: "/admin/results", res: "results" as const, note: "marks recorded" },
    { label: "Published", value: d.kpis.published, href: "/admin/news?status=published", res: "news" as const, note: "news stories live" },
    { label: "Competitions", value: d.kpis.competitions, href: "/admin/competitions", res: "competitions" as const, note: "tracked" },
    { label: "Pending", value: d.kpis.pending, href: "/admin/news?status=review", res: "news" as const, note: "drafts & in review", alert: d.kpis.pending > 0 },
    { label: "Unread", value: d.kpis.unread, href: "/admin/messages?status=unread", res: "messages" as const, note: "contact messages", alert: d.kpis.unread > 0 },
  ];

  const pipeTotal = Math.max(1, d.pipeline.draft + d.pipeline.review + d.pipeline.published);
  const firstName = user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      {denied && (
        <div role="alert" className="flex items-start gap-3 rounded-sm border border-warning/30 bg-warning/[0.07] px-4 py-3 text-sm text-ink-800">
          <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
          <p>
            <strong className="font-semibold">Your role doesn’t have access to {denied}.</strong> You were redirected to the overview. Ask a Super Admin if you need it.
          </p>
        </div>
      )}

      {/* Greeting band */}
      <section className="relative overflow-hidden rounded-sm bg-ink-950 px-6 py-7 text-white md:px-8">
        <svg className="pointer-events-none absolute -right-24 -top-40 h-[30rem] w-[30rem] stroke-white/[0.07]" viewBox="0 0 400 400" fill="none" aria-hidden>
          {Array.from({ length: 8 }).map((_, i) => (
            <circle key={i} cx="400" cy="0" r={110 + i * 34} strokeWidth="1" />
          ))}
        </svg>
        <div className="absolute inset-y-0 left-0 w-1 bg-brand-600" aria-hidden />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className={cn(labelCls, "text-white/50")}>
              {new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Bahrain" }).format(new Date())}
            </p>
            <h1 className={cn(headingCls, "mt-3 text-[2.25rem] md:text-[3rem]")}>
              {greeting()}, {firstName}
              <span className="text-brand-600">.</span>
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Signed in as <span className="font-semibold text-white">{ROLE_LABEL[r]}</span>. {ROLE_SUMMARY[r]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {can(r, "results", "write") && (
              <ButtonLink href="/admin/results/new" size="sm" arrow={false}>
                + Record result
              </ButtonLink>
            )}
            {can(r, "news", "write") && (
              <ButtonLink href="/admin/news/new" size="sm" variant={can(r, "results", "write") ? "outline-inverse" : "primary"} arrow={false}>
                + Write news
              </ButtonLink>
            )}
            {can(r, "events", "write") && (
              <ButtonLink href="/admin/events/new" size="sm" variant="outline-inverse" arrow={false}>
                + Add event
              </ButtonLink>
            )}
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section aria-label="Key figures" className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4 xl:grid-cols-7 [&>*:last-child]:col-span-2 xl:[&>*:last-child]:col-span-1">
        {kpis.map((k) => {
          const allowed = can(r, k.res);
          const body = (
            <>
              <p className={cn(labelCls, "flex items-center justify-between gap-2 text-ink-500")}>
                {k.label}
                {allowed && <ArrowUpRight className="size-3.5 text-ink-300 transition-colors group-hover:text-brand-600" aria-hidden />}
              </p>
              <p className="mt-3 flex items-center gap-2 text-[2.5rem] font-extrabold leading-none text-ink-950 tabular [font-variation-settings:'wdth'_68]">
                {k.value}
                {k.alert && <span className="size-2 rounded-full bg-brand-600" aria-label="needs attention" />}
              </p>
              <p className="mt-1.5 text-xs text-ink-500">{k.note}</p>
            </>
          );
          return allowed ? (
            <Link key={k.label} href={k.href} className="group bg-white p-4 transition-colors hover:bg-pearl/50 md:p-5">
              {body}
            </Link>
          ) : (
            <div key={k.label} className="bg-white p-4 md:p-5">
              {body}
            </div>
          );
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Results per month" className="xl:col-span-2" bodyClassName="pb-4 pt-4 pr-3" action={can(r, "results") ? <PanelLink href="/admin/results">All results</PanelLink> : undefined}>
          <ResultsChart data={d.chart} />
        </Panel>

        <Panel title="Content pipeline" action={can(r, "news") ? <PanelLink href="/admin/news">Open news</PanelLink> : undefined} bodyClassName="p-5">
          <ol className="space-y-1">
            {(
              [
                ["draft", "Draft", d.pipeline.draft, "bg-ink-300", "Being written"],
                ["review", "In review", d.pipeline.review, "bg-warning", "Waiting for a publisher"],
                ["published", "Published", d.pipeline.published, "bg-success", "Live on the site"],
              ] as const
            ).map(([key, label, value, bar, note], i) => (
              <li key={key}>
                <Link href={`/admin/news?status=${key}`} className="group grid grid-cols-[1.75rem_1fr_auto] items-center gap-3 rounded-xs px-2 py-2.5 hover:bg-pearl/60">
                  <span className="flex size-7 items-center justify-center rounded-xs bg-ink-950 text-[0.6875rem] font-bold text-white tabular">{i + 1}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink-950 group-hover:text-brand-600">{label}</span>
                    <span className="block text-xs text-ink-500">{note}</span>
                    <span className="mt-1.5 block h-1 overflow-hidden rounded-full bg-pearl" aria-hidden>
                      <span className={cn("block h-full rounded-full", bar)} style={{ width: `${Math.max(value ? 4 : 0, (value / pipeTotal) * 100)}%` }} />
                    </span>
                  </span>
                  <span className="text-3xl font-extrabold leading-none text-ink-950 tabular [font-variation-settings:'wdth'_70]">{value}</span>
                </Link>
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs leading-relaxed text-ink-500">Editors write drafts and submit them for review. Content managers and administrators publish.</p>
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Recent results" className="xl:col-span-2" action={can(r, "results") ? <PanelLink href="/admin/results">View all</PanelLink> : undefined}>
          {d.recentResults.length === 0 ? (
            <p className="p-5 text-sm text-ink-500">No results recorded yet.</p>
          ) : (
            <div className="relative overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className={cn(labelCls, "text-ink-500")}>
                    <th scope="col" className="px-5 py-2.5 font-semibold">Athlete</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Event</th>
                    <th scope="col" className="px-3 py-2.5 text-right font-semibold">Mark</th>
                    <th scope="col" className="px-3 py-2.5 font-semibold">Place</th>
                    <th scope="col" className="px-5 py-2.5 text-right font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {d.recentResults.map((x) => (
                    <tr key={x.id} className="border-t border-line">
                      <td className="px-5 py-3">
                        <span className="font-semibold text-ink-950">
                          {x.firstName} {x.lastName}
                        </span>
                        {x.isDemo && <DemoBadge className="ml-2" />}
                        <span className="block truncate text-xs text-ink-500">{x.competition ?? x.competitionName ?? "—"}</span>
                      </td>
                      <td className="px-3 py-3 text-ink-700">{x.discipline}</td>
                      <td className="px-3 py-3 text-right">
                        <span className="text-mark text-base text-ink-950">{x.mark ?? "—"}</span>
                        {x.record && <RecordTag record={x.record} className="ml-1.5" />}
                      </td>
                      <td className="px-3 py-3">{x.medal ? <MedalDot medal={x.medal} /> : <span className="tabular text-ink-600">{ordinal(x.position)}</span>}</td>
                      <td className="px-5 py-3 text-right text-xs text-ink-500 tabular">{x.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title="Upcoming events" action={can(r, "events") ? <PanelLink href="/admin/events">Calendar</PanelLink> : undefined}>
          {d.upcoming.length === 0 ? (
            <p className="p-5 text-sm text-ink-500">Nothing scheduled.</p>
          ) : (
            <ul>
              {d.upcoming.map((e) => {
                const p = dateParts(e.startAt);
                const st = effectiveStatus(e.status, e.startAt, e.endAt);
                return (
                  <li key={e.id} className="flex gap-4 border-t border-line px-5 py-3.5 first:border-t-0">
                    <div className="w-11 shrink-0 text-center">
                      <span className="block text-2xl font-extrabold leading-none text-ink-950 tabular [font-variation-settings:'wdth'_70]">{p.day}</span>
                      <span className={cn(labelCls, "mt-1 block text-[0.5625rem] text-brand-600")}>{p.month}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold leading-snug text-ink-950">
                        {can(r, "events", "write") ? (
                          <Link href={`/admin/events/${e.id}`} className="hover:text-brand-600">
                            {e.title}
                          </Link>
                        ) : (
                          e.title
                        )}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-500">
                        {formatDateRange(e.startAt, e.endAt)} · {e.city ?? e.location ?? "TBC"}
                      </p>
                      <div className="mt-1.5 flex gap-1.5">
                        <StatusBadge status={st} />
                        {e.isDemo && <DemoBadge />}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Recent activity" action={can(r, "activity") ? <PanelLink href="/admin/activity">Full audit log</PanelLink> : undefined}>
        {d.activity.length === 0 ? (
          <p className="p-5 text-sm text-ink-500">No activity yet.</p>
        ) : (
          <ol className="grid md:grid-cols-2">
            {d.activity.map(({ a, userName }) => (
              <li key={a.id} className="flex items-start gap-3 border-t border-line px-5 py-3 md:[&:nth-child(-n+2)]:border-t-0 md:odd:border-r">
                <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", actionDot(a.action))} aria-hidden />
                <p className="min-w-0 flex-1 text-sm text-ink-700">
                  <span className="font-semibold text-ink-950">{userName ?? "System"}</span> {a.action} {a.entity === "user" && a.action.startsWith("log") ? "" : a.entity}
                  {a.label && a.entity !== "user" && <span className="text-ink-950"> “{a.label}”</span>}
                </p>
                <time className="shrink-0 text-xs text-ink-400 tabular" dateTime={a.createdAt.toISOString()}>
                  {timeAgo(a.createdAt)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </Panel>
    </div>
  );
}

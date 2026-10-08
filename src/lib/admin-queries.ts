import "server-only";
import { and, asc, count, desc, eq, gte, inArray, like, or, sql } from "drizzle-orm";
import { db, schema as s } from "@/db";
import type { Role } from "@/db/schema";
import { can } from "./permissions";

export async function getNotices(role: Role) {
  const notices: { label: string; detail: string; count: number; href: string }[] = [];
  const badges: Record<string, number> = {};
  if (can(role, "messages")) {
    const [r] = await db.select({ n: count() }).from(s.messages).where(eq(s.messages.read, false));
    notices.push({ label: "Unread messages", detail: "From the public contact form", count: r.n, href: "/admin/messages?status=unread" });
    if (r.n) badges["/admin/messages"] = r.n;
  }
  if (can(role, "news", "publish")) {
    const [r] = await db.select({ n: count() }).from(s.news).where(eq(s.news.status, "review"));
    notices.push({ label: "News awaiting review", detail: "Submitted by editors, ready to publish", count: r.n, href: "/admin/news?status=review" });
    if (r.n) badges["/admin/news"] = r.n;
  } else if (can(role, "news", "write")) {
    const [r] = await db.select({ n: count() }).from(s.news).where(eq(s.news.status, "draft"));
    notices.push({ label: "Drafts in progress", detail: "Finish and submit them for review", count: r.n, href: "/admin/news?status=draft" });
  }
  return { notices, badges };
}

const n = async (q: Promise<{ n: number }[]>) => (await q)[0]?.n ?? 0;

export async function getOverview() {
  const todayIso = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bahrain" }).format(new Date());
  const [athletes, results, published, competitions, pending, unread, drafts, review, upcomingCount] = await Promise.all([
    n(db.select({ n: count() }).from(s.athletes)),
    n(db.select({ n: count() }).from(s.results)),
    n(db.select({ n: count() }).from(s.news).where(eq(s.news.status, "published"))),
    n(db.select({ n: count() }).from(s.competitions)),
    n(db.select({ n: count() }).from(s.news).where(inArray(s.news.status, ["draft", "review"]))),
    n(db.select({ n: count() }).from(s.messages).where(eq(s.messages.read, false))),
    n(db.select({ n: count() }).from(s.news).where(eq(s.news.status, "draft"))),
    n(db.select({ n: count() }).from(s.news).where(eq(s.news.status, "review"))),
    n(
      db
        .select({ n: count() })
        .from(s.events)
        .where(and(gte(sql`substr(coalesce(${s.events.endAt}, ${s.events.startAt}), 1, 10)`, todayIso), sql`${s.events.status} not in ('cancelled')`)),
    ),
  ]);

  const recentResults = await db
    .select({
      id: s.results.id,
      date: s.results.date,
      mark: s.results.mark,
      position: s.results.position,
      medal: s.results.medal,
      record: s.results.record,
      isDemo: s.results.isDemo,
      firstName: s.athletes.firstName,
      lastName: s.athletes.lastName,
      discipline: s.disciplines.name,
      competition: s.competitions.shortName,
      competitionName: s.competitions.name,
    })
    .from(s.results)
    .innerJoin(s.athletes, eq(s.results.athleteId, s.athletes.id))
    .innerJoin(s.disciplines, eq(s.results.disciplineId, s.disciplines.id))
    .leftJoin(s.competitions, eq(s.results.competitionId, s.competitions.id))
    .orderBy(desc(s.results.date), desc(s.results.id))
    .limit(6);

  const upcoming = await db
    .select()
    .from(s.events)
    .where(and(gte(sql`substr(coalesce(${s.events.endAt}, ${s.events.startAt}), 1, 10)`, todayIso), sql`${s.events.status} not in ('cancelled')`))
    .orderBy(asc(s.events.startAt))
    .limit(5);

  const activity = await db
    .select({ a: s.activityLog, userName: s.users.name, role: s.users.role })
    .from(s.activityLog)
    .leftJoin(s.users, eq(s.activityLog.userId, s.users.id))
    .orderBy(desc(s.activityLog.createdAt), desc(s.activityLog.id))
    .limit(8);

  // Results per month, last 12 months (Bahrain time)
  const now = new Date(`${todayIso}T12:00:00Z`);
  const months = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 11 + i, 1));
    return d.toISOString().slice(0, 7);
  });
  const perMonth = await db
    .select({ m: sql<string>`substr(${s.results.date}, 1, 7)`, n: count(), medals: sql<number>`sum(case when ${s.results.medal} is not null then 1 else 0 end)` })
    .from(s.results)
    .where(gte(s.results.date, `${months[0]}-01`))
    .groupBy(sql`substr(${s.results.date}, 1, 7)`);
  const byMonth = new Map(perMonth.map((r) => [r.m, r]));
  const chart = months.map((m) => ({ month: m, count: byMonth.get(m)?.n ?? 0, medals: Number(byMonth.get(m)?.medals ?? 0) }));

  return {
    kpis: { athletes, results, published, competitions, pending, unread, upcoming: upcomingCount },
    pipeline: { draft: drafts, review, published },
    recentResults,
    upcoming,
    activity,
    chart,
  };
}

export async function adminSearch(q: string, role: Role) {
  const term = `%${q.replace(/[%_\\]/g, "").trim().slice(0, 100)}%`;
  const [athletes, news, competitions, events] = await Promise.all([
    can(role, "athletes")
      ? db
          .select({ id: s.athletes.id, firstName: s.athletes.firstName, lastName: s.athletes.lastName, slug: s.athletes.slug, club: s.athletes.club, isDemo: s.athletes.isDemo })
          .from(s.athletes)
          .where(or(like(s.athletes.firstName, term), like(s.athletes.lastName, term), like(sql`${s.athletes.firstName} || ' ' || ${s.athletes.lastName}`, term), like(s.athletes.nameAr, term), like(s.athletes.club, term)))
          .limit(10)
      : [],
    can(role, "news")
      ? db
          .select({ id: s.news.id, title: s.news.title, status: s.news.status, slug: s.news.slug, isDemo: s.news.isDemo })
          .from(s.news)
          .where(or(like(s.news.title, term), like(s.news.excerpt, term)))
          .limit(10)
      : [],
    can(role, "competitions")
      ? db
          .select({ id: s.competitions.id, name: s.competitions.name, city: s.competitions.city, startDate: s.competitions.startDate, isDemo: s.competitions.isDemo })
          .from(s.competitions)
          .where(or(like(s.competitions.name, term), like(s.competitions.shortName, term), like(s.competitions.city, term)))
          .limit(10)
      : [],
    can(role, "events")
      ? db
          .select({ id: s.events.id, title: s.events.title, startAt: s.events.startAt, isDemo: s.events.isDemo })
          .from(s.events)
          .where(or(like(s.events.title, term), like(s.events.city, term)))
          .limit(10)
      : [],
  ]);
  return { athletes, news, competitions, events };
}

/* ---------- option lists for selects ---------- */

export async function disciplineOptions() {
  const rows = await db.select().from(s.disciplines).orderBy(asc(s.disciplines.sortOrder), asc(s.disciplines.name));
  return rows.map((d) => ({ value: String(d.id), label: d.name }));
}

export async function athleteOptions() {
  const rows = await db
    .select({ id: s.athletes.id, firstName: s.athletes.firstName, lastName: s.athletes.lastName, isDemo: s.athletes.isDemo })
    .from(s.athletes)
    .orderBy(asc(s.athletes.lastName), asc(s.athletes.firstName));
  return rows.map((a) => ({ value: String(a.id), label: `${a.firstName} ${a.lastName}`, hint: a.isDemo ? "demo" : undefined }));
}

export async function competitionOptions() {
  const rows = await db
    .select({ id: s.competitions.id, name: s.competitions.name, startDate: s.competitions.startDate })
    .from(s.competitions)
    .orderBy(desc(s.competitions.startDate));
  return rows.map((c) => ({ value: String(c.id), label: c.startDate ? `${c.name} (${c.startDate.slice(0, 4)})` : c.name }));
}

export async function mediaItems() {
  const rows = await db.select({ url: s.media.url, alt: s.media.alt, title: s.media.title }).from(s.media).where(eq(s.media.kind, "image")).orderBy(desc(s.media.createdAt));
  return rows;
}

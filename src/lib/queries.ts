import "server-only";
import { and, asc, count, desc, eq, inArray, isNotNull, like, or, sql, type SQL } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { effectiveStatus } from "./status";
import { isBetter } from "./marks";

/* ------------------------------------------------------------------ */
/* Disciplines                                                         */
/* ------------------------------------------------------------------ */

export async function getDisciplines() {
  return db.select().from(s.disciplines).orderBy(asc(s.disciplines.sortOrder));
}

/* ------------------------------------------------------------------ */
/* Athletes                                                            */
/* ------------------------------------------------------------------ */

export type AthleteFilters = {
  q?: string;
  discipline?: string;
  group?: string;
  gender?: string;
  category?: string;
  status?: string;
  sort?: string;
};

export async function getAthletes(f: AthleteFilters = {}) {
  const where: SQL[] = [];
  if (f.q) {
    const q = `%${f.q.trim()}%`;
    where.push(or(like(s.athletes.firstName, q), like(s.athletes.lastName, q), like(sql`${s.athletes.firstName} || ' ' || ${s.athletes.lastName}`, q))!);
  }
  if (f.discipline) where.push(eq(s.disciplines.slug, f.discipline));
  if (f.group) where.push(eq(s.disciplines.group, f.group as (typeof s.DISCIPLINE_GROUPS)[number]));
  if (f.gender === "men" || f.gender === "women") where.push(eq(s.athletes.gender, f.gender));
  if (f.category) where.push(eq(s.athletes.category, f.category as "senior"));
  if (f.status === "active" || f.status === "retired") where.push(eq(s.athletes.status, f.status));

  const resultCount = db
    .select({ athleteId: s.results.athleteId, n: count().as("n"), medals: sql<number>`sum(case when ${s.results.medal} is not null or ${s.results.position} = 1 then 1 else 0 end)`.as("medals") })
    .from(s.results)
    .groupBy(s.results.athleteId)
    .as("rc");

  const order =
    f.sort === "name-desc"
      ? [desc(s.athletes.lastName)]
      : f.sort === "results"
        ? [desc(sql`coalesce(${resultCount.n}, 0)`), asc(s.athletes.lastName)]
        : f.sort === "discipline"
          ? [asc(s.disciplines.sortOrder), asc(s.athletes.lastName)]
          : f.sort === "name"
            ? [asc(s.athletes.lastName)]
            : [desc(s.athletes.featured), asc(s.athletes.isDemo), asc(s.athletes.lastName)];

  return db
    .select({
      athlete: s.athletes,
      discipline: s.disciplines,
      results: sql<number>`coalesce(${resultCount.n}, 0)`,
      wins: sql<number>`coalesce(${resultCount.medals}, 0)`,
    })
    .from(s.athletes)
    .leftJoin(s.disciplines, eq(s.athletes.primaryDisciplineId, s.disciplines.id))
    .leftJoin(resultCount, eq(resultCount.athleteId, s.athletes.id))
    .where(where.length ? and(...where) : undefined)
    .orderBy(...order);
}

export async function getFeaturedAthletes() {
  const rows = await db.query.athletes.findMany({
    where: eq(s.athletes.featured, true),
    with: {
      primaryDiscipline: true,
      results: { with: { competition: true, discipline: true }, orderBy: desc(s.results.date), limit: 1 },
    },
    orderBy: [asc(s.athletes.id)],
  });
  return rows;
}

export type PersonalBest = {
  discipline: typeof s.disciplines.$inferSelect;
  pb?: { mark: string; date: string; competition?: string | null; record?: string | null };
  sb?: { mark: string; date: string; competition?: string | null };
};

export async function getAthleteBySlug(slug: string) {
  const athlete = await db.query.athletes.findFirst({
    where: eq(s.athletes.slug, slug),
    with: {
      primaryDiscipline: true,
      results: { with: { competition: true, discipline: true }, orderBy: [desc(s.results.date)] },
      achievements: { with: { competition: true }, orderBy: [desc(s.achievements.year)] },
      news: { with: { news: true } },
    },
  });
  if (!athlete) return null;

  // Personal & season bests are derived from results, never typed in by hand.
  const seasonYear = String(new Date().getFullYear());
  const byDisc = new Map<number, PersonalBest & { pbV?: number; sbV?: number }>();
  for (const r of athlete.results) {
    const entry = byDisc.get(r.disciplineId) ?? { discipline: r.discipline };
    if (r.markValue != null && r.mark) {
      const m = r.discipline.measure;
      if (entry.pbV == null || isBetter(r.markValue, entry.pbV, m)) {
        entry.pbV = r.markValue;
        entry.pb = { mark: r.mark, date: r.date, competition: r.competition?.name, record: r.record };
      }
      if (r.date.startsWith(seasonYear) && (entry.sbV == null || isBetter(r.markValue, entry.sbV, m))) {
        entry.sbV = r.markValue;
        entry.sb = { mark: r.mark, date: r.date, competition: r.competition?.name };
      }
    }
    byDisc.set(r.disciplineId, entry);
  }

  const competitions = Array.from(
    new Map(athlete.results.filter((r) => r.competition).map((r) => [r.competition!.id, r.competition!])).values(),
  );
  const medals = {
    gold: athlete.results.filter((r) => r.medal === "gold").length + athlete.achievements.filter((a) => a.medal === "gold" && !athlete.results.some((r) => r.competitionId === a.competitionId && r.medal === "gold")).length,
    silver: athlete.results.filter((r) => r.medal === "silver").length,
    bronze: athlete.results.filter((r) => r.medal === "bronze").length,
  };
  const news = athlete.news.map((n) => n.news).filter((n) => n.status === "published").sort((a, b) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? ""));

  return { ...athlete, bests: Array.from(byDisc.values()), competitions, medals, newsItems: news };
}

export async function getRelatedAthletes(athleteId: number, disciplineGroup?: string | null) {
  const rows = await db
    .select({ athlete: s.athletes, discipline: s.disciplines })
    .from(s.athletes)
    .leftJoin(s.disciplines, eq(s.athletes.primaryDisciplineId, s.disciplines.id))
    .where(and(sql`${s.athletes.id} != ${athleteId}`, disciplineGroup ? eq(s.disciplines.group, disciplineGroup as "sprints") : undefined))
    .orderBy(asc(s.athletes.isDemo), desc(s.athletes.featured))
    .limit(4);
  return rows;
}

/* ------------------------------------------------------------------ */
/* Results                                                             */
/* ------------------------------------------------------------------ */

export type ResultFilters = {
  q?: string;
  discipline?: string;
  athlete?: string;
  competition?: string;
  year?: string;
  gender?: string;
  category?: string;
  round?: string;
  medal?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

export async function getResults(f: ResultFilters = {}) {
  const where: SQL[] = [];
  if (f.q) {
    const q = `%${f.q.trim()}%`;
    where.push(or(like(sql`${s.athletes.firstName} || ' ' || ${s.athletes.lastName}`, q), like(s.competitions.name, q), like(s.disciplines.name, q))!);
  }
  if (f.discipline) where.push(eq(s.disciplines.slug, f.discipline));
  if (f.athlete) where.push(eq(s.athletes.slug, f.athlete));
  if (f.competition) where.push(eq(s.competitions.slug, f.competition));
  if (f.year) where.push(like(s.results.date, `${f.year}%`));
  if (f.gender === "men" || f.gender === "women") where.push(eq(s.athletes.gender, f.gender));
  if (f.category) where.push(eq(s.athletes.category, f.category as "senior"));
  if (f.round) where.push(eq(s.results.round, f.round as "final"));
  if (f.medal === "any") where.push(isNotNull(s.results.medal));
  else if (f.medal === "record") where.push(isNotNull(s.results.record));
  else if (f.medal === "win") where.push(eq(s.results.position, 1));

  const page = Math.max(1, f.page ?? 1);
  const pageSize = f.pageSize ?? 15;
  const cond = where.length ? and(...where) : undefined;

  const order =
    f.sort === "date-asc"
      ? [asc(s.results.date)]
      : f.sort === "position"
        ? [asc(sql`coalesce(${s.results.position}, 99)`), desc(s.results.date)]
        : f.sort === "athlete"
          ? [asc(s.athletes.lastName), desc(s.results.date)]
          : f.sort === "mark"
            ? [asc(s.disciplines.sortOrder), sql`case when ${s.disciplines.measure} = 'time' then ${s.results.markValue} else -${s.results.markValue} end asc nulls last`]
            : [desc(s.results.date), asc(s.results.position)];

  const base = db
    .select({ result: s.results, athlete: s.athletes, competition: s.competitions, discipline: s.disciplines })
    .from(s.results)
    .innerJoin(s.athletes, eq(s.results.athleteId, s.athletes.id))
    .innerJoin(s.disciplines, eq(s.results.disciplineId, s.disciplines.id))
    .leftJoin(s.competitions, eq(s.results.competitionId, s.competitions.id))
    .where(cond);

  const [rows, [{ total }]] = await Promise.all([
    base.orderBy(...order).limit(pageSize).offset((page - 1) * pageSize),
    db
      .select({ total: count() })
      .from(s.results)
      .innerJoin(s.athletes, eq(s.results.athleteId, s.athletes.id))
      .innerJoin(s.disciplines, eq(s.results.disciplineId, s.disciplines.id))
      .leftJoin(s.competitions, eq(s.results.competitionId, s.competitions.id))
      .where(cond),
  ]);
  return { rows, total, page, pageSize, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getResultYears() {
  const rows = await db.selectDistinct({ y: sql<string>`substr(${s.results.date}, 1, 4)` }).from(s.results).orderBy(desc(sql`1`));
  return rows.map((r) => r.y);
}

/* ------------------------------------------------------------------ */
/* Competitions & events                                               */
/* ------------------------------------------------------------------ */

export async function getCompetitions(status?: string) {
  const rows = await db
    .select({
      competition: s.competitions,
      results: sql<number>`(select count(*) from ${s.results} where ${s.results.competitionId} = ${s.competitions.id})`,
      athletes: sql<number>`(select count(distinct ${s.results.athleteId}) from ${s.results} where ${s.results.competitionId} = ${s.competitions.id})`,
      medals: sql<number>`(select count(*) from ${s.results} where ${s.results.competitionId} = ${s.competitions.id} and ${s.results.medal} is not null)`,
    })
    .from(s.competitions)
    .orderBy(desc(sql`coalesce(${s.competitions.startDate}, '9999')`));
  const withStatus = rows.map((r) => ({ ...r, live: effectiveStatus(r.competition.status, r.competition.startDate, r.competition.endDate) }));
  return status ? withStatus.filter((r) => r.live === status) : withStatus;
}

export async function getCompetitionBySlug(slug: string) {
  const c = await db.query.competitions.findFirst({
    where: eq(s.competitions.slug, slug),
    with: {
      results: { with: { athlete: true, discipline: true }, orderBy: [asc(s.results.disciplineId), asc(s.results.position)] },
      events: true,
      news: { where: eq(s.news.status, "published"), orderBy: [desc(s.news.publishedAt)] },
      achievements: true,
    },
  });
  if (!c) return null;
  const athletes = Array.from(new Map(c.results.map((r) => [r.athlete.id, r.athlete])).values());
  const disciplines = Array.from(new Map(c.results.map((r) => [r.discipline.id, r.discipline])).values());
  const medals = {
    gold: c.results.filter((r) => r.medal === "gold").length,
    silver: c.results.filter((r) => r.medal === "silver").length,
    bronze: c.results.filter((r) => r.medal === "bronze").length,
  };
  const documents = await db.select().from(s.documents).where(eq(s.documents.category, "competition")).limit(3);
  return { ...c, athletes, disciplines, medals, live: effectiveStatus(c.status, c.startDate, c.endDate), documents: c.level === "national" ? documents : [] };
}

export async function getEvents() {
  const rows = await db.query.events.findMany({
    with: { competition: true },
    orderBy: [asc(sql`coalesce(${s.events.startAt}, '9999')`)],
  });
  return rows.map((e) => ({ ...e, live: effectiveStatus(e.status, e.startAt, e.endAt) }));
}

export async function getEventBySlug(slug: string) {
  const e = await db.query.events.findFirst({
    where: eq(s.events.slug, slug),
    with: { competition: { with: { results: { with: { athlete: true, discipline: true }, orderBy: [asc(s.results.position)] } } } },
  });
  if (!e) return null;
  return { ...e, live: effectiveStatus(e.status, e.startAt, e.endAt) };
}

/* ------------------------------------------------------------------ */
/* News                                                                */
/* ------------------------------------------------------------------ */

export async function getNews({ category, page = 1, pageSize = 13, q }: { category?: string; page?: number; pageSize?: number; q?: string } = {}) {
  const where: SQL[] = [eq(s.news.status, "published")];
  if (category) where.push(eq(s.news.category, category as "athletes"));
  if (q) where.push(or(like(s.news.title, `%${q}%`), like(s.news.excerpt, `%${q}%`))!);
  const cond = and(...where);
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(s.news).where(cond).orderBy(desc(s.news.featured), desc(s.news.publishedAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ total: count() }).from(s.news).where(cond),
  ]);
  return { rows, total, page, pages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getLatestNews(limit = 5) {
  return db.select().from(s.news).where(eq(s.news.status, "published")).orderBy(desc(s.news.publishedAt)).limit(limit);
}

export async function getNewsBySlug(slug: string) {
  const n = await db.query.news.findFirst({
    where: and(eq(s.news.slug, slug), eq(s.news.status, "published")),
    with: { competition: true, athletes: { with: { athlete: { with: { primaryDiscipline: true } } } } },
  });
  if (!n) return null;
  const related = await db
    .select()
    .from(s.news)
    .where(and(eq(s.news.status, "published"), sql`${s.news.id} != ${n.id}`, or(eq(s.news.category, n.category), n.competitionId ? eq(s.news.competitionId, n.competitionId) : undefined)))
    .orderBy(desc(s.news.publishedAt))
    .limit(3);
  return { ...n, related };
}

/* ------------------------------------------------------------------ */
/* Home & institutional                                                */
/* ------------------------------------------------------------------ */

export async function getHomeData() {
  const [featured, latestResults, news, events, achievements, stats] = await Promise.all([
    getFeaturedAthletes(),
    getResults({ pageSize: 6 }),
    db.select().from(s.news).where(eq(s.news.status, "published")).orderBy(desc(s.news.featured), desc(s.news.publishedAt)).limit(5),
    getEvents(),
    db.query.achievements.findMany({ with: { athlete: true, competition: true }, orderBy: [desc(s.achievements.featured), desc(s.achievements.date)], limit: 6 }),
    getStats(),
  ]);
  return { featured, latestResults: latestResults.rows, news, events, achievements, stats };
}

export async function getStats() {
  const [[a], [c], [r], [m], [rec]] = await Promise.all([
    db.select({ n: count() }).from(s.athletes).where(eq(s.athletes.isDemo, false)),
    db.select({ n: count() }).from(s.competitions).where(and(eq(s.competitions.isDemo, false), eq(s.competitions.status, "completed"))),
    db.select({ n: count() }).from(s.results).where(eq(s.results.isDemo, false)),
    db.select({ n: count() }).from(s.results).where(and(eq(s.results.isDemo, false), isNotNull(s.results.medal))),
    db.select({ n: count() }).from(s.results).where(and(eq(s.results.isDemo, false), isNotNull(s.results.record))),
  ]);
  return { athletes: a.n, competitions: c.n, results: r.n, medals: m.n, records: rec.n };
}

export async function getAchievements() {
  return db.query.achievements.findMany({ with: { athlete: true, competition: true }, orderBy: [desc(s.achievements.date)] });
}

export async function getBoard() {
  return db.select().from(s.boardMembers).orderBy(asc(s.boardMembers.sortOrder));
}
export async function getCommittees() {
  return db.select().from(s.committees).orderBy(asc(s.committees.sortOrder));
}
export async function getDocuments(category?: string) {
  return db
    .select()
    .from(s.documents)
    .where(category ? eq(s.documents.category, category as "governance") : undefined)
    .orderBy(desc(s.documents.publishedAt));
}

export async function getSitemapEntities() {
  const [athletes, competitions, events, news] = await Promise.all([
    db.select({ slug: s.athletes.slug, updatedAt: s.athletes.updatedAt }).from(s.athletes),
    db.select({ slug: s.competitions.slug, updatedAt: s.competitions.updatedAt }).from(s.competitions),
    db.select({ slug: s.events.slug, updatedAt: s.events.updatedAt }).from(s.events),
    db.select({ slug: s.news.slug, updatedAt: s.news.updatedAt }).from(s.news).where(eq(s.news.status, "published")),
  ]);
  return { athletes, competitions, events, news };
}

/* ------------------------------------------------------------------ */
/* Search                                                              */
/* ------------------------------------------------------------------ */

export async function globalSearch(q: string) {
  const term = `%${q.trim()}%`;
  if (q.trim().length < 2) return { athletes: [], news: [], competitions: [], events: [] };
  const [athletes, news, competitions, events] = await Promise.all([
    db
      .select({ athlete: s.athletes, discipline: s.disciplines })
      .from(s.athletes)
      .leftJoin(s.disciplines, eq(s.athletes.primaryDisciplineId, s.disciplines.id))
      .where(or(like(sql`${s.athletes.firstName} || ' ' || ${s.athletes.lastName}`, term), like(s.disciplines.name, term)))
      .limit(8),
    db.select().from(s.news).where(and(eq(s.news.status, "published"), or(like(s.news.title, term), like(s.news.excerpt, term)))).orderBy(desc(s.news.publishedAt)).limit(8),
    db.select().from(s.competitions).where(or(like(s.competitions.name, term), like(s.competitions.city, term), like(s.competitions.country, term))).limit(6),
    db.select().from(s.events).where(or(like(s.events.title, term), like(s.events.location, term))).limit(6),
  ]);
  return { athletes, news, competitions, events };
}

export async function getAthletesByIds(ids: number[]) {
  if (!ids.length) return [];
  return db.select().from(s.athletes).where(inArray(s.athletes.id, ids));
}

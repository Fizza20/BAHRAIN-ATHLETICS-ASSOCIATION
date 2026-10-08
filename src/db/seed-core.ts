import type { LibSQLDatabase } from "drizzle-orm/libsql";
import { migrate } from "drizzle-orm/libsql/migrator";
import bcrypt from "bcryptjs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import * as s from "./schema";
import { photos, type PhotoKey } from "../lib/images";
import { parseMark } from "../lib/marks";
import * as real from "./seed-data/real";
import * as demo from "./seed-data/demo";

/**
 * Creates the schema and loads all seed content. Shared by the `npm run db:seed` script and by
 * the database-free demo mode (see src/db/index.ts), which seeds a throwaway database on start-up.
 */
const img = (k: string) => photos[k as PhotoKey]?.src ?? null;

const DISCIPLINES: [string, string, (typeof s.DISCIPLINE_GROUPS)[number], "time" | "distance" | "points"][] = [
  ["80m", "80m", "sprints", "time"],
  ["100m", "100m", "sprints", "time"],
  ["200m", "200m", "sprints", "time"],
  ["300m", "300m", "sprints", "time"],
  ["400m", "400m", "sprints", "time"],
  ["800m", "800m", "middle-distance", "time"],
  ["1500m", "1500m", "middle-distance", "time"],
  ["3000m-steeplechase", "3000m Steeplechase", "middle-distance", "time"],
  ["5000m", "5000m", "long-distance", "time"],
  ["10000m", "10,000m", "long-distance", "time"],
  ["100m-hurdles", "100m Hurdles", "hurdles", "time"],
  ["110m-hurdles", "110m Hurdles", "hurdles", "time"],
  ["400m-hurdles", "400m Hurdles", "hurdles", "time"],
  ["high-jump", "High Jump", "jumps", "distance"],
  ["pole-vault", "Pole Vault", "jumps", "distance"],
  ["long-jump", "Long Jump", "jumps", "distance"],
  ["triple-jump", "Triple Jump", "jumps", "distance"],
  ["shot-put", "Shot Put", "throws", "distance"],
  ["discus", "Discus Throw", "throws", "distance"],
  ["hammer", "Hammer Throw", "throws", "distance"],
  ["javelin", "Javelin Throw", "throws", "distance"],
  ["half-marathon", "Half Marathon", "road", "time"],
  ["marathon", "Marathon", "road", "time"],
  ["heptathlon", "Heptathlon", "combined", "points"],
  ["decathlon", "Decathlon", "combined", "points"],
];

export async function seedDatabase(db: LibSQLDatabase<typeof s>, opts: { bcryptRounds?: number; quiet?: boolean } = {}) {
  const log = (...a: unknown[]) => {
    if (!opts.quiet) console.log(...a);
  };
  log("→ migrating");
  await migrate(db as never, { migrationsFolder: path.join(process.cwd(), "drizzle") });

  log("→ clearing tables");
  for (const t of [
    s.activityLog, s.newsAthletes, s.news, s.results, s.achievements, s.events, s.athletes,
    s.competitions, s.disciplines, s.boardMembers, s.committees, s.documents, s.media,
    s.messages, s.sessions, s.users, s.settings,
  ]) {
    await db.delete(t);
  }

  log("→ disciplines");
  const disc = await db
    .insert(s.disciplines)
    .values(DISCIPLINES.map(([slug, name, group, measure], i) => ({ slug, name, group, measure, sortOrder: i })))
    .returning();
  const D = Object.fromEntries(disc.map((d) => [d.slug, d]));

  log("→ competitions");
  const comps = await db
    .insert(s.competitions)
    .values([
      ...real.realCompetitions.map((c) => ({
        slug: c.slug, name: c.name, shortName: c.shortName, level: c.level, city: c.city, country: c.country,
        venue: "venue" in c ? c.venue : null, startDate: c.startDate, endDate: c.endDate, status: c.status,
        description: c.description, imageUrl: img(c.image), sourceUrl: c.source, isDemo: false,
      })),
      ...demo.demoCompetitions.map((c) => ({
        slug: c.slug, name: c.name, shortName: c.shortName, level: c.level, city: c.city, country: c.country,
        venue: "venue" in c ? c.venue : null, startDate: c.startDate, endDate: c.endDate, status: c.status,
        description: c.description, imageUrl: img(c.image), isDemo: true,
      })),
    ])
    .returning();
  const C = Object.fromEntries(comps.map((c) => [c.slug, c]));

  log("→ athletes");
  const aths = await db
    .insert(s.athletes)
    .values([
      ...real.realAthletes.map((a) => ({
        slug: a.slug, firstName: a.firstName, lastName: a.lastName, gender: a.gender, category: a.category,
        primaryDisciplineId: D[a.discipline].id, headline: a.headline, bio: a.bio, featured: a.featured,
        sourceUrl: a.source, isDemo: false, status: "active" as const,
      })),
      ...demo.demoAthletes.map((a) => ({
        slug: a.slug, firstName: a.firstName, lastName: a.lastName, gender: a.gender, category: a.category,
        primaryDisciplineId: D[a.discipline].id, club: a.club, birthYear: a.birthYear,
        status: ("status" in a ? a.status : "active") as "active" | "retired",
        headline: `${D[a.discipline].name} · ${a.club}`,
        bio: `Demo profile. ${a.firstName} ${a.lastName} is a placeholder athlete used to demonstrate the athlete directory, profile and results features.`,
        isDemo: true,
      })),
    ])
    .returning();
  const A = Object.fromEntries(aths.map((a) => [a.slug, a]));

  log("→ events");
  const realEvents: (typeof s.events.$inferInsert)[] = real.realCompetitions.map((c) => ({
    slug: c.slug,
    title: c.name,
    type: "participation" as const,
    competitionId: C[c.slug].id,
    startAt: c.startDate ? `${c.startDate}T00:00:00+03:00` : null,
    endAt: c.endDate ? `${c.endDate}T23:59:00+03:00` : null,
    location: "venue" in c && c.venue ? `${c.venue}, ${c.city}` : `${c.city}, ${c.country}`,
    city: c.city, country: c.country, status: c.status, description: c.description,
    sourceUrl: c.source, isDemo: false,
  }));
  realEvents.push({
    slug: "national-team-training-camp-kuala-lumpur-2026",
    title: "National team training camp, Kuala Lumpur",
    type: "training-camp", competitionId: C["asian-games-aichi-nagoya-2026"].id,
    startAt: "2026-09-11T00:00:00+08:00", endAt: null, location: "Kuala Lumpur, Malaysia",
    city: "Kuala Lumpur", country: "Malaysia", status: "completed",
    description: "Intensive training camp in preparation for the 20th Asian Games in Aichi-Nagoya.",
    sourceUrl: "https://www.baa.bh/post/in-preparation-for-the-asian-games-in-aichi-nagoya-the-athletics-team-is-departing-for-malaysia-for",
    isDemo: false,
  });
  await db.insert(s.events).values([
    ...realEvents,
    ...demo.demoEvents.map((e) => ({
      slug: e.slug, title: e.title, type: e.type,
      competitionId: "competition" in e ? C[e.competition].id : null,
      startAt: e.startAt, endAt: e.endAt, location: e.location, city: e.city, country: e.country,
      status: e.status, description: e.description, isDemo: true,
    })),
  ]);

  log("→ results");
  await db.insert(s.results).values([
    ...real.realResults.map((r) => ({
      athleteId: A[r.athlete].id, competitionId: C[r.competition].id, disciplineId: D[r.discipline].id,
      round: r.round, position: r.position, mark: r.mark, markValue: parseMark(r.mark), date: r.date,
      record: "record" in r ? r.record : null, isSB: "isSB" in r ? r.isSB : false,
      medal: "medal" in r ? r.medal : null, notes: "notes" in r ? r.notes : null,
      sourceUrl: r.source, isDemo: false,
    })),
    ...demo.demoResults.map(([a, c, d, position, mark, date]) => ({
      athleteId: A[a].id, competitionId: C[c].id, disciplineId: D[d].id, round: "final" as const,
      position, mark, markValue: parseMark(mark), date,
      medal: (C[c].level !== "meeting" ? (["gold", "silver", "bronze"] as const)[position - 1] : undefined) ?? null,
      isDemo: true,
    })),
  ]);

  log("→ achievements");
  await db.insert(s.achievements).values(
    real.realAchievements.map((a) => ({
      title: a.title, description: a.description, year: a.year, date: a.date, type: a.type,
      medal: "medal" in a ? a.medal : null,
      athleteId: "athlete" in a ? A[a.athlete].id : null,
      competitionId: "competition" in a ? C[a.competition].id : null,
      featured: a.featured, sourceUrl: a.source, isDemo: false,
    })),
  );

  log("→ users");
  // No default password: a known one in a public repo is a standing back door.
  // Set SEED_ADMIN_PASSWORD (12+ chars) or a strong random one is generated and returned once.
  const given = process.env.SEED_ADMIN_PASSWORD;
  if (given && (given.length < 12 || given.length > 72)) throw new Error("SEED_ADMIN_PASSWORD must be 12 to 72 characters");
  const adminPassword = given ?? randomBytes(18).toString("base64url");
  const pw = await bcrypt.hash(adminPassword, opts.bcryptRounds ?? 12);
  const userRows = await db
    .insert(s.users)
    .values([
      { name: "Platform Owner", email: "superadmin@baa.demo", role: "super_admin", passwordHash: pw },
      { name: "BAA Administrator", email: "admin@baa.demo", role: "administrator", passwordHash: pw },
      { name: "Content Manager", email: "content@baa.demo", role: "content_manager", passwordHash: pw },
      { name: "Results Manager", email: "results@baa.demo", role: "results_manager", passwordHash: pw },
      { name: "Event Manager", email: "events@baa.demo", role: "event_manager", passwordHash: pw },
      { name: "News Editor", email: "editor@baa.demo", role: "editor", passwordHash: pw },
    ])
    .returning();

  log("→ news");
  const newsRows = await db
    .insert(s.news)
    .values([
      ...real.realNews.map((n) => ({
        slug: n.slug, title: n.title, excerpt: n.excerpt, body: n.body, category: n.category,
        imageUrl: img(n.image), author: "BAA Media", status: "published" as const, featured: n.featured,
        publishedAt: n.publishedAt, competitionId: n.competition ? C[n.competition].id : null,
        sourceUrl: n.source, isDemo: false, createdById: userRows[2].id,
      })),
      ...demo.demoNews.map((n) => ({
        slug: n.slug, title: n.title, excerpt: n.excerpt, body: n.body, category: n.category,
        imageUrl: img(n.image), author: "BAA Media", status: "published" as const, featured: false,
        publishedAt: n.publishedAt, competitionId: "competition" in n ? C[n.competition].id : null,
        isDemo: true, createdById: userRows[2].id,
      })),
      { slug: "demo-draft-asian-games-review", title: "Asian Games review: Bahrain's athletics campaign", excerpt: "Awaiting confirmed results from the team manager.", body: "Draft placeholder. To be completed when BAA confirms results from Aichi-Nagoya.", category: "international", status: "review" as const, imageUrl: img("stadium"), author: "News Editor", isDemo: true, createdById: userRows[5].id, competitionId: C["asian-games-aichi-nagoya-2026"].id },
      { slug: "demo-draft-youth-squad", title: "Youth squad named for winter training block", excerpt: "Draft.", body: "Draft placeholder.", category: "development", status: "draft" as const, imageUrl: img("fieldRunner"), author: "News Editor", isDemo: true, createdById: userRows[5].id },
    ])
    .returning();
  const N = Object.fromEntries(newsRows.map((n) => [n.slug, n]));
  const links = real.realNews.flatMap((n) => n.athletes.map((a) => ({ newsId: N[n.slug].id, athleteId: A[a].id })));
  if (links.length) await db.insert(s.newsAthletes).values(links);

  log("→ governance");
  await db.insert(s.boardMembers).values(
    real.board.map((b, i) => ({ name: b.name, title: b.title, group: b.group, sortOrder: i, sourceUrl: real.boardSource })),
  );
  await db.insert(s.committees).values(
    demo.demoCommittees.map((c, i) => ({ ...c, sortOrder: i, isDemo: true })),
  );
  await db.insert(s.documents).values([
    ...demo.demoDocuments.map((d) => ({ ...d, url: null, isDemo: true })),
    { title: "Code of Conduct", category: "integrity", description: "Ethical standards for athletes, coaches and officials.", url: "/clean-athletics/code-of-conduct", fileType: "Page", publishedAt: "2025-01-01", sourceUrl: "https://www.baa.bh/about-7" },
    { title: "Anti-Doping Rules", category: "integrity", description: "The rules governing doping control in Bahraini athletics.", url: "/clean-athletics/anti-doping-rules", fileType: "Page", publishedAt: "2025-01-01", sourceUrl: "https://www.baa.bh/copy-of-code-of-conduct" },
  ]);

  log("→ media library");
  await db.insert(s.media).values(
    Object.entries(photos).map(([key, p]) => ({ title: key, url: p.src, alt: p.alt, credit: p.credit, kind: "image" as const, tags: "placeholder", isDemo: true })),
  );

  await db.insert(s.messages).values([
    { firstName: "Demo", lastName: "Visitor", email: "visitor@example.com", topic: "athletes", body: "Demo message: how can my daughter join a club and start competing?" },
    { firstName: "Demo", lastName: "Journalist", email: "press@example.com", topic: "media", body: "Demo message: requesting accreditation for the national championships." },
  ]);

  await db.insert(s.activityLog).values([
    { userId: userRows[2].id, action: "published", entity: "news", entityId: N["balew-diamond-league-title-asian-record"].id, label: "Balew wins Diamond League title with a new Asian record" },
    { userId: userRows[3].id, action: "created", entity: "result", label: "Balew, 5000m, 12:45.70 AR" },
    { userId: userRows[5].id, action: "submitted", entity: "news", entityId: N["demo-draft-asian-games-review"].id, label: "Asian Games review (for review)" },
    { userId: userRows[4].id, action: "updated", entity: "event", label: "BAA National Championships 2026" },
  ]);

  await db.insert(s.settings).values([
    { key: "site.tagline", value: "The home of Bahraini athletics" },
    { key: "site.demoBanner", value: "true" },
  ]);

  log("✓ seeded", { athletes: aths.length, competitions: comps.length, news: newsRows.length });
  return { generatedAdminPassword: given ? null : adminPassword };
}

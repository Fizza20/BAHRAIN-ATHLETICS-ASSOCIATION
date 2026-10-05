import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, primaryKey, index } from "drizzle-orm/sqlite-core";

/**
 * BAA relational model.
 * Written against drizzle's SQLite dialect (libSQL driver). Every table maps 1:1
 * to Postgres; switching dialects means swapping `sqlite-core` for `pg-core`.
 *
 * `isDemo` marks placeholder rows so the UI can label them and admins can purge them.
 * `sourceUrl` records where a real fact was taken from (baa.bh article, etc.).
 */

const id = () => integer("id").primaryKey({ autoIncrement: true });
const createdAt = () =>
  integer("created_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`);
const updatedAt = () =>
  integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(unixepoch())`);
const isDemo = () => integer("is_demo", { mode: "boolean" }).notNull().default(false);
const sourceUrl = () => text("source_url");

export const ROLES = [
  "super_admin",
  "administrator",
  "content_manager",
  "results_manager",
  "event_manager",
  "editor",
] as const;
export type Role = (typeof ROLES)[number];

export const users = sqliteTable("users", {
  id: id(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ROLES }).notNull().default("editor"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: createdAt(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(), // sha256 of the cookie token
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: createdAt(),
});

export const DISCIPLINE_GROUPS = [
  "sprints",
  "middle-distance",
  "long-distance",
  "hurdles",
  "jumps",
  "throws",
  "road",
  "combined",
] as const;

export const disciplines = sqliteTable("disciplines", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  group: text("group", { enum: DISCIPLINE_GROUPS }).notNull(),
  /** time → lower is better; distance/points → higher is better */
  measure: text("measure", { enum: ["time", "distance", "points"] }).notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const athletes = sqliteTable(
  "athletes",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    nameAr: text("name_ar"),
    gender: text("gender", { enum: ["men", "women"] }).notNull(),
    category: text("category", { enum: ["senior", "u23", "u20", "u18", "u16"] }).notNull().default("senior"),
    status: text("status", { enum: ["active", "retired"] }).notNull().default("active"),
    primaryDisciplineId: integer("primary_discipline_id").references(() => disciplines.id),
    birthYear: integer("birth_year"),
    club: text("club"),
    bio: text("bio"),
    headline: text("headline"),
    imageUrl: text("image_url"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    isDemo: isDemo(),
    sourceUrl: sourceUrl(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("athletes_discipline_idx").on(t.primaryDisciplineId)],
);

export const COMPETITION_STATUS = ["upcoming", "ongoing", "completed", "postponed", "cancelled"] as const;
export const COMPETITION_LEVEL = ["global", "continental", "regional", "national", "meeting"] as const;

export const competitions = sqliteTable("competitions", {
  id: id(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name"),
  level: text("level", { enum: COMPETITION_LEVEL }).notNull().default("meeting"),
  city: text("city"),
  country: text("country"),
  venue: text("venue"),
  startDate: text("start_date"), // ISO yyyy-mm-dd
  endDate: text("end_date"),
  status: text("status", { enum: COMPETITION_STATUS }).notNull().default("upcoming"),
  description: text("description"),
  imageUrl: text("image_url"),
  isDemo: isDemo(),
  sourceUrl: sourceUrl(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const EVENT_TYPES = ["participation", "championship", "training-camp", "meeting", "national", "community"] as const;

export const events = sqliteTable("events", {
  id: id(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  type: text("type", { enum: EVENT_TYPES }).notNull().default("participation"),
  competitionId: integer("competition_id").references(() => competitions.id, { onDelete: "set null" }),
  startAt: text("start_at"), // ISO datetime
  endAt: text("end_at"),
  timeNote: text("time_note"),
  location: text("location"),
  city: text("city"),
  country: text("country"),
  status: text("status", { enum: COMPETITION_STATUS }).notNull().default("upcoming"),
  description: text("description"),
  isDemo: isDemo(),
  sourceUrl: sourceUrl(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const ROUNDS = ["final", "semi-final", "heat", "qualification", "single"] as const;
export const RECORDS = ["WR", "AR", "NR", "WL", "CR", "MR"] as const;
export const MEDALS = ["gold", "silver", "bronze"] as const;

export const results = sqliteTable(
  "results",
  {
    id: id(),
    athleteId: integer("athlete_id")
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
    competitionId: integer("competition_id").references(() => competitions.id, { onDelete: "set null" }),
    disciplineId: integer("discipline_id")
      .notNull()
      .references(() => disciplines.id),
    round: text("round", { enum: ROUNDS }).notNull().default("final"),
    position: integer("position"),
    mark: text("mark"), // display string: "12:45.70", "8.12", "49.57"
    /** numeric value in seconds or metres for sorting / PB detection. null = unknown */
    markValue: real("mark_value"),
    wind: text("wind"),
    date: text("date").notNull(), // ISO yyyy-mm-dd
    record: text("record", { enum: RECORDS }),
    isSB: integer("is_sb", { mode: "boolean" }).notNull().default(false),
    medal: text("medal", { enum: MEDALS }),
    notes: text("notes"),
    isDemo: isDemo(),
    sourceUrl: sourceUrl(),
    createdAt: createdAt(),
  },
  (t) => [
    index("results_athlete_idx").on(t.athleteId),
    index("results_competition_idx").on(t.competitionId),
    index("results_date_idx").on(t.date),
  ],
);

export const achievements = sqliteTable("achievements", {
  id: id(),
  title: text("title").notNull(),
  description: text("description"),
  year: integer("year").notNull(),
  date: text("date"),
  type: text("type", { enum: ["medal", "record", "title", "milestone"] }).notNull(),
  medal: text("medal", { enum: MEDALS }),
  athleteId: integer("athlete_id").references(() => athletes.id, { onDelete: "set null" }),
  competitionId: integer("competition_id").references(() => competitions.id, { onDelete: "set null" }),
  featured: integer("featured", { mode: "boolean" }).notNull().default(false),
  isDemo: isDemo(),
  sourceUrl: sourceUrl(),
  createdAt: createdAt(),
});

export const NEWS_CATEGORIES = [
  "athletes",
  "competitions",
  "achievements",
  "federation",
  "international",
  "development",
] as const;
export const CONTENT_STATUS = ["draft", "review", "published"] as const;

export const news = sqliteTable(
  "news",
  {
    id: id(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    excerpt: text("excerpt"),
    body: text("body"), // markdown-lite: paragraphs separated by blank lines
    category: text("category", { enum: NEWS_CATEGORIES }).notNull().default("federation"),
    imageUrl: text("image_url"),
    author: text("author"),
    status: text("status", { enum: CONTENT_STATUS }).notNull().default("draft"),
    featured: integer("featured", { mode: "boolean" }).notNull().default(false),
    publishedAt: text("published_at"),
    competitionId: integer("competition_id").references(() => competitions.id, { onDelete: "set null" }),
    createdById: integer("created_by_id").references(() => users.id, { onDelete: "set null" }),
    isDemo: isDemo(),
    sourceUrl: sourceUrl(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("news_published_idx").on(t.publishedAt)],
);

export const newsAthletes = sqliteTable(
  "news_athletes",
  {
    newsId: integer("news_id")
      .notNull()
      .references(() => news.id, { onDelete: "cascade" }),
    athleteId: integer("athlete_id")
      .notNull()
      .references(() => athletes.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.newsId, t.athleteId] })],
);

export const boardMembers = sqliteTable("board_members", {
  id: id(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  group: text("group", { enum: ["executive", "committee", "administration"] }).notNull().default("committee"),
  sortOrder: integer("sort_order").notNull().default(0),
  imageUrl: text("image_url"),
  isDemo: isDemo(),
  sourceUrl: sourceUrl(),
});

export const committees = sqliteTable("committees", {
  id: id(),
  name: text("name").notNull(),
  chair: text("chair"),
  remit: text("remit"),
  sortOrder: integer("sort_order").notNull().default(0),
  isDemo: isDemo(),
  sourceUrl: sourceUrl(),
});

export const DOCUMENT_CATEGORIES = ["governance", "integrity", "competition", "forms", "reports"] as const;

export const documents = sqliteTable("documents", {
  id: id(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", { enum: DOCUMENT_CATEGORIES }).notNull().default("governance"),
  url: text("url"),
  fileType: text("file_type").default("PDF"),
  publishedAt: text("published_at"),
  isDemo: isDemo(),
  sourceUrl: sourceUrl(),
  createdAt: createdAt(),
});

export const media = sqliteTable("media", {
  id: id(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  alt: text("alt").notNull().default(""),
  credit: text("credit"),
  kind: text("kind", { enum: ["image", "video", "document"] }).notNull().default("image"),
  tags: text("tags"),
  isDemo: isDemo(),
  createdAt: createdAt(),
});

export const messages = sqliteTable("messages", {
  id: id(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  topic: text("topic").notNull().default("general"),
  body: text("body").notNull(),
  read: integer("read", { mode: "boolean" }).notNull().default(false),
  createdAt: createdAt(),
});

export const activityLog = sqliteTable("activity_log", {
  id: id(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(), // created | updated | deleted | published | login
  entity: text("entity").notNull(),
  entityId: integer("entity_id"),
  label: text("label"),
  createdAt: createdAt(),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

/* ---------- relations ---------- */

export const athletesRelations = relations(athletes, ({ one, many }) => ({
  primaryDiscipline: one(disciplines, { fields: [athletes.primaryDisciplineId], references: [disciplines.id] }),
  results: many(results),
  achievements: many(achievements),
  news: many(newsAthletes),
}));

export const competitionsRelations = relations(competitions, ({ many }) => ({
  results: many(results),
  events: many(events),
  news: many(news),
  achievements: many(achievements),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  competition: one(competitions, { fields: [events.competitionId], references: [competitions.id] }),
}));

export const resultsRelations = relations(results, ({ one }) => ({
  athlete: one(athletes, { fields: [results.athleteId], references: [athletes.id] }),
  competition: one(competitions, { fields: [results.competitionId], references: [competitions.id] }),
  discipline: one(disciplines, { fields: [results.disciplineId], references: [disciplines.id] }),
}));

export const achievementsRelations = relations(achievements, ({ one }) => ({
  athlete: one(athletes, { fields: [achievements.athleteId], references: [athletes.id] }),
  competition: one(competitions, { fields: [achievements.competitionId], references: [competitions.id] }),
}));

export const newsRelations = relations(news, ({ one, many }) => ({
  competition: one(competitions, { fields: [news.competitionId], references: [competitions.id] }),
  athletes: many(newsAthletes),
}));

export const newsAthletesRelations = relations(newsAthletes, ({ one }) => ({
  news: one(news, { fields: [newsAthletes.newsId], references: [news.id] }),
  athlete: one(athletes, { fields: [newsAthletes.athleteId], references: [athletes.id] }),
}));

export const disciplinesRelations = relations(disciplines, ({ many }) => ({
  results: many(results),
}));

export type Athlete = typeof athletes.$inferSelect;
export type Competition = typeof competitions.$inferSelect;
export type Event = typeof events.$inferSelect;
export type Result = typeof results.$inferSelect;
export type News = typeof news.$inferSelect;
export type Discipline = typeof disciplines.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type User = typeof users.$inferSelect;

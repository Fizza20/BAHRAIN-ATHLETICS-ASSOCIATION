import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { tmpdir } from "node:os";
import path from "node:path";
import * as schema from "./schema";

/**
 * Demo mode (no external database needed).
 *
 * On Vercel the project folder is read-only and `./data/baa.db` is not available, so when no
 * DATABASE_URL is configured the app creates a throw-away SQLite file in the system temp
 * directory and fills it from the bundled seed data (src/db/seed-data) the first time it starts.
 * Every page, query and form therefore works unchanged; nothing persists between instances.
 *
 * - Vercel with no DATABASE_URL  -> demo mode automatically
 * - Local: set BAA_DEMO_DB=1 to try it
 * - Set DATABASE_URL (e.g. a Turso database) to use a real database instead
 */
const demoMode = !process.env.DATABASE_URL && (process.env.BAA_DEMO_DB === "1" || Boolean(process.env.VERCEL));

// One file per process so parallel build workers never seed the same file at once.
const demoFile = path.join(tmpdir(), `baa-demo-${process.pid}.db`).replaceAll("\\", "/");
const url = process.env.DATABASE_URL ?? (demoMode ? `file:${demoFile}` : "file:./data/baa.db");

const globalForDb = globalThis as unknown as { __baaDb?: ReturnType<typeof createDb>; __baaSeed?: Promise<void> };

function createDb() {
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  return drizzle(client, { schema });
}

export const db = globalForDb.__baaDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__baaDb = db;

if (demoMode) {
  globalForDb.__baaSeed ??= import("./seed-core").then(({ seedDatabase }) => seedDatabase(db, { bcryptRounds: 4, quiet: true }));
  await globalForDb.__baaSeed;
}

export { schema };

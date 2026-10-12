import { count } from "drizzle-orm";
import type { SQLiteTable } from "drizzle-orm/sqlite-core";
import * as s from "../src/db/schema";
import { connect } from "./db-connect";

/**
 * Read-only health check for a database before any admin recovery.
 * Prints which database it reached, how much content it holds and which admin accounts exist.
 * Writes nothing and never prints password hashes or tokens.
 *
 *   DATABASE_URL=... DATABASE_AUTH_TOKEN=... npm run admin:check
 */
const { db, label } = connect();

async function main() {
  console.log("Database:", label);
  const tally = async (t: SQLiteTable) => (await db.select({ n: count() }).from(t))[0].n;
  console.log("Content:", {
    athletes: await tally(s.athletes),
    results: await tally(s.results),
    news: await tally(s.news),
    events: await tally(s.events),
    competitions: await tally(s.competitions),
  });
  const users = await db
    .select({ email: s.users.email, role: s.users.role, active: s.users.active, lastLoginAt: s.users.lastLoginAt })
    .from(s.users);
  console.log(`Accounts (${users.length}):`);
  for (const u of users) console.log(`  ${u.email.padEnd(28)} ${u.role.padEnd(16)} ${u.active ? "active" : "INACTIVE"}  last sign-in: ${u.lastLoginAt?.toISOString() ?? "never"}`);
}

main().then(() => process.exit(0), (e) => {
  console.error("Could not read the database:", e instanceof Error ? e.message : e);
  process.exit(1);
});

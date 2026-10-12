import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import * as s from "./schema";
import { seedDatabase } from "./seed-core";

const url = process.env.DATABASE_URL ?? "file:./data/baa.db";
if (url.startsWith("file:")) mkdirSync("./data", { recursive: true });

const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
const db = drizzle(client, { schema: s });

// Seeding wipes every table. Refuse to run against a database that already has accounts unless
// the operator explicitly opts in, so a stray `db:seed` can never erase a live database.
async function guard() {
  const existing = await client.execute("SELECT count(*) AS n FROM sqlite_master WHERE type = 'table' AND name = 'users'");
  if (!Number(existing.rows[0]?.n)) return;
  const users = await client.execute("SELECT count(*) AS n FROM users");
  if (Number(users.rows[0]?.n) > 0 && process.env.SEED_ALLOW_WIPE !== "1") {
    console.error("This database already has accounts and content. Seeding would erase all of it.");
    console.error("Nothing was changed. To reset a local copy on purpose, set SEED_ALLOW_WIPE=1.");
    process.exit(1);
  }
}

console.log("→ seeding", url.startsWith("file:") ? url : new URL(url).host);
guard()
  .then(() => seedDatabase(db))
  .then(({ generatedAdminPassword }) => {
    if (generatedAdminPassword) {
      console.log("\nAdmin accounts (superadmin@baa.demo, admin@baa.demo, ...) were created with this password.");
      console.log("It is shown once and is not stored anywhere in plain text:\n");
      console.log("  " + generatedAdminPassword + "\n");
      console.log("Change it after first sign-in, or re-seed with SEED_ADMIN_PASSWORD set.");
    }
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

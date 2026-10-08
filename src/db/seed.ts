import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { mkdirSync } from "node:fs";
import * as s from "./schema";
import { seedDatabase } from "./seed-core";

const url = process.env.DATABASE_URL ?? "file:./data/baa.db";
if (url.startsWith("file:")) mkdirSync("./data", { recursive: true });

const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
const db = drizzle(client, { schema: s });

console.log("→ seeding", url);
seedDatabase(db)
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

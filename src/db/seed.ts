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
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

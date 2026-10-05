import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const url = process.env.DATABASE_URL ?? "file:./data/baa.db";

const globalForDb = globalThis as unknown as { __baaDb?: ReturnType<typeof createDb> };

function createDb() {
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  return drizzle(client, { schema });
}

export const db = globalForDb.__baaDb ?? createDb();
if (process.env.NODE_ENV !== "production") globalForDb.__baaDb = db;

export { schema };

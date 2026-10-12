import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as s from "../src/db/schema";

/** Shared by the admin maintenance scripts. Reads DATABASE_URL / DATABASE_AUTH_TOKEN from the environment. */
export function connect() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error("DATABASE_URL is not set. Point it at the database you want to inspect (for example your Turso URL).");
    process.exit(1);
  }
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  return { db: drizzle(client, { schema: s }), client, label: describe(url) };
}

/** Host and database name only: never prints the auth token or query-string secrets. */
function describe(url: string) {
  if (url.startsWith("file:")) return url;
  try {
    const u = new URL(url);
    return `${u.protocol}//${u.host}`;
  } catch {
    return "(unparseable DATABASE_URL)";
  }
}

/** Reads a line from the terminal without echoing it. */
export function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const { stdin, stdout } = process;
    if (!stdin.isTTY) return reject(new Error("Run this in an interactive terminal so the password can be typed without echo."));
    stdout.write(question);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    let value = "";
    const onData = (ch: string) => {
      for (const c of ch) {
        if (c === "\r" || c === "\n") {
          stdin.setRawMode(false);
          stdin.pause();
          stdin.off("data", onData);
          stdout.write("\n");
          return resolve(value);
        }
        if (c === "\u0003") {
          stdout.write("\n");
          process.exit(130);
        }
        if (c === "\u007f" || c === "\b") value = value.slice(0, -1);
        else value += c;
      }
    };
    stdin.on("data", onData);
  });
}

export async function promptLine(question: string): Promise<string> {
  const rl = (await import("node:readline/promises")).createInterface({ input: process.stdin, output: process.stdout });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

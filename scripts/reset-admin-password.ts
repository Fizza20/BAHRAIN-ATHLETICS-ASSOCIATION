import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import * as s from "../src/db/schema";
import { connect, promptHidden, promptLine } from "./db-connect";

/**
 * One-time password reset for a single existing account.
 *
 *   DATABASE_URL=... DATABASE_AUTH_TOKEN=... npm run admin:reset-password -- superadmin@baa.demo
 *
 * - Changes only that account's password hash and signs out its sessions. No other row is touched.
 * - The new password is typed into a hidden prompt: it is never a command-line argument or an
 *   environment variable, so it does not end up in shell history, logs or Git.
 * - Asks you to retype the database host and the email before writing anything.
 */
const email = process.argv[2]?.toLowerCase().trim();
if (!email) {
  console.error("Usage: npm run admin:reset-password -- <email>");
  process.exit(1);
}
const { db, label } = connect();

async function main() {
  const [user] = await db.select({ id: s.users.id, email: s.users.email, role: s.users.role, active: s.users.active }).from(s.users).where(eq(s.users.email, email!)).limit(1);
  if (!user) throw new Error(`No account with email ${email} in ${label}. Nothing was changed.`);
  console.log(`Database: ${label}`);
  console.log(`Account:  ${user.email} (${user.role}, ${user.active ? "active" : "inactive"})`);

  if ((await promptLine(`Type the account email again to confirm: `)).toLowerCase() !== user.email) throw new Error("Email did not match. Nothing was changed.");

  const pw = await promptHidden("New password (12 to 72 characters, hidden): ");
  if (pw.length < 12 || pw.length > 72) throw new Error("Password must be 12 to 72 characters. Nothing was changed.");
  if ((await promptHidden("Repeat new password: ")) !== pw) throw new Error("Passwords did not match. Nothing was changed.");

  const hash = await bcrypt.hash(pw, 12);
  await db.transaction(async (tx) => {
    await tx.update(s.users).set({ passwordHash: hash }).where(eq(s.users.id, user.id));
    await tx.delete(s.sessions).where(eq(s.sessions.userId, user.id));
    await tx.insert(s.activityLog).values({ userId: user.id, action: "password_reset", entity: "user", entityId: user.id, label: `${user.email} (maintenance script)` });
  });
  console.log(`Password updated for ${user.email}. Its existing sessions were signed out. No other data was changed.`);
}

main().then(() => process.exit(0), (e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});

import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { and, eq, gt, lt } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db, schema as s } from "@/db";
import { can, type Action, type Resource } from "./permissions";
import { SESSION_COOKIE } from "./session-cookie";
import { UserError } from "./errors";

/**
 * DB-backed sessions. The cookie holds a random 256-bit token; the database stores
 * only its SHA-256, so a leaked DB can't be replayed as a cookie. Cookies are
 * httpOnly, SameSite=Lax and Secure in production.
 */
export { SESSION_COOKIE };
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

async function sha256(input: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Buffer.from(buf).toString("hex");
}

export async function createSession(userId: number) {
  const token = Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await db.delete(s.sessions).where(lt(s.sessions.expiresAt, new Date())); // purge expired sessions
  await db.insert(s.sessions).values({ id: await sha256(token), userId, expiresAt });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(s.sessions).where(eq(s.sessions.id, await sha256(token)));
  jar.delete(SESSION_COOKIE);
}

export const getCurrentUser = cache(async () => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const [row] = await db
    .select({ user: s.users })
    .from(s.sessions)
    .innerJoin(s.users, eq(s.sessions.userId, s.users.id))
    .where(and(eq(s.sessions.id, await sha256(token)), gt(s.sessions.expiresAt, new Date()), eq(s.users.active, true)))
    .limit(1);
  if (!row) return null;
  const { passwordHash: _omit, ...user } = row.user;
  void _omit;
  return user;
});

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** For admin pages: redirect to login if signed out, to /admin if not permitted. */
export async function requireUser(resource?: Resource, action: Action = "read") {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (resource && !can(user.role, resource, action)) redirect("/admin?denied=" + resource);
  return user;
}

/** For server actions: throws instead of redirecting so the caller can show an error. */
export async function assertCan(resource: Resource, action: Action) {
  const user = await getCurrentUser();
  if (!user) throw new UserError("You are signed out. Please sign in again.");
  if (!can(user.role, resource, action)) throw new UserError("Your role doesn't allow this action.");
  return user;
}

export async function verifyCredentials(email: string, password: string) {
  const [user] = await db.select().from(s.users).where(eq(s.users.email, email.toLowerCase().trim())).limit(1);
  // Always run bcrypt to keep timing similar whether or not the email exists.
  const ok = await bcrypt.compare(password, user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinv");
  if (!user || !ok || !user.active) return null;
  return user;
}

export async function logActivity(userId: number | null, action: string, entity: string, entityId?: number | null, label?: string) {
  await db.insert(s.activityLog).values({ userId, action, entity, entityId: entityId ?? null, label: label ?? null });
}

"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema as s } from "@/db";
import { createSession, destroySession, getCurrentUser, logActivity, verifyCredentials } from "@/lib/auth";
import { clientIp, rateLimit, resetRateLimit } from "@/lib/security/rate-limit";
import type { FormState } from "./helpers";

const loginSchema = z.object({
  email: z.email("Enter a valid email address").max(200),
  password: z.string().min(1, "Enter your password").max(200),
  next: z.string().optional(),
});

function safeNext(next?: string) {
  if (!next) return "/admin";
  // Only allow same-origin admin paths: blocks //evil.com and /\evil.com open redirects.
  if (!next.startsWith("/admin") || next.startsWith("//") || next.includes("\\") || next.startsWith("/admin/login")) return "/admin";
  return next;
}

export async function loginAction(_: FormState, fd: FormData): Promise<FormState> {
  const parsed = loginSchema.safeParse({
    email: fd.get("email") ?? "",
    password: fd.get("password") ?? "",
    next: (fd.get("next") as string) || undefined,
  });
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, errors };
  }
  // Brute-force protection: per IP+account and per IP overall, 15-minute windows.
  const ip = await clientIp();
  const acct = `login:${ip}:${parsed.data.email.toLowerCase().trim()}`;
  const byAccount = rateLimit(acct, { limit: 5, windowMs: 15 * 60_000 });
  const byIp = rateLimit(`login-ip:${ip}`, { limit: 30, windowMs: 15 * 60_000 });
  if (!byAccount.ok || !byIp.ok) {
    const mins = Math.ceil(Math.max(byAccount.retryAfterSec, byIp.retryAfterSec) / 60);
    return { ok: false, message: `Too many sign-in attempts. Try again in ${mins} minute${mins === 1 ? "" : "s"}.` };
  }
  const user = await verifyCredentials(parsed.data.email, parsed.data.password);
  if (user) resetRateLimit(acct);
  if (!user) {
    // Generic: never reveal whether the email exists or the account is inactive.
    return { ok: false, message: "Email or password is incorrect." };
  }
  await db.update(s.users).set({ lastLoginAt: new Date() }).where(eq(s.users.id, user.id));
  await createSession(user.id);
  await logActivity(user.id, "login", "user", user.id, user.name);
  redirect(safeNext(parsed.data.next));
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) await logActivity(user.id, "logout", "user", user.id, user.name);
  await destroySession();
  redirect("/admin/login");
}

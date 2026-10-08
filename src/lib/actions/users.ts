"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db, schema as s } from "@/db";
import { ROLES } from "@/db/schema";
import { assertCan, logActivity } from "@/lib/auth";
import { errorMessage, f, formId, isUniqueViolation, parseForm, parseId, revalidate, toastUrl, type ActionResult, type FormState } from "./helpers";

// bcrypt only reads the first 72 bytes, so longer passwords would be silently truncated: cap it.
const password = z
  .string({ error: "Password is required" })
  .min(12, "Use at least 12 characters")
  .max(72, "Keep it under 72 characters")
  .refine((v) => /[a-z]/i.test(v) && /\d/.test(v), "Include at least one letter and one number")
  .refine((v) => v !== "baa-demo-2026", "That is the public demo password. Choose another.");

const createSchema = z.object({
  name: f.str(120, "Name is required"),
  email: z.email("Enter a valid email address").max(200).transform((v) => v.toLowerCase().trim()),
  role: f.enum(ROLES, "Choose a role"),
  password,
});

const updateSchema = z.object({
  name: f.str(120, "Name is required"),
  email: z.email("Enter a valid email address").max(200).transform((v) => v.toLowerCase().trim()),
  role: f.enum(ROLES, "Choose a role"),
  active: f.bool(),
});

const resetSchema = z
  .object({ password, confirm: z.string() })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Passwords don’t match" });

const emailTaken = { ok: false, message: "Please fix the highlighted fields.", errors: { email: "A user with this email already exists." } };

export async function saveUser(_: FormState, fd: FormData): Promise<FormState> {
  let me, id;
  try {
    me = await assertCan("users", "write");
    id = formId(fd);
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }

  if (!id) {
    const parsed = parseForm(createSchema, fd);
    if (!parsed.ok) return parsed.state;
    const { password: pw, ...rest } = parsed.data;
    try {
      const [row] = await db
        .insert(s.users)
        .values({ ...rest, passwordHash: await bcrypt.hash(pw, 12) })
        .returning({ id: s.users.id });
      await logActivity(me.id, "created", "user", row.id, rest.name);
    } catch (e) {
      if (isUniqueViolation(e, "email")) return emailTaken;
      return { ok: false, message: errorMessage(e) };
    }
    revalidate(["/admin/users"]);
    redirect(toastUrl("/admin/users", `${rest.name} can now sign in.`));
  }

  const parsed = parseForm(updateSchema, fd);
  if (!parsed.ok) return parsed.state;
  const d = parsed.data;
  if (id === me.id) {
    if (!d.active) return { ok: false, message: "You can’t deactivate your own account.", errors: { active: "You can’t deactivate yourself" } };
    if (d.role !== me.role) return { ok: false, message: "You can’t change your own role. Ask another Super Admin.", errors: { role: "You can’t change your own role" } };
  }
  try {
    const rows = await db.update(s.users).set(d).where(eq(s.users.id, id)).returning({ id: s.users.id });
    if (!rows.length) return { ok: false, message: "This user no longer exists." };
  } catch (e) {
    if (isUniqueViolation(e, "email")) return emailTaken;
    return { ok: false, message: errorMessage(e) };
  }
  if (!d.active) await db.delete(s.sessions).where(eq(s.sessions.userId, id)); // sign them out everywhere
  await logActivity(me.id, "updated", "user", id, d.name);
  revalidate(["/admin/users"]);
  redirect(toastUrl("/admin/users", `${d.name} updated.`));
}

export async function resetPassword(_: FormState, fd: FormData): Promise<FormState> {
  let me, id;
  try {
    me = await assertCan("users", "write");
    id = parseId(fd.get("id"));
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
  const parsed = parseForm(resetSchema, fd);
  if (!parsed.ok) return parsed.state;
  const rows = await db
    .update(s.users)
    .set({ passwordHash: await bcrypt.hash(parsed.data.password, 12) })
    .where(eq(s.users.id, id))
    .returning({ name: s.users.name });
  if (!rows.length) return { ok: false, message: "This user no longer exists." };
  if (id !== me.id) await db.delete(s.sessions).where(eq(s.sessions.userId, id));
  await logActivity(me.id, "updated", "user", id, `Password reset for ${rows[0].name}`);
  return { ok: true, message: `Password reset. ${id !== me.id ? `${rows[0].name} has been signed out of all sessions.` : ""}` };
}

export async function setUserActive(rawId: number, active: boolean): Promise<ActionResult> {
  try {
    const me = await assertCan("users", "write");
    const id = parseId(rawId);
    if (id === me.id && !active) return { ok: false, message: "You can’t deactivate your own account." };
    const rows = await db.update(s.users).set({ active: !!active }).where(eq(s.users.id, id)).returning({ name: s.users.name });
    if (!rows.length) return { ok: false, message: "User not found." };
    if (!active) await db.delete(s.sessions).where(eq(s.sessions.userId, id));
    await logActivity(me.id, "updated", "user", id, `${active ? "Activated" : "Deactivated"} ${rows[0].name}`);
    revalidate(["/admin/users"]);
    return { ok: true, message: `${rows[0].name} ${active ? "activated" : "deactivated"}.` };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

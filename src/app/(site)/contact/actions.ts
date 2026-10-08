"use server";

import { z } from "zod";
import { db, schema as s } from "@/db";
import type { TFn } from "@/lib/i18n/dict";
import { getT } from "@/lib/i18n/server";
import { clientIp, rateLimit } from "@/lib/security/rate-limit";

const makeSchema = (t: TFn) =>
  z.object({
    firstName: z.string().trim().min(1, t("contactAction.firstName")).max(80),
    lastName: z.string().trim().min(1, t("contactAction.lastName")).max(80),
    email: z.email(t("contactAction.email")).max(160),
    topic: z.enum(["general", "athletes", "events", "media", "integrity"]),
    body: z.string().trim().min(10, t("contactAction.body")).max(4000),
    company: z.string().max(0).optional(), // honeypot
  });

export type ContactState = { ok: boolean; errors?: Partial<Record<string, string>>; message?: string; values?: Record<string, string> };

export async function sendMessage(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const { t } = await getT();
  const Schema = makeSchema(t);
  const raw = Object.fromEntries(formData.entries()) as Record<string, string>;
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const issue of parsed.error.issues) errors[String(issue.path[0])] ??= issue.message;
    if (errors.company) return { ok: true, message: t("contactAction.thanks") };
    return { ok: false, errors, values: raw };
  }

  const ip = await clientIp();
  const burst = rateLimit(`contact-burst:${ip}`, { limit: 3, windowMs: 60_000 });
  const hourly = rateLimit(`contact-hour:${ip}`, { limit: 15, windowMs: 60 * 60_000 });
  if (!burst.ok || !hourly.ok) return { ok: false, message: t("contactAction.tooMany"), values: raw };

  const { company: _hp, ...data } = parsed.data;
  void _hp;
  await db.insert(s.messages).values(data);
  return { ok: true, message: t("contactAction.success") };
}

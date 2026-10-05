"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { db, schema as s } from "@/db";
import type { TFn } from "@/lib/i18n/dict";
import { getT } from "@/lib/i18n/server";

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

// Simple per-instance rate limit; production would use Cloudflare/edge rate limiting.
const hits = new Map<string, number[]>();

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

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= 5) return { ok: false, message: t("contactAction.tooMany"), values: raw };
  hits.set(ip, [...recent, now]);

  const { company: _hp, ...data } = parsed.data;
  void _hp;
  await db.insert(s.messages).values(data);
  return { ok: true, message: t("contactAction.success") };
}

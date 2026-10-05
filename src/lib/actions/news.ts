"use server";

import { z } from "zod";
import { and, eq, inArray, ne } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { CONTENT_STATUS, NEWS_CATEGORIES } from "@/db/schema";
import { assertCan, logActivity } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { errorMessage, f, parseIds, removeRows, revalidate, saveRow, today, type ActionResult, type FormState } from "./helpers";

const schema = z.object({
  title: f.str(200, "Title is required"),
  slug: f.slug(),
  excerpt: f.optStr(400),
  body: f.optStr(50000),
  category: f.enum(NEWS_CATEGORIES),
  imageUrl: f.optUrl(),
  author: f.optStr(120),
  status: f.enum(CONTENT_STATUS).optional(),
  featured: f.bool(),
  publishedAt: f.optDate(),
  competitionId: f.optId(),
  athleteIds: z.preprocess((v) => (v === undefined ? [] : Array.isArray(v) ? v : [v]), z.array(z.coerce.number().int().positive()).max(50)),
  isDemo: f.bool(),
  sourceUrl: f.optUrl(),
});

const INTENT_STATUS: Record<string, (typeof CONTENT_STATUS)[number]> = { draft: "draft", review: "review", publish: "published" };

const paths = (slug?: unknown) => ["/", "/news", slug ? `/news/${slug}` : null, "/athletes"];

export async function saveNews(_: FormState, fd: FormData) {
  return saveRow(
    {
      resource: "news",
      table: s.news,
      schema,
      entity: "news",
      listPath: "/admin/news",
      label: (d) => d.title,
      paths: (d, old) => [...paths(d.slug), old && `/news/${old.slug}`, "/athletes/[slug]"],
      unique: { column: "slug", field: "slug", message: "Another story already uses this slug." },
      hasUpdatedAt: true,
      prepare: (d, { user, old, fd }) => {
        const intent = String(fd.get("intent") ?? "");
        const status = INTENT_STATUS[intent] ?? d.status ?? (old?.status as string) ?? "draft";
        const canPublish = can(user.role, "news", "publish");
        if (!canPublish) {
          if (old?.status === "published") return { ok: false, message: "This story is live. Only content managers and administrators can edit published stories." };
          if (status === "published") return { ok: false, message: "Your role can save drafts or submit for review, but not publish." };
        }
        const { athleteIds: _ids, ...rest } = d;
        void _ids;
        return {
          ...rest,
          status,
          author: d.author ?? (old?.author as string | null) ?? user.name,
          publishedAt: status === "published" ? (d.publishedAt ?? today()) : d.publishedAt,
          ...(old ? {} : { createdById: user.id }),
        };
      },
      after: async (id, _values, { fd }) => {
        const ids = schema.shape.athleteIds.parse(fd.getAll("athleteIds"));
        await db.delete(s.newsAthletes).where(eq(s.newsAthletes.newsId, id));
        if (ids.length) await db.insert(s.newsAthletes).values(ids.map((athleteId) => ({ newsId: id, athleteId })));
      },
      verb: (v, old) => {
        if (v.status === "published" && old?.status !== "published") return "published";
        if (v.status === "review" && old?.status !== "review") return "submitted";
        return null;
      },
    },
    fd,
  );
}

const del = {
  resource: "news" as const,
  table: s.news,
  entity: "news",
  label: (r: Record<string, unknown>) => String(r.title),
  paths: (rows: Record<string, unknown>[]) => [...paths(), ...rows.map((r) => `/news/${r.slug}`), "/admin/news"],
};

export async function deleteNews(id: number): Promise<ActionResult> {
  return removeRows(del, id);
}
export async function bulkDeleteNews(ids: number[]): Promise<ActionResult> {
  return removeRows(del, ids);
}

export async function bulkPublishNews(raw: number[]): Promise<ActionResult> {
  try {
    const user = await assertCan("news", "publish");
    const ids = parseIds(raw);
    const rows = await db
      .update(s.news)
      .set({ status: "published", updatedAt: new Date() })
      .where(and(inArray(s.news.id, ids), ne(s.news.status, "published")))
      .returning({ id: s.news.id, slug: s.news.slug, publishedAt: s.news.publishedAt, title: s.news.title });
    const missingDate = rows.filter((r) => !r.publishedAt).map((r) => r.id);
    if (missingDate.length) await db.update(s.news).set({ publishedAt: today() }).where(inArray(s.news.id, missingDate));
    for (const r of rows) await logActivity(user.id, "published", "news", r.id, r.title);
    revalidate([...paths(), ...rows.map((r) => `/news/${r.slug}`), "/admin/news", "/admin"]);
    return { ok: true, message: rows.length ? `${rows.length} stor${rows.length === 1 ? "y" : "ies"} published.` : "Those stories were already published." };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

export async function bulkUnpublishNews(raw: number[]): Promise<ActionResult> {
  try {
    const user = await assertCan("news", "publish");
    const ids = parseIds(raw);
    const rows = await db
      .update(s.news)
      .set({ status: "draft", updatedAt: new Date() })
      .where(and(inArray(s.news.id, ids), eq(s.news.status, "published")))
      .returning({ id: s.news.id, slug: s.news.slug, title: s.news.title });
    await logActivity(user.id, "updated", "news", null, `Unpublished ${rows.length} stories`);
    revalidate([...paths(), ...rows.map((r) => `/news/${r.slug}`), "/admin/news", "/admin"]);
    return { ok: true, message: `${rows.length} stor${rows.length === 1 ? "y" : "ies"} moved back to draft.` };
  } catch (e) {
    return { ok: false, message: errorMessage(e) };
  }
}

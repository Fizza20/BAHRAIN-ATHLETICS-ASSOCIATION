import type { Metadata } from "next";
import { and, count, desc, eq, like, or, type SQL } from "drizzle-orm";
import { Images } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { bulkDeleteMedia, deleteMedia } from "@/lib/actions/media";
import { DemoBadge } from "@/components/ui/badge";
import { BulkScope, DeleteButton, RowCheck, SelectAll } from "@/components/admin/actions";
import { listParams, Pagination } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { AdminImg } from "@/components/admin/admin-img";
import { MediaAddDialog } from "@/components/admin/media-add";

export const metadata: Metadata = { title: "Media" };
const BASE = "/admin/media";

export default async function MediaPage({ searchParams }: PageProps<"/admin/media">) {
  const user = await requireUser("media");
  const { p, q, page, pageSize, offset } = listParams(await searchParams, { sorts: ["created"] as const, sort: "created", pageSize: 24 });
  const canWrite = can(user.role, "media", "write");
  const canDelete = can(user.role, "media", "delete");
  const where: SQL[] = [];
  if (q) where.push(or(like(s.media.title, `%${q}%`), like(s.media.alt, `%${q}%`), like(s.media.tags, `%${q}%`), like(s.media.credit, `%${q}%`))!);
  if (p.kind === "image" || p.kind === "video" || p.kind === "document") where.push(eq(s.media.kind, p.kind));
  if (p.source === "demo") where.push(eq(s.media.isDemo, true));
  if (p.source === "real") where.push(eq(s.media.isDemo, false));
  const w = where.length ? and(...where) : undefined;
  const [rows, [{ n: total }]] = await Promise.all([
    db.select().from(s.media).where(w).orderBy(desc(s.media.createdAt), desc(s.media.id)).limit(pageSize).offset(offset),
    db.select({ n: count() }).from(s.media).where(w),
  ]);
  const bulk = canDelete ? [{ label: "Delete", action: bulkDeleteMedia, confirm: "Remove {n} item(s) from the library? Pages already using these URLs keep working." }] : [];

  return (
    <div>
      <PageHeader eyebrow="Content" title="Media library" description="Images available to news stories, athlete portraits and competition pages." actions={canWrite && <MediaAddDialog />} />
      <Toolbar base={BASE} q={q} placeholder="Search title, alt text, tags or credit" filters={[
        { name: "kind", label: "Kind", options: [{ value: "image", label: "Images" }, { value: "video", label: "Video" }, { value: "document", label: "Documents" }], value: p.kind },
        { name: "source", label: "Data", options: [{ value: "real", label: "BAA uploads" }, { value: "demo", label: "Placeholder" }], value: p.source },
      ]} />
      {rows.length === 0 ? (
        <EmptyState icon={<Images className="size-5" aria-hidden />} title="No media found" description="Add official photography by URL to make it available across the site." action={canWrite && <MediaAddDialog />} />
      ) : (
        <BulkScope actions={bulk}>
          {bulk.length > 0 && (
            <label className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-ink-600">
              <SelectAll ids={rows.map((r) => r.id)} /> Select all on this page
            </label>
          )}
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-6">
            {rows.map((m) => (
              <li key={m.id} className="group relative overflow-hidden rounded-sm border border-line bg-white">
                <div className="relative aspect-[4/3] overflow-hidden bg-ink-950">
                  <AdminImg src={m.url} w={480} alt={m.alt} className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                  {bulk.length > 0 && (
                    <span className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-xs bg-white/95">
                      <RowCheck id={m.id} label={m.title} />
                    </span>
                  )}
                  <span className="absolute right-2 top-2 rounded-xs bg-ink-950/80 px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-white">{m.kind}</span>
                </div>
                <div className="flex items-start gap-2 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-ink-950">
                      <span className="truncate">{m.title}</span>
                      {m.isDemo && <DemoBadge />}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-500" title={m.alt}>{m.alt || <em>No alt text</em>}</p>
                    {m.credit && <p className="mt-1 truncate text-[0.6875rem] text-ink-400">© {m.credit}</p>}
                  </div>
                  {canDelete && <DeleteButton action={deleteMedia} id={m.id} label={m.title} />}
                </div>
              </li>
            ))}
          </ul>
        </BulkScope>
      )}
      <Pagination base={BASE} p={p} page={page} pageSize={pageSize} total={total} />
    </div>
  );
}

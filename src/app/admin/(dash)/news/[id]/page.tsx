import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { Lock } from "lucide-react";
import { db, schema as s } from "@/db";
import { NEWS_CATEGORIES } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { NEWS_CATEGORY_LABEL } from "@/lib/utils";
import { athleteOptions, competitionOptions, mediaItems } from "@/lib/admin-queries";
import { deleteNews, saveNews } from "@/lib/actions/news";
import { DemoBadge } from "@/components/ui/badge";
import { EntityForm, type Section } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/actions";
import { ContentStatus, PageHeader, ViewOnSite } from "@/components/admin/ui";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Edit story" };

export default async function NewsEditPage({ params }: PageProps<"/admin/news/[id]">) {
  const user = await requireUser("news", "write");
  const id = editId((await params).id);
  const n = id ? (await db.select().from(s.news).where(eq(s.news.id, id)))[0] : null;
  if (id && !n) notFound();
  const [athletes, competitions, media, links] = await Promise.all([
    athleteOptions(),
    competitionOptions(),
    mediaItems(),
    n ? db.select({ id: s.newsAthletes.athleteId }).from(s.newsAthletes).where(eq(s.newsAthletes.newsId, n.id)) : Promise.resolve([]),
  ]);
  const canPublish = can(user.role, "news", "publish");
  const locked = !canPublish && n?.status === "published";

  const statusOptions = canPublish
    ? [{ value: "draft", label: "Draft" }, { value: "review", label: "In review" }, { value: "published", label: "Published" }]
    : [{ value: "draft", label: "Draft" }, { value: "review", label: "In review" }];

  const sections: Section[] = [
    {
      title: "Story",
      description: "Separate paragraphs in the body with a blank line.",
      fields: [
        { name: "title", label: "Headline", type: "text", required: true },
        { name: "slug", label: "Slug", type: "slug", from: "title", prefix: "/news/", required: true, hint: "Generated from the headline. Edit it to customise the URL." },
        { name: "excerpt", label: "Excerpt", type: "textarea", rows: 2, hint: "One or two sentences used on cards and in search results." },
        { name: "body", label: "Body", type: "textarea", rows: 14 },
      ],
    },
    {
      title: "Image",
      fields: [{ name: "imageUrl", label: "Lead image", type: "image", hint: "Pick from the media library or paste an image URL." }],
    },
    {
      title: "Links",
      description: "Tagged athletes show this story on their profile.",
      fields: [
        { name: "category", label: "Category", type: "select", required: true, span: "half", options: NEWS_CATEGORIES.map((c) => ({ value: c, label: NEWS_CATEGORY_LABEL[c] })) },
        { name: "competitionId", label: "Related competition", type: "select", emptyLabel: "None", span: "half", options: competitions },
        { name: "athleteIds", label: "Related athletes", type: "multi", options: athletes },
      ],
    },
    {
      title: "Publishing",
      description: canPublish ? "Choose a status and save, or publish directly." : "Save as a draft or submit for review. A content manager will publish it.",
      fields: [
        ...(canPublish ? [{ name: "status", label: "Status", type: "select" as const, required: true, span: "third" as const, options: statusOptions }] : []),
        { name: "publishedAt", label: "Publish date", type: "date", span: "third", hint: canPublish ? "Defaults to today when published." : undefined },
        { name: "author", label: "Author / byline", type: "text", span: canPublish ? "third" : "two-thirds", placeholder: user.name },
        { name: "featured", label: "Feature on the homepage", type: "checkbox", span: "half" },
        { name: "isDemo", label: "Demo / placeholder", type: "checkbox", span: "half" },
        { name: "sourceUrl", label: "Source URL", type: "url", mono: true, placeholder: "https://www.baa.bh/post/…" },
      ],
    },
  ];

  const intents = canPublish
    ? [
        { value: "save", label: n ? "Save" : "Save", variant: "secondary" as const },
        { value: "publish", label: n?.status === "published" ? "Update live story" : "Publish now", variant: "primary" as const },
      ]
    : [
        { value: "draft", label: "Save draft", variant: "secondary" as const },
        { value: "review", label: "Submit for review", variant: "primary" as const },
      ];

  return (
    <div>
      <PageHeader
        eyebrow={n ? "Edit story" : "New story"}
        title={<span className="inline-flex flex-wrap items-center gap-3">{n?.title ?? "Write a story"}</span>}
        description={
          n && (
            <span className="inline-flex items-center gap-2">
              <ContentStatus status={n.status} /> {n.isDemo && <DemoBadge />}
            </span>
          )
        }
        actions={
          n && (
            <>
              {n.status === "published" && <ViewOnSite href={`/news/${n.slug}`} />}
              {can(user.role, "news", "delete") && <DeleteButton action={deleteNews} id={n.id} label={n.title} redirectTo="/admin/news" variant="button" />}
            </>
          )
        }
      />
      {locked && (
        <div role="note" className="mb-6 flex items-start gap-3 rounded-sm border border-line bg-white px-4 py-3 text-sm text-ink-700">
          <Lock className="mt-0.5 size-4 shrink-0 text-ink-500" aria-hidden />
          <p>
            <strong className="font-semibold text-ink-950">This story is live.</strong> Editors can’t change published stories. Ask a content manager to unpublish it first.
          </p>
        </div>
      )}
      <EntityForm
        action={saveNews}
        sections={sections}
        media={media}
        hidden={{ id: n?.id }}
        cancelHref="/admin/news"
        intents={intents}
        footerExtra={canPublish ? "Publishing makes the story visible on the site immediately." : "Your role can save drafts and submit them for review."}
        defaults={n ? { ...n, athleteIds: links.map((l) => String(l.id)) } : { category: "federation", status: "draft", athleteIds: [] }}
      />
    </div>
  );
}

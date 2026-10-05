import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { CATEGORY_LABEL } from "@/lib/utils";
import { disciplineOptions, mediaItems } from "@/lib/admin-queries";
import { deleteAthlete, saveAthlete } from "@/lib/actions/athletes";
import { DemoBadge } from "@/components/ui/badge";
import { EntityForm, type Section } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/actions";
import { PageHeader, ViewOnSite } from "@/components/admin/ui";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Edit athlete" };

export default async function AthleteEditPage({ params }: PageProps<"/admin/athletes/[id]">) {
  const user = await requireUser("athletes", "write");
  const id = editId((await params).id);
  const a = id ? (await db.select().from(s.athletes).where(eq(s.athletes.id, id)))[0] : null;
  if (id && !a) notFound();
  const [disciplines, media] = await Promise.all([disciplineOptions(), mediaItems()]);

  const sections: Section[] = [
    {
      title: "Identity",
      description: "How the athlete is named across the site. The slug is the public URL.",
      fields: [
        { name: "firstName", label: "First name", type: "text", required: true, span: "half" },
        { name: "lastName", label: "Last name", type: "text", required: true, span: "half" },
        { name: "nameAr", label: "Name in Arabic", type: "text", span: "half", hint: "Shown on the Arabic site." },
        { name: "slug", label: "Slug", type: "slug", from: "firstName,lastName", prefix: "/athletes/", required: true, span: "half" },
      ],
    },
    {
      title: "Classification",
      description: "Used by the public filters and by results.",
      fields: [
        { name: "gender", label: "Gender", type: "select", required: true, span: "third", options: [{ value: "men", label: "Men" }, { value: "women", label: "Women" }] },
        { name: "category", label: "Category", type: "select", required: true, span: "third", options: Object.entries(CATEGORY_LABEL).map(([value, label]) => ({ value, label })) },
        { name: "status", label: "Status", type: "select", required: true, span: "third", options: [{ value: "active", label: "Active" }, { value: "retired", label: "Retired" }] },
        { name: "primaryDisciplineId", label: "Primary discipline", type: "select", emptyLabel: "Not set", options: disciplines, span: "two-thirds" },
        { name: "birthYear", label: "Birth year", type: "number", min: 1900, max: new Date().getFullYear(), span: "third" },
        { name: "club", label: "Club", type: "text" },
      ],
    },
    {
      title: "Profile",
      description: "Headline and biography for the athlete page. Separate paragraphs with a blank line.",
      fields: [
        { name: "headline", label: "Headline", type: "text", placeholder: "Asian record holder, 5000m" },
        { name: "bio", label: "Biography", type: "textarea", rows: 7 },
        { name: "imageUrl", label: "Portrait", type: "image", hint: "Use official BAA photography. Pick from the media library or paste a URL." },
      ],
    },
    {
      title: "Publishing",
      description: "Provenance matters: link the source for every verified fact.",
      fields: [
        { name: "featured", label: "Feature on the homepage", type: "checkbox", span: "half" },
        { name: "isDemo", label: "Demo / placeholder profile", type: "checkbox", span: "half", hint: "Labelled “Demo” on the site." },
        { name: "sourceUrl", label: "Source URL", type: "url", placeholder: "https://www.baa.bh/…", mono: true },
      ],
    },
  ];

  const name = a ? `${a.firstName} ${a.lastName}` : "New athlete";
  return (
    <div>
      <PageHeader
        eyebrow={a ? "Edit athlete" : "Create athlete"}
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            {name}
            {a?.isDemo && <DemoBadge />}
          </span>
        }
        actions={
          a && (
            <>
              <ViewOnSite href={`/athletes/${a.slug}`} />
              {can(user.role, "athletes", "delete") && <DeleteButton action={deleteAthlete} id={a.id} label={name} redirectTo="/admin/athletes" variant="button" />}
            </>
          )
        }
      />
      <EntityForm
        action={saveAthlete}
        sections={sections}
        media={media}
        hidden={{ id: a?.id }}
        cancelHref="/admin/athletes"
        submitLabel={a ? "Save athlete" : "Create athlete"}
        defaults={a ?? { gender: "men", category: "senior", status: "active", isDemo: false }}
      />
    </div>
  );
}

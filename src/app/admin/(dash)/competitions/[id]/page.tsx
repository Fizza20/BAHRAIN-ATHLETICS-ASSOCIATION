import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { COMPETITION_LEVEL, COMPETITION_STATUS } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { LEVEL_LABEL } from "@/lib/utils";
import { STATUS_LABEL } from "@/lib/status";
import { mediaItems } from "@/lib/admin-queries";
import { deleteCompetition, saveCompetition } from "@/lib/actions/competitions";
import { DemoBadge } from "@/components/ui/badge";
import { EntityForm, type Section } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/actions";
import { PageHeader, ViewOnSite } from "@/components/admin/ui";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Edit competition" };

export default async function CompetitionEditPage({ params }: PageProps<"/admin/competitions/[id]">) {
  const user = await requireUser("competitions", "write");
  const id = editId((await params).id);
  const c = id ? (await db.select().from(s.competitions).where(eq(s.competitions.id, id)))[0] : null;
  if (id && !c) notFound();
  const media = await mediaItems();

  const sections: Section[] = [
    {
      title: "Competition",
      description: "Official name, short label used in results tables, and level.",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "shortName", label: "Short name", type: "text", span: "half", placeholder: "DL Final Brussels" },
        { name: "level", label: "Level", type: "select", required: true, span: "half", options: COMPETITION_LEVEL.map((l) => ({ value: l, label: LEVEL_LABEL[l] })) },
        { name: "slug", label: "Slug", type: "slug", from: "name", prefix: "/competitions/", required: true },
      ],
    },
    {
      title: "When & where",
      description: "Status is derived from the dates on the site; set Postponed or Cancelled to override.",
      fields: [
        { name: "startDate", label: "Start date", type: "date", span: "third" },
        { name: "endDate", label: "End date", type: "date", span: "third" },
        { name: "status", label: "Status", type: "select", required: true, span: "third", options: COMPETITION_STATUS.map((v) => ({ value: v, label: STATUS_LABEL[v] })) },
        { name: "venue", label: "Venue", type: "text" },
        { name: "city", label: "City", type: "text", span: "half" },
        { name: "country", label: "Country", type: "text", span: "half" },
      ],
    },
    {
      title: "Details",
      fields: [
        { name: "description", label: "Description", type: "textarea", rows: 5 },
        { name: "imageUrl", label: "Image", type: "image" },
      ],
    },
    {
      title: "Provenance",
      fields: [
        { name: "isDemo", label: "Demo / placeholder", type: "checkbox", hint: "Labelled “Demo” on the site." },
        { name: "sourceUrl", label: "Source URL", type: "url", mono: true, placeholder: "https://…" },
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={c ? "Edit competition" : "Create competition"}
        title={<span className="inline-flex flex-wrap items-center gap-3">{c?.name ?? "New competition"}{c?.isDemo && <DemoBadge />}</span>}
        actions={
          c && (
            <>
              <ViewOnSite href={`/competitions/${c.slug}`} />
              {can(user.role, "competitions", "delete") && <DeleteButton action={deleteCompetition} id={c.id} label={c.name} redirectTo="/admin/competitions" variant="button" />}
            </>
          )
        }
      />
      <EntityForm
        action={saveCompetition}
        sections={sections}
        media={media}
        hidden={{ id: c?.id }}
        cancelHref="/admin/competitions"
        submitLabel={c ? "Save competition" : "Create competition"}
        defaults={c ?? { level: "meeting", status: "upcoming" }}
      />
    </div>
  );
}

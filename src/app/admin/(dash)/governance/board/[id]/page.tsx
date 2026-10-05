import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { mediaItems } from "@/lib/admin-queries";
import { deleteBoardMember, saveBoardMember } from "@/lib/actions/governance";
import { DemoBadge } from "@/components/ui/badge";
import { EntityForm, type Section } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/actions";
import { PageHeader } from "@/components/admin/ui";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Edit board member" };

export default async function BoardEditPage({ params }: PageProps<"/admin/governance/board/[id]">) {
  const user = await requireUser("governance", "write");
  const id = editId((await params).id);
  const b = id ? (await db.select().from(s.boardMembers).where(eq(s.boardMembers.id, id)))[0] : null;
  if (id && !b) notFound();
  const media = await mediaItems();
  const sections: Section[] = [
    {
      title: "Member",
      fields: [
        { name: "name", label: "Full name", type: "text", required: true },
        { name: "title", label: "Position", type: "text", required: true, placeholder: "Vice President" },
        { name: "group", label: "Group", type: "select", required: true, span: "half", options: [{ value: "executive", label: "Executive" }, { value: "committee", label: "Board" }, { value: "administration", label: "Administration" }] },
        { name: "sortOrder", label: "Sort order", type: "number", min: 0, max: 9999, span: "half", hint: "Lower numbers appear first." },
        { name: "imageUrl", label: "Portrait", type: "image" },
      ],
    },
    {
      title: "Provenance",
      fields: [
        { name: "isDemo", label: "Demo / placeholder", type: "checkbox" },
        { name: "sourceUrl", label: "Source URL", type: "url", mono: true },
      ],
    },
  ];
  return (
    <div>
      <PageHeader
        eyebrow={b ? "Edit board member" : "Add board member"}
        title={<span className="inline-flex flex-wrap items-center gap-3">{b?.name ?? "New board member"}{b?.isDemo && <DemoBadge />}</span>}
        actions={b && can(user.role, "governance", "delete") && <DeleteButton action={deleteBoardMember} id={b.id} label={b.name} redirectTo="/admin/governance" variant="button" />}
      />
      <EntityForm action={saveBoardMember} sections={sections} media={media} hidden={{ id: b?.id }} cancelHref="/admin/governance" submitLabel={b ? "Save member" : "Add member"} defaults={b ?? { group: "committee", sortOrder: 0 }} />
    </div>
  );
}

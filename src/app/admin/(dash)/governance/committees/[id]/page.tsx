import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { deleteCommittee, saveCommittee } from "@/lib/actions/governance";
import { DemoBadge } from "@/components/ui/badge";
import { EntityForm, type Section } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/actions";
import { PageHeader } from "@/components/admin/ui";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Edit committee" };

export default async function CommitteeEditPage({ params }: PageProps<"/admin/governance/committees/[id]">) {
  const user = await requireUser("governance", "write");
  const id = editId((await params).id);
  const c = id ? (await db.select().from(s.committees).where(eq(s.committees.id, id)))[0] : null;
  if (id && !c) notFound();
  const sections: Section[] = [
    {
      title: "Committee",
      fields: [
        { name: "name", label: "Name", type: "text", required: true },
        { name: "chair", label: "Chair", type: "text", span: "two-thirds" },
        { name: "sortOrder", label: "Sort order", type: "number", min: 0, max: 9999, span: "third" },
        { name: "remit", label: "Remit", type: "textarea", rows: 4, hint: "What the committee is responsible for." },
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
        eyebrow={c ? "Edit committee" : "Add committee"}
        title={<span className="inline-flex flex-wrap items-center gap-3">{c?.name ?? "New committee"}{c?.isDemo && <DemoBadge />}</span>}
        actions={c && can(user.role, "governance", "delete") && <DeleteButton action={deleteCommittee} id={c.id} label={c.name} redirectTo="/admin/governance?tab=committees" variant="button" />}
      />
      <EntityForm action={saveCommittee} sections={sections} hidden={{ id: c?.id }} cancelHref="/admin/governance?tab=committees" submitLabel={c ? "Save committee" : "Add committee"} defaults={c ?? { sortOrder: 0 }} />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { DOCUMENT_CATEGORIES } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { deleteDocument, saveDocument } from "@/lib/actions/documents";
import { DemoBadge } from "@/components/ui/badge";
import { EntityForm, type Section } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/actions";
import { PageHeader } from "@/components/admin/ui";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Edit document" };
const CAT: Record<string, string> = { governance: "Governance", integrity: "Integrity", competition: "Competition", forms: "Forms", reports: "Reports" };

export default async function DocumentEditPage({ params }: PageProps<"/admin/documents/[id]">) {
  const user = await requireUser("documents", "write");
  const id = editId((await params).id);
  const d = id ? (await db.select().from(s.documents).where(eq(s.documents.id, id)))[0] : null;
  if (id && !d) notFound();
  const sections: Section[] = [
    {
      title: "Document",
      fields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
        { name: "category", label: "Category", type: "select", required: true, span: "third", options: DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: CAT[c] })) },
        { name: "fileType", label: "Format", type: "text", span: "third", placeholder: "PDF" },
        { name: "publishedAt", label: "Published", type: "date", span: "third" },
        { name: "url", label: "File or page URL", type: "url", mono: true, hint: "A full https:// link to the file, or a site path like /clean-athletics/code-of-conduct." },
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
        eyebrow={d ? "Edit document" : "Create document"}
        title={<span className="inline-flex flex-wrap items-center gap-3">{d?.title ?? "New document"}{d?.isDemo && <DemoBadge />}</span>}
        actions={d && can(user.role, "documents", "delete") && <DeleteButton action={deleteDocument} id={d.id} label={d.title} redirectTo="/admin/documents" variant="button" />}
      />
      <EntityForm action={saveDocument} sections={sections} hidden={{ id: d?.id }} cancelHref="/admin/documents" submitLabel={d ? "Save document" : "Create document"} defaults={d ?? { category: "governance", fileType: "PDF" }} />
    </div>
  );
}

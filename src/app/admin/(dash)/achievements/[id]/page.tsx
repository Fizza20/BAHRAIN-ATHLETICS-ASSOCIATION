import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { MEDALS } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { athleteOptions, competitionOptions } from "@/lib/admin-queries";
import { deleteAchievement, saveAchievement } from "@/lib/actions/achievements";
import { DemoBadge } from "@/components/ui/badge";
import { EntityForm, type Section } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/actions";
import { PageHeader } from "@/components/admin/ui";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Edit achievement" };

export default async function AchievementEditPage({ params }: PageProps<"/admin/achievements/[id]">) {
  const user = await requireUser("achievements", "write");
  const id = editId((await params).id);
  const a = id ? (await db.select().from(s.achievements).where(eq(s.achievements.id, id)))[0] : null;
  if (id && !a) notFound();
  const [athletes, competitions] = await Promise.all([athleteOptions(), competitionOptions()]);
  const sections: Section[] = [
    {
      title: "Achievement",
      fields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
        { name: "type", label: "Type", type: "select", required: true, span: "third", options: [{ value: "medal", label: "Medal" }, { value: "record", label: "Record" }, { value: "title", label: "Title" }, { value: "milestone", label: "Milestone" }] },
        { name: "medal", label: "Medal", type: "select", emptyLabel: "None", span: "third", options: MEDALS.map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) })) },
        { name: "year", label: "Year", type: "number", required: true, min: 1950, max: 2100, span: "third" },
        { name: "date", label: "Exact date", type: "date", span: "third" },
      ],
    },
    {
      title: "Links",
      fields: [
        { name: "athleteId", label: "Athlete", type: "select", emptyLabel: "None", options: athletes, span: "half" },
        { name: "competitionId", label: "Competition", type: "select", emptyLabel: "None", options: competitions, span: "half" },
      ],
    },
    {
      title: "Publishing",
      fields: [
        { name: "featured", label: "Feature on the homepage", type: "checkbox", span: "half" },
        { name: "isDemo", label: "Demo / placeholder", type: "checkbox", span: "half" },
        { name: "sourceUrl", label: "Source URL", type: "url", mono: true },
      ],
    },
  ];
  return (
    <div>
      <PageHeader
        eyebrow={a ? "Edit achievement" : "Create achievement"}
        title={<span className="inline-flex flex-wrap items-center gap-3">{a?.title ?? "New achievement"}{a?.isDemo && <DemoBadge />}</span>}
        actions={a && can(user.role, "achievements", "delete") && <DeleteButton action={deleteAchievement} id={a.id} label={a.title} redirectTo="/admin/achievements" variant="button" />}
      />
      <EntityForm action={saveAchievement} sections={sections} hidden={{ id: a?.id }} cancelHref="/admin/achievements" submitLabel={a ? "Save achievement" : "Create achievement"} defaults={a ?? { type: "medal", year: new Date().getFullYear() }} />
    </div>
  );
}

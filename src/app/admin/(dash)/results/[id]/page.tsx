import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { MEDALS, RECORDS, ROUNDS } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { ROUND_LABEL } from "@/lib/utils";
import { athleteOptions, competitionOptions, disciplineOptions } from "@/lib/admin-queries";
import { deleteResult, saveResult } from "@/lib/actions/results";
import { DemoBadge } from "@/components/ui/badge";
import { EntityForm, type Section } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/actions";
import { PageHeader } from "@/components/admin/ui";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Edit result" };
const RECORD_LABEL: Record<string, string> = { WR: "WR · World record", AR: "AR · Asian record", NR: "NR · National record", WL: "WL · World lead", CR: "CR · Championship record", MR: "MR · Meeting record" };

export default async function ResultEditPage({ params }: PageProps<"/admin/results/[id]">) {
  const user = await requireUser("results", "write");
  const id = editId((await params).id);
  const r = id ? (await db.select().from(s.results).where(eq(s.results.id, id)))[0] : null;
  if (id && !r) notFound();
  const [athletes, competitions, disciplines] = await Promise.all([athleteOptions(), competitionOptions(), disciplineOptions()]);

  const sections: Section[] = [
    {
      title: "Who & where",
      fields: [
        { name: "athleteId", label: "Athlete", type: "select", required: true, emptyLabel: "Choose an athlete…", options: athletes, span: "half" },
        { name: "disciplineId", label: "Discipline", type: "select", required: true, emptyLabel: "Choose a discipline…", options: disciplines, span: "half" },
        { name: "competitionId", label: "Competition", type: "select", emptyLabel: "Not linked", options: competitions, span: "two-thirds" },
        { name: "date", label: "Date", type: "date", required: true, span: "third" },
      ],
    },
    {
      title: "Performance",
      description: "Type the mark as it appears on the result sheet. It is converted to seconds or metres for ranking (e.g. 1:45.30 → 105.30).",
      fields: [
        { name: "mark", label: "Mark", type: "text", span: "third", placeholder: "12:45.70", mono: true },
        { name: "wind", label: "Wind", type: "text", span: "third", placeholder: "+0.8", mono: true },
        { name: "round", label: "Round", type: "select", required: true, span: "third", options: ROUNDS.map((v) => ({ value: v, label: v === "single" ? "Single round" : ROUND_LABEL[v] })) },
        { name: "position", label: "Position", type: "number", min: 1, max: 999, span: "third" },
        { name: "medal", label: "Medal", type: "select", emptyLabel: "None", span: "third", options: MEDALS.map((m) => ({ value: m, label: m[0].toUpperCase() + m.slice(1) })) },
        { name: "record", label: "Record", type: "select", emptyLabel: "None", span: "third", options: RECORDS.map((v) => ({ value: v, label: RECORD_LABEL[v] })) },
        { name: "isSB", label: "Season best (SB)", type: "checkbox" },
        { name: "notes", label: "Notes", type: "textarea", rows: 3 },
      ],
    },
    {
      title: "Provenance",
      description: "Results feed rankings and records. Always link the official result sheet.",
      fields: [
        { name: "sourceUrl", label: "Source URL", type: "url", mono: true, placeholder: "https://worldathletics.org/…" },
        { name: "isDemo", label: "Demo / placeholder", type: "checkbox" },
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={r ? "Edit result" : "Record result"}
        title={<span className="inline-flex flex-wrap items-center gap-3">{r ? `Result · ${r.mark ?? r.date}` : "New result"}{r?.isDemo && <DemoBadge />}</span>}
        actions={r && can(user.role, "results", "delete") && <DeleteButton action={deleteResult} id={r.id} label={`Result ${r.mark ?? ""} (${r.date})`} redirectTo="/admin/results" variant="button" />}
      />
      <EntityForm
        action={saveResult}
        sections={sections}
        hidden={{ id: r?.id }}
        cancelHref="/admin/results"
        submitLabel={r ? "Save result" : "Record result"}
        defaults={r ?? { round: "final", date: new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bahrain" }).format(new Date()) }}
      />
    </div>
  );
}

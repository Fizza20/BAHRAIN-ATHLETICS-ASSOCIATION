import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { COMPETITION_STATUS, EVENT_TYPES } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { STATUS_LABEL } from "@/lib/status";
import { competitionOptions } from "@/lib/admin-queries";
import { deleteEvent, saveEvent } from "@/lib/actions/events";
import { DemoBadge } from "@/components/ui/badge";
import { EntityForm, type Section } from "@/components/admin/form";
import { DeleteButton } from "@/components/admin/actions";
import { PageHeader, ViewOnSite } from "@/components/admin/ui";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Edit event" };
const TYPE_LABEL: Record<string, string> = { participation: "Participation", championship: "Championship", "training-camp": "Training camp", meeting: "Meeting", national: "National", community: "Community" };
/** Stored as Bahrain-time ISO ("2026-09-04T00:00:00+03:00") → datetime-local value. */
const local = (iso?: string | null) => (iso ? iso.slice(0, 16) : "");

export default async function EventEditPage({ params }: PageProps<"/admin/events/[id]">) {
  const user = await requireUser("events", "write");
  const id = editId((await params).id);
  const e = id ? (await db.select().from(s.events).where(eq(s.events.id, id)))[0] : null;
  if (id && !e) notFound();
  const competitions = await competitionOptions();

  const sections: Section[] = [
    {
      title: "Event",
      fields: [
        { name: "title", label: "Title", type: "text", required: true },
        { name: "slug", label: "Slug", type: "slug", from: "title", prefix: "/events/", required: true },
        { name: "type", label: "Type", type: "select", required: true, span: "half", options: EVENT_TYPES.map((t) => ({ value: t, label: TYPE_LABEL[t] })) },
        { name: "competitionId", label: "Linked competition", type: "select", emptyLabel: "None", span: "half", options: competitions },
      ],
    },
    {
      title: "Schedule",
      description: "Times are Bahrain time (UTC+3). Leave the time at 00:00 for all-day events.",
      fields: [
        { name: "startAt", label: "Starts", type: "datetime-local", span: "third" },
        { name: "endAt", label: "Ends", type: "datetime-local", span: "third" },
        { name: "status", label: "Status", type: "select", required: true, span: "third", options: COMPETITION_STATUS.map((v) => ({ value: v, label: STATUS_LABEL[v] })) },
        { name: "timeNote", label: "Time note", type: "text", placeholder: "Session times to be confirmed", hint: "Optional note shown next to the date." },
      ],
    },
    {
      title: "Location",
      fields: [
        { name: "location", label: "Venue", type: "text" },
        { name: "city", label: "City", type: "text", span: "half" },
        { name: "country", label: "Country", type: "text", span: "half" },
        { name: "description", label: "Description", type: "textarea", rows: 5 },
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
        eyebrow={e ? "Edit event" : "Create event"}
        title={<span className="inline-flex flex-wrap items-center gap-3">{e?.title ?? "New event"}{e?.isDemo && <DemoBadge />}</span>}
        actions={
          e && (
            <>
              <ViewOnSite href={`/events/${e.slug}`} />
              {can(user.role, "events", "delete") && <DeleteButton action={deleteEvent} id={e.id} label={e.title} redirectTo="/admin/events" variant="button" />}
            </>
          )
        }
      />
      <EntityForm
        action={saveEvent}
        sections={sections}
        hidden={{ id: e?.id }}
        cancelHref="/admin/events"
        submitLabel={e ? "Save event" : "Create event"}
        defaults={e ? { ...e, startAt: local(e.startAt), endAt: local(e.endAt) } : { type: "participation", status: "upcoming" }}
      />
    </div>
  );
}

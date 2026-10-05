import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft, Mail, MailOpen, Reply } from "lucide-react";
import { db, schema as s } from "@/db";
import { requireUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { deleteMessage, markMessagesRead, markMessagesUnread } from "@/lib/actions/messages";
import { ActionButton, DeleteButton } from "@/components/admin/actions";
import { PageHeader, Panel } from "@/components/admin/ui";
import { dateTime } from "@/components/admin/format";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Message" };

export default async function MessagePage({ params }: PageProps<"/admin/messages/[id]">) {
  const user = await requireUser("messages");
  const id = editId((await params).id);
  if (!id) notFound();
  const [m] = await db.select().from(s.messages).where(eq(s.messages.id, id));
  if (!m) notFound();
  const canWrite = can(user.role, "messages", "write");
  const markRead = markMessagesRead.bind(null, [m.id]);
  const markUnread = markMessagesUnread.bind(null, [m.id]);
  const subject = encodeURIComponent(`Re: your message to the Bahrain Athletics Association`);

  return (
    <div className="max-w-4xl">
      <Link href="/admin/messages" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-500 hover:text-ink-950">
        <ArrowLeft className="size-3.5" aria-hidden /> Back to inbox
      </Link>
      <PageHeader
        eyebrow={`Topic · ${m.topic}`}
        title={`${m.firstName} ${m.lastName}`}
        description={<a href={`mailto:${m.email}`} className="underline-offset-4 hover:underline">{m.email}</a>}
        actions={
          <>
            {canWrite &&
              (m.read ? (
                <ActionButton action={markUnread}><Mail className="size-4" aria-hidden /> Mark unread</ActionButton>
              ) : (
                <ActionButton action={markRead}><MailOpen className="size-4" aria-hidden /> Mark read</ActionButton>
              ))}
            <a href={`mailto:${m.email}?subject=${subject}`} className="inline-flex h-9 items-center gap-2 rounded-xs bg-ink-950 px-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white hover:bg-ink-800">
              <Reply className="size-4" aria-hidden /> Reply by email
            </a>
            {can(user.role, "messages", "delete") && <DeleteButton action={deleteMessage} id={m.id} label={`Message from ${m.firstName} ${m.lastName}`} redirectTo="/admin/messages" />}
          </>
        }
      />
      <Panel title={`Received ${dateTime(m.createdAt)}`} action={<span className={m.read ? "text-xs text-ink-500" : "text-xs font-semibold text-brand-600"}>{m.read ? "Read" : "Unread"}</span>} bodyClassName="p-6">
        <div className="max-w-prose whitespace-pre-line text-[0.9375rem] leading-relaxed text-ink-800">{m.body}</div>
      </Panel>
    </div>
  );
}

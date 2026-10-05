import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { ROLES } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { ROLE_LABEL, ROLE_SUMMARY } from "@/lib/permissions";
import { saveUser } from "@/lib/actions/users";
import { EntityForm, type Section } from "@/components/admin/form";
import { ResetPasswordForm } from "@/components/admin/reset-password";
import { PageHeader, Panel } from "@/components/admin/ui";
import { dateTime } from "@/components/admin/format";
import { editId } from "@/components/admin/edit";

export const metadata: Metadata = { title: "Edit user" };

export default async function UserEditPage({ params }: PageProps<"/admin/users/[id]">) {
  const me = await requireUser("users", "write");
  const id = editId((await params).id);
  const u = id
    ? (await db.select({ id: s.users.id, name: s.users.name, email: s.users.email, role: s.users.role, active: s.users.active, lastLoginAt: s.users.lastLoginAt, createdAt: s.users.createdAt }).from(s.users).where(eq(s.users.id, id)))[0]
    : null;
  if (id && !u) notFound();
  const self = u?.id === me.id;
  const roleOptions = ROLES.map((r) => ({ value: r, label: `${ROLE_LABEL[r]} · ${ROLE_SUMMARY[r]}` }));

  const sections: Section[] = [
    {
      title: "Account",
      fields: [
        { name: "name", label: "Full name", type: "text", required: true, span: "half", autoComplete: "off" },
        { name: "email", label: "Email", type: "email", required: true, span: "half", autoComplete: "off" },
        ...(u ? [] : [{ name: "password", label: "Temporary password", type: "password" as const, required: true, hint: "At least 10 characters. Share it securely; they can change it later.", autoComplete: "new-password" }]),
      ],
    },
    {
      title: "Access",
      description: self ? "You can’t change your own role or deactivate yourself." : "Roles decide which sections a user can see and what they can change.",
      fields: [
        { name: "role", label: "Role", type: "select", required: true, options: roleOptions },
        ...(u ? [{ name: "active", label: "Account active", type: "checkbox" as const, hint: "Unticking signs the user out everywhere." }] : []),
      ],
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={u ? "Edit user" : "Invite user"}
        title={u?.name ?? "New user"}
        description={u ? `Created ${dateTime(u.createdAt)} · Last sign-in ${u.lastLoginAt ? dateTime(u.lastLoginAt) : "never"}` : "Create an account for a member of staff."}
      />
      {u && (
        <Panel title="Reset password" className="mb-6" bodyClassName="p-5">
          <ResetPasswordForm userId={u.id} />
          <p className="mt-3 text-xs text-ink-500">{self ? "This changes your own password." : "The user is signed out of all sessions after a reset."}</p>
        </Panel>
      )}
      <EntityForm action={saveUser} sections={sections} hidden={{ id: u?.id }} cancelHref="/admin/users" submitLabel={u ? "Save user" : "Create user"} defaults={u ?? { role: "editor" }} />
    </div>
  );
}

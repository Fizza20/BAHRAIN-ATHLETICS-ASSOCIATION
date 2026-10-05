import type { Metadata } from "next";
import Link from "next/link";
import { asc, desc, eq, like, or, and, type SQL } from "drizzle-orm";
import { db, schema as s } from "@/db";
import { ROLES } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { ROLE_LABEL } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { setUserActive } from "@/lib/actions/users";
import { ButtonLink } from "@/components/ui/button";
import { ActionButton } from "@/components/admin/actions";
import { flat } from "@/components/admin/list";
import { Toolbar } from "@/components/admin/toolbar";
import { Dot, EditLink, EmptyState, PageHeader, RowActions, Td, Th, TableWrap, trCls } from "@/components/admin/ui";
import { timeAgo } from "@/components/admin/format";

export const metadata: Metadata = { title: "Users" };
const BASE = "/admin/users";

export default async function UsersPage({ searchParams }: PageProps<"/admin/users">) {
  const me = await requireUser("users");
  const p = flat(await searchParams);
  const q = (p.q ?? "").slice(0, 100);
  const where: SQL[] = [];
  if (q) where.push(or(like(s.users.name, `%${q}%`), like(s.users.email, `%${q}%`))!);
  if (p.role && (ROLES as readonly string[]).includes(p.role)) where.push(eq(s.users.role, p.role as "editor"));
  if (p.status === "active") where.push(eq(s.users.active, true));
  if (p.status === "inactive") where.push(eq(s.users.active, false));
  // Never select passwordHash
  const rows = await db
    .select({ id: s.users.id, name: s.users.name, email: s.users.email, role: s.users.role, active: s.users.active, lastLoginAt: s.users.lastLoginAt, createdAt: s.users.createdAt })
    .from(s.users)
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(s.users.active), asc(s.users.name));

  return (
    <div>
      <PageHeader eyebrow="System" title="Users" description="Staff accounts and their roles. Deactivated users are signed out immediately and can’t sign in." actions={<ButtonLink href={`${BASE}/new`} arrow={false}>+ Invite user</ButtonLink>} />
      <Toolbar base={BASE} q={q} placeholder="Search name or email" filters={[
        { name: "role", label: "Role", options: ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] })), value: p.role },
        { name: "status", label: "Status", options: [{ value: "active", label: "Active" }, { value: "inactive", label: "Deactivated" }], value: p.status },
      ]} />
      {rows.length === 0 ? (
        <EmptyState title="No users match" />
      ) : (
        <TableWrap>
          <thead>
            <tr>
              <Th>User</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last sign-in</Th>
              <Th className="text-right"><span className="sr-only">Actions</span></Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => {
              const self = u.id === me.id;
              return (
                <tr key={u.id} className={cn(trCls, !u.active && "opacity-60")}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-xs bg-ink-950 text-[0.6875rem] font-bold text-white">
                        {u.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <Link href={`${BASE}/${u.id}`} className="font-semibold text-ink-950 hover:text-brand-600">{u.name}</Link>
                        {self && <span className="ml-2 rounded-xs bg-brand-600 px-1.5 py-0.5 text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-white">You</span>}
                        <p className="truncate text-xs text-ink-500">{u.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td><span className="inline-flex h-6 items-center rounded-xs border border-ink-200 px-2 text-[0.6875rem] font-semibold text-ink-800">{ROLE_LABEL[u.role]}</span></Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-700">
                      <Dot tone={u.active ? "success" : "neutral"} /> {u.active ? "Active" : "Deactivated"}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-xs text-ink-500">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : "Never"}</Td>
                  <Td>
                    <RowActions>
                      {!self && (
                        <ActionButton action={setUserActive.bind(null, u.id, !u.active)} className="h-8 border-transparent px-2.5 hover:border-line">
                          {u.active ? "Deactivate" : "Activate"}
                        </ActionButton>
                      )}
                      <EditLink href={`${BASE}/${u.id}`} label={u.name} />
                    </RowActions>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { count, eq } from "drizzle-orm";
import { Check, Minus } from "lucide-react";
import { db, schema as s } from "@/db";
import { ROLES } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { matrixFor, ROLE_LABEL, ROLE_SUMMARY, RESOURCES } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { PageHeader, labelCls } from "@/components/admin/ui";
import { PurgeDemo, SettingsForm } from "@/components/admin/settings-forms";

export const metadata: Metadata = { title: "Settings" };
const ACTIONS = ["read", "write", "delete", "publish"] as const;

export default async function SettingsPage() {
  await requireUser("settings");
  const rows = await db.select().from(s.settings);
  const map = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  const demoTables = [
    ["Athletes", s.athletes],
    ["Results", s.results],
    ["Competitions", s.competitions],
    ["Events", s.events],
    ["News", s.news],
    ["Achievements", s.achievements],
    ["Board", s.boardMembers],
    ["Committees", s.committees],
    ["Documents", s.documents],
    ["Media", s.media],
  ] as const;
  const demoCounts = await Promise.all(demoTables.map(async ([label, t]) => ({ label, n: (await db.select({ n: count() }).from(t).where(eq(t.isDemo, true)))[0].n })));
  const demoTotal = demoCounts.reduce((a, b) => a + b.n, 0);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="System" title="Settings" description="Platform configuration, the permission model, and demo-data housekeeping." />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
        <div>
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-ink-950 [font-variation-settings:'wdth'_85]">Site</h2>
          <p className="mt-1.5 text-[0.8125rem] text-ink-500">Key/value settings read by the public site.</p>
        </div>
        <div className="rounded-sm border border-line bg-white p-5 md:p-6">
          <SettingsForm tagline={map["site.tagline"] ?? ""} demoBanner={map["site.demoBanner"] === "true"} />
        </div>
      </div>

      <div className="space-y-4">
        <div className="max-w-2xl">
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-ink-950 [font-variation-settings:'wdth'_85]">Roles & permissions</h2>
          <p className="mt-1.5 text-[0.8125rem] text-ink-500">Read-only. Rendered from the same matrix every server action checks, so this table can’t drift from reality.</p>
        </div>
        <div className="relative min-w-0 overflow-x-auto rounded-sm border border-line bg-white">
          <table className="w-full min-w-[880px] border-collapse text-left text-sm">
            <caption className="sr-only">Permissions per role and resource. R read, W write, D delete, P publish.</caption>
            <thead>
              <tr className="border-b border-line bg-pearl/70">
                <th scope="col" className={cn(labelCls, "sticky left-0 z-10 bg-pearl px-4 py-3 text-ink-500")}>Resource</th>
                {ROLES.map((r) => (
                  <th key={r} scope="col" className="px-3 py-3 align-bottom" title={ROLE_SUMMARY[r]}>
                    <span className="block text-[0.75rem] font-bold uppercase leading-tight text-ink-950 [font-variation-settings:'wdth'_80]">{ROLE_LABEL[r]}</span>
                    <span className="mt-1 flex gap-1 font-mono text-[0.5625rem] text-ink-400" aria-hidden>
                      {ACTIONS.map((a) => <span key={a} className="w-4 text-center">{a[0].toUpperCase()}</span>)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RESOURCES.map((res, i) => (
                <tr key={res} className="border-b border-line last:border-0">
                  <th scope="row" className="sticky left-0 z-10 bg-white px-4 py-2.5 font-semibold capitalize text-ink-900">{res}</th>
                  {ROLES.map((role) => {
                    const m = matrixFor(role)[i];
                    return (
                      <td key={role} className="px-3 py-2.5">
                        <span className="flex gap-1">
                          {ACTIONS.map((a) => (
                            <span key={a} className={cn("flex size-4 items-center justify-center rounded-[2px]", m[a] ? (a === "delete" ? "bg-brand-600 text-white" : a === "publish" ? "bg-gold text-ink-950" : "bg-ink-950 text-white") : "bg-ink-950/[0.05] text-ink-300")}>
                              {m[a] ? <Check className="size-2.5" strokeWidth={3.5} aria-hidden /> : <Minus className="size-2.5" aria-hidden />}
                              <span className="sr-only">{a}: {m[a] ? "yes" : "no"}</span>
                            </span>
                          ))}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="flex flex-wrap gap-4 border-t border-line px-4 py-3 text-xs text-ink-500">
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-[2px] bg-ink-950" /> Read / write</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-[2px] bg-gold" /> Publish</span>
            <span className="flex items-center gap-1.5"><span className="size-3 rounded-[2px] bg-brand-600" /> Delete</span>
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
        <div>
          <h2 className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-brand-700 [font-variation-settings:'wdth'_85]">Danger zone</h2>
          <p className="mt-1.5 text-[0.8125rem] text-ink-500">Irreversible operations. Logged in the audit trail.</p>
        </div>
        <section aria-labelledby="purge-title" className="rounded-sm border border-brand-200 bg-white">
          <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div>
              <h3 id="purge-title" className="font-bold text-ink-950">Purge demo data</h3>
              <p className="mt-1 max-w-xl text-sm text-ink-600">Deletes every row flagged as demo so the platform holds only verified BAA data. Results go first, then news links, then the parents. You’ll be asked to type <strong className="font-mono">DELETE DEMO</strong>.</p>
            </div>
            <PurgeDemo total={demoTotal} />
          </div>
          <ul className="grid grid-cols-2 gap-px border-t border-brand-100 bg-brand-100 sm:grid-cols-5">
            {demoCounts.map((d) => (
              <li key={d.label} className="bg-white px-4 py-3">
                <span className={cn(labelCls, "block text-ink-500")}>{d.label}</span>
                <span className="mt-1 block text-xl font-extrabold tabular text-ink-950 [font-variation-settings:'wdth'_70]">{d.n}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

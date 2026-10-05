import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { ROLE_LABEL, ROLE_SUMMARY } from "@/lib/permissions";
import { ROLES } from "@/db/schema";
import { LaneLines } from "@/components/ui/motifs";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

const EMAIL: Record<(typeof ROLES)[number], string> = {
  super_admin: "superadmin@baa.demo",
  administrator: "admin@baa.demo",
  content_manager: "content@baa.demo",
  results_manager: "results@baa.demo",
  event_manager: "events@baa.demo",
  editor: "editor@baa.demo",
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getCurrentUser()) redirect("/admin");
  const sp = await searchParams;
  const next = typeof sp.next === "string" ? sp.next : undefined;
  const demo = ROLES.map((r) => ({ email: EMAIL[r], role: ROLE_LABEL[r], summary: ROLE_SUMMARY[r] }));

  return (
    <div className="grid min-h-dvh bg-bone lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      {/* Brand side */}
      <aside className="relative isolate flex min-h-64 flex-col justify-between overflow-hidden bg-ink-950 px-6 py-8 text-white sm:px-10 lg:min-h-dvh lg:px-14 lg:py-12">
        <LaneLines className="absolute inset-0 -z-10 size-full" lanes={9} strokeClass="stroke-white/[0.07]" />
        <div className="absolute -bottom-40 -right-40 -z-10 size-[34rem] rounded-full bg-brand-600/20 blur-3xl" aria-hidden />
        <div className="absolute inset-y-0 left-0 w-1.5 bg-brand-600" aria-hidden />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="block size-12 overflow-hidden rounded-full bg-white p-0.5">
              <Image src="/brand/baa-crest.png" alt="" width={96} height={96} className="size-full object-contain" priority />
            </span>
            <span className="flex flex-col leading-none">
              <span className="text-[0.95rem] font-extrabold uppercase [font-variation-settings:'wdth'_78]">Bahrain Athletics</span>
              <span className="mt-1 font-arabic text-[0.72rem] font-semibold text-white/55" lang="ar" dir="rtl">
                الاتحاد البحريني لألعاب القوى
              </span>
            </span>
          </div>
          <Link href="/" className="hidden items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white/60 hover:text-white sm:flex">
            <ArrowLeft className="size-3.5" aria-hidden /> Public site
          </Link>
        </div>

        <div className="mt-12 max-w-xl lg:mt-0">
          <p className="mb-5 flex items-center gap-3 text-eyebrow text-white/50">
            <span className="h-px w-10 bg-brand-600" aria-hidden /> Management system
          </p>
          <h1 className="text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold uppercase leading-[0.86] tracking-[-0.02em] [font-variation-settings:'wdth'_66]">
            The control
            <br />
            room<span className="text-brand-600">.</span>
          </h1>
          <p className="mt-6 max-w-md text-base text-white/60">
            Athletes, results, competitions, news and governance for Bahraini athletics, managed in one place and published the moment you save.
          </p>
        </div>

        <dl className="mt-10 hidden grid-cols-3 gap-6 border-t border-white/10 pt-6 lg:grid">
          {[
            ["6", "Roles with scoped permissions"],
            ["100%", "Server-checked actions"],
            ["Live", "Changes publish on save"],
          ].map(([k, v]) => (
            <div key={v}>
              <dt className="sr-only">{v}</dt>
              <dd className="text-3xl font-extrabold uppercase leading-none tabular [font-variation-settings:'wdth'_70]">{k}</dd>
              <dd className="mt-2 text-xs text-white/45">{v}</dd>
            </div>
          ))}
        </dl>
      </aside>

      {/* Form side */}
      <main className="flex items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <p className="text-eyebrow text-ink-500">Staff sign in</p>
          <h2 className="mt-3 text-[2.25rem] font-extrabold uppercase leading-none tracking-[-0.01em] text-ink-950 [font-variation-settings:'wdth'_72]">Welcome back</h2>
          <p className="mt-2 mb-8 text-sm text-ink-500">Sign in with your federation account to continue.</p>
          <LoginForm next={next} demo={demo} password="baa-demo-2026" />
        </div>
      </main>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can, ROLE_LABEL } from "@/lib/permissions";
import { getNotices } from "@/lib/admin-queries";
import { logoutAction } from "@/lib/actions/auth";
import { ADMIN_NAV } from "@/components/admin/nav";
import { Breadcrumbs, MobileNav, Notifications, SearchBox, Sidebar, UserMenu } from "@/components/admin/shell";
import { Toaster } from "@/components/admin/toast";

export default async function DashLayout({ children }: LayoutProps<"/admin">) {
  const user = await requireUser();
  const groups = ADMIN_NAV.map((g) => ({ ...g, items: g.items.filter((i) => !i.resource || can(user.role, i.resource, "read")) })).filter((g) => g.items.length);
  const { notices, badges } = await getNotices(user.role);
  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const shellUser = { name: user.name, email: user.email, roleLabel: ROLE_LABEL[user.role], initials };

  return (
    <div className="min-h-dvh bg-bone text-[0.9375rem] lg:pl-64">
      <a href="#admin-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-xs focus:bg-ink-950 focus:px-4 focus:py-2 focus:text-sm focus:text-white">
        Skip to content
      </a>
      <Sidebar groups={groups} badges={badges} />
      <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-bone/90 px-4 backdrop-blur-md lg:px-8">
        <MobileNav groups={groups} badges={badges} />
        <div className="min-w-0 flex-1">
          <Breadcrumbs />
        </div>
        <SearchBox />
        <Link href="/admin/search" className="flex size-9 items-center justify-center rounded-xs text-ink-700 hover:bg-ink-950/5 md:hidden">
          <Search className="size-[1.125rem]" aria-hidden />
          <span className="sr-only">Search</span>
        </Link>
        <Notifications notices={notices} />
        <span className="hidden h-6 w-px bg-line sm:block" aria-hidden />
        <UserMenu user={shellUser} logout={logoutAction} />
      </header>
      <main id="admin-main" className="px-4 py-6 lg:px-8 lg:py-8">
        {children}
      </main>
      <Suspense>
        <Toaster />
      </Suspense>
    </div>
  );
}

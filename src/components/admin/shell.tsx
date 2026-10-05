"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  FileText,
  History,
  Image as ImageIcon,
  Inbox,
  Landmark,
  LayoutDashboard,
  LogOut,
  Medal,
  Menu,
  Newspaper,
  PersonStanding,
  Search,
  Settings,
  Timer,
  Trophy,
  UserCog,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { SEGMENT_LABEL, type AdminNavGroup, type IconKey } from "./nav";

const ICONS: Record<IconKey, React.ComponentType<{ className?: string; "aria-hidden"?: boolean; strokeWidth?: number }>> = {
  overview: LayoutDashboard,
  athletes: PersonStanding,
  competitions: Trophy,
  events: CalendarDays,
  results: Timer,
  achievements: Medal,
  news: Newspaper,
  media: ImageIcon,
  governance: Landmark,
  documents: FileText,
  messages: Inbox,
  users: UserCog,
  settings: Settings,
  activity: History,
};

export type ShellUser = { name: string; email: string; roleLabel: string; initials: string };
export type Notice = { label: string; detail: string; count: number; href: string };

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");
}

/* ---------- sidebar ---------- */

function SidebarBody({ groups, badges, onNavigate }: { groups: AdminNavGroup[]; badges: Record<string, number>; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex h-16 shrink-0 items-center gap-3 border-b border-white/[0.08] px-5">
        <span className="relative block size-9 shrink-0 overflow-hidden rounded-full bg-white p-0.5">
          <Image src="/brand/baa-crest.png" alt="" width={72} height={72} className="size-full object-contain" />
        </span>
        <span className="flex min-w-0 flex-col leading-none">
          <span className="text-[0.875rem] font-extrabold uppercase tracking-[0.02em] text-white [font-variation-settings:'wdth'_78]">Bahrain Athletics</span>
          <span className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-white/45 [font-variation-settings:'wdth'_110]">Control room</span>
        </span>
      </div>
      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4 scrollbar-none">
        {groups.map((g) => (
          <div key={g.label} className="mb-5 last:mb-0">
            {g.label !== "Overview" && (
              <p className="mb-1.5 px-3 text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-white/35 [font-variation-settings:'wdth'_115]">{g.label}</p>
            )}
            <ul className="space-y-px">
              {g.items.map((item) => {
                const active = isActive(pathname, item.href);
                const Icon = ICONS[item.icon];
                const badge = badges[item.href];
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "group relative flex h-9 items-center gap-3 rounded-xs px-3 text-[0.8125rem] font-medium transition-colors",
                        active ? "bg-white/[0.08] text-white" : "text-white/60 hover:bg-white/[0.04] hover:text-white",
                      )}
                    >
                      <span className={cn("absolute inset-y-1.5 left-0 w-0.5 rounded-full", active ? "bg-brand-600" : "bg-transparent")} aria-hidden />
                      <Icon className={cn("size-4 shrink-0", active ? "text-brand-400" : "text-white/40 group-hover:text-white/70")} aria-hidden strokeWidth={1.75} />
                      <span className="flex-1 truncate">{item.label}</span>
                      {badge ? (
                        <span className="min-w-5 rounded-xs bg-brand-600 px-1.5 text-center text-[0.625rem] font-bold leading-5 text-white tabular">
                          {badge}
                          <span className="sr-only"> new</span>
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
      <div className="relative shrink-0 overflow-hidden border-t border-white/[0.08] px-5 py-4">
        <svg className="pointer-events-none absolute -right-16 -bottom-24 size-56 stroke-white/[0.06]" viewBox="0 0 200 200" fill="none" aria-hidden>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx="200" cy="200" r={60 + i * 18} strokeWidth="1" />
          ))}
        </svg>
        <a href="/" target="_blank" rel="noopener noreferrer" className="relative flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white">
          <ExternalLink className="size-3.5" aria-hidden />
          View public site
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <p className="relative mt-1.5 text-[0.625rem] uppercase tracking-[0.16em] text-white/30">Prototype · v0.1</p>
      </div>
    </div>
  );
}

export function Sidebar({ groups, badges }: { groups: AdminNavGroup[]; badges: Record<string, number> }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-ink-950 lg:block">
      <SidebarBody groups={groups} badges={badges} />
    </aside>
  );
}

export function MobileNav({ groups, badges }: { groups: AdminNavGroup[]; badges: Record<string, number> }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="-ml-2 flex size-10 items-center justify-center rounded-xs text-ink-900 hover:bg-ink-950/5 lg:hidden">
        <Menu className="size-5" aria-hidden />
        <span className="sr-only">Open navigation</span>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/60 backdrop-blur-[2px] lg:hidden" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 w-[min(18rem,85vw)] bg-ink-950 shadow-2xl focus:outline-none data-[state=open]:animate-[drawerIn_220ms_cubic-bezier(0.16,1,0.3,1)] lg:hidden">
          <Dialog.Title className="sr-only">Navigation</Dialog.Title>
          <Dialog.Description className="sr-only">Admin sections</Dialog.Description>
          <SidebarBody groups={groups} badges={badges} onNavigate={() => setOpen(false)} />
          <Dialog.Close className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-xs text-white/60 hover:bg-white/10 hover:text-white">
            <X className="size-4" aria-hidden />
            <span className="sr-only">Close navigation</span>
          </Dialog.Close>
          <style>{`@keyframes drawerIn{from{transform:translateX(-100%)}to{transform:none}}`}</style>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ---------- topbar ---------- */

export function Breadcrumbs() {
  const pathname = usePathname();
  const segs = pathname.split("/").filter(Boolean);
  const crumbs = segs.map((seg, i) => {
    const href = "/" + segs.slice(0, i + 1).join("/");
    let label = SEGMENT_LABEL[seg] ?? (/^\d+$/.test(seg) ? "Edit" : seg);
    if (seg === "new") label = "New";
    return { href, label, last: i === segs.length - 1 };
  });
  // /admin/governance/board → the "board" segment has no page of its own
  const linkable = (href: string) => !/\/governance\/(board|committees)$/.test(href);
  return (
    <nav aria-label="Breadcrumb" className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1.5 text-[0.8125rem]">
        {crumbs.map((c, i) => (
          <li key={c.href} className={cn("flex min-w-0 items-center gap-1.5", i < crumbs.length - 2 && "hidden sm:flex")}>
            {i > 0 && <ChevronRight className="size-3.5 shrink-0 text-ink-300" aria-hidden />}
            {c.last ? (
              <span aria-current="page" className="truncate font-semibold text-ink-950">
                {c.label}
              </span>
            ) : linkable(c.href) ? (
              <Link href={c.href} className="truncate text-ink-500 hover:text-ink-950">
                {c.label}
              </Link>
            ) : (
              <span className="truncate text-ink-500">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function SearchBox() {
  return (
    <form action="/admin/search" method="get" role="search" className="relative hidden md:block">
      <label htmlFor="admin-search" className="sr-only">
        Search athletes, news and competitions
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
      <input
        id="admin-search"
        type="search"
        name="q"
        placeholder="Search athletes, news, competitions…"
        className="h-9 w-72 rounded-xs border border-line bg-white pl-9 pr-3 text-sm placeholder:text-ink-400 hover:border-ink-300 focus:border-ink-950 focus:outline-none xl:w-80"
      />
    </form>
  );
}

const menuCls =
  "z-50 min-w-64 overflow-hidden rounded-sm border border-line bg-white p-1 text-sm shadow-[0_16px_48px_-16px_rgb(11_11_13/0.35)]";

export function Notifications({ notices }: { notices: Notice[] }) {
  const total = notices.reduce((n, x) => n + x.count, 0);
  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="relative flex size-9 items-center justify-center rounded-xs text-ink-700 hover:bg-ink-950/5 hover:text-ink-950 data-[state=open]:bg-ink-950/5">
        <Bell className="size-[1.125rem]" aria-hidden />
        {total > 0 && <span className="absolute right-1 top-1 min-w-4 rounded-full bg-brand-600 px-1 text-center text-[0.5625rem] font-bold leading-4 text-white tabular">{total}</span>}
        <span className="sr-only">Notifications{total ? ` (${total})` : ""}</span>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content align="end" sideOffset={8} className={cn(menuCls, "w-80")}>
          <Dropdown.Label className="px-3 pb-2 pt-2.5 text-[0.625rem] font-semibold uppercase tracking-[0.18em] text-ink-500">Needs attention</Dropdown.Label>
          {notices.length === 0 || total === 0 ? (
            <p className="px-3 pb-4 pt-1 text-sm text-ink-500">You’re all caught up.</p>
          ) : (
            notices
              .filter((n) => n.count > 0)
              .map((n) => (
                <Dropdown.Item key={n.href} asChild>
                  <Link href={n.href} className="flex cursor-pointer items-center gap-3 rounded-xs px-3 py-2.5 outline-none data-[highlighted]:bg-pearl">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-xs bg-ink-950 text-xs font-bold text-white tabular">{n.count}</span>
                    <span className="min-w-0">
                      <span className="block font-semibold text-ink-950">{n.label}</span>
                      <span className="block truncate text-xs text-ink-500">{n.detail}</span>
                    </span>
                  </Link>
                </Dropdown.Item>
              ))
          )}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

export function UserMenu({ user, logout }: { user: ShellUser; logout: () => Promise<void> }) {
  return (
    <Dropdown.Root>
      <Dropdown.Trigger className="flex items-center gap-2.5 rounded-xs py-1 pl-1 pr-2 hover:bg-ink-950/5 data-[state=open]:bg-ink-950/5">
        <span className="flex size-8 items-center justify-center rounded-xs bg-ink-950 text-[0.6875rem] font-bold text-white [font-variation-settings:'wdth'_90]">{user.initials}</span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-[0.8125rem] font-semibold text-ink-950">{user.name}</span>
          <span className="block text-[0.6875rem] text-ink-500">{user.roleLabel}</span>
        </span>
        <ChevronDown className="size-3.5 text-ink-400" aria-hidden />
        <span className="sr-only">Account menu</span>
      </Dropdown.Trigger>
      <Dropdown.Portal>
        <Dropdown.Content align="end" sideOffset={8} className={menuCls}>
          <div className="border-b border-line px-3 pb-3 pt-2.5">
            <p className="font-semibold text-ink-950">{user.name}</p>
            <p className="text-xs text-ink-500">{user.email}</p>
            <p className="mt-2 inline-flex h-5 items-center rounded-xs bg-ink-950 px-1.5 text-[0.5625rem] font-bold uppercase tracking-[0.14em] text-white">{user.roleLabel}</p>
          </div>
          <Dropdown.Item asChild>
            <a href="/" target="_blank" rel="noopener noreferrer" className="mt-1 flex cursor-pointer items-center gap-2.5 rounded-xs px-3 py-2 outline-none data-[highlighted]:bg-pearl">
              <ExternalLink className="size-4 text-ink-500" aria-hidden /> View site
            </a>
          </Dropdown.Item>
          <Dropdown.Separator className="my-1 h-px bg-line" />
          <form action={logout}>
            <Dropdown.Item asChild onSelect={(e) => e.preventDefault()}>
              <button type="submit" className="flex w-full cursor-pointer items-center gap-2.5 rounded-xs px-3 py-2 text-left text-brand-700 outline-none data-[highlighted]:bg-brand-50">
                <LogOut className="size-4" aria-hidden /> Sign out
              </button>
            </Dropdown.Item>
          </form>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
}

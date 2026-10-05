"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { Trash2, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "./toast";

type Result = { ok: boolean; message: string };

/* ---------- confirmation dialog ---------- */

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Delete",
  tone = "danger",
  requireText,
  onConfirm,
}: {
  trigger: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  tone?: "danger" | "default";
  /** If set, the user must type this exact text to enable the confirm button. */
  requireText?: string;
  onConfirm: () => Promise<boolean | void>;
}) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [pending, start] = useTransition();
  const blocked = !!requireText && typed !== requireText;
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setTyped("");
      }}
    >
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/50 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-sm bg-white shadow-[0_24px_80px_-24px_rgb(11_11_13/0.6)] focus:outline-none">
          <div className={cn("h-1", tone === "danger" ? "bg-brand-600" : "bg-ink-950")} aria-hidden />
          <div className="p-6">
            <div className="flex items-start gap-4">
              {tone === "danger" && (
                <span className="flex size-10 shrink-0 items-center justify-center rounded-sm bg-brand-50 text-brand-600">
                  <TriangleAlert className="size-5" aria-hidden />
                </span>
              )}
              <div className="min-w-0 flex-1">
                <Dialog.Title className="text-lg font-extrabold uppercase leading-tight text-ink-950 [font-variation-settings:'wdth'_78]">{title}</Dialog.Title>
                {description && <Dialog.Description className="mt-1.5 text-sm text-ink-600">{description}</Dialog.Description>}
              </div>
            </div>
            {requireText && (
              <label className="mt-5 block text-sm text-ink-700">
                Type <strong className="font-mono text-ink-950">{requireText}</strong> to confirm
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoComplete="off"
                  className="mt-2 h-10 w-full rounded-xs border border-line px-3 font-mono text-sm focus:border-ink-950 focus:outline-none"
                />
              </label>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <Dialog.Close className="h-10 rounded-xs px-4 text-xs font-semibold uppercase tracking-[0.08em] text-ink-700 hover:bg-ink-950/5">Cancel</Dialog.Close>
              <button
                type="button"
                disabled={pending || blocked}
                onClick={() =>
                  start(async () => {
                    const keepOpen = await onConfirm();
                    if (keepOpen !== true) setOpen(false);
                  })
                }
                className={cn(
                  "h-10 rounded-xs px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white disabled:opacity-50",
                  tone === "danger" ? "bg-brand-600 hover:bg-brand-700" : "bg-ink-950 hover:bg-ink-800",
                )}
              >
                {pending ? "Working…" : confirmLabel}
              </button>
            </div>
          </div>
          <Dialog.Close className="absolute right-3 top-4 flex size-8 items-center justify-center rounded-xs text-ink-400 hover:bg-ink-950/5 hover:text-ink-950">
            <X className="size-4" aria-hidden />
            <span className="sr-only">Close</span>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ---------- row delete ---------- */

export function DeleteButton({
  action,
  id,
  label,
  redirectTo,
  variant = "icon",
}: {
  action: (id: number) => Promise<Result>;
  id: number;
  label: string;
  redirectTo?: string;
  variant?: "icon" | "button";
}) {
  const router = useRouter();
  return (
    <ConfirmDialog
      title="Delete permanently?"
      description={
        <>
          <span className="font-semibold text-ink-900">{label}</span> will be removed from the database and the public site. This can’t be undone.
        </>
      }
      trigger={
        variant === "icon" ? (
          <button type="button" className="inline-flex size-8 items-center justify-center rounded-xs text-ink-400 hover:bg-brand-50 hover:text-brand-600" title={`Delete ${label}`}>
            <Trash2 className="size-4" aria-hidden />
            <span className="sr-only">Delete {label}</span>
          </button>
        ) : (
          <button type="button" className="inline-flex h-11 items-center gap-2 rounded-xs px-4 text-xs font-semibold uppercase tracking-[0.08em] text-brand-700 hover:bg-brand-50">
            <Trash2 className="size-4" aria-hidden /> Delete
          </button>
        )
      }
      onConfirm={async () => {
        try {
          const r = await action(id);
          toast(r.message, r.ok ? "success" : "error");
          if (r.ok) {
            if (redirectTo) router.push(redirectTo);
            else router.refresh();
          }
        } catch {
          toast("Something went wrong. Please try again.", "error");
        }
      }}
    />
  );
}

/** A button that runs a server action once (toggle read, deactivate, …) and toasts the result. */
export function ActionButton({
  action,
  children,
  className,
  title,
}: {
  action: () => Promise<Result>;
  children: React.ReactNode;
  className?: string;
  title?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      onClick={() =>
        start(async () => {
          try {
            const r = await action();
            toast(r.message, r.ok ? "success" : "error");
            if (r.ok) router.refresh();
          } catch {
            toast("Something went wrong. Please try again.", "error");
          }
        })
      }
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-xs border border-line bg-white px-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-800 hover:border-ink-950 disabled:opacity-50",
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ---------- bulk selection ---------- */

type BulkAction = { label: string; action: (ids: number[]) => Promise<Result>; confirm?: string; tone?: "danger" | "default" };

const Ctx = createContext<{ selected: Set<number>; toggle: (id: number, on: boolean) => void; setAll: (ids: number[], on: boolean) => void } | null>(null);

export function BulkScope({ actions, children }: { actions: BulkAction[]; children: React.ReactNode }) {
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pending, start] = useTransition();
  const router = useRouter();
  const toggle = (id: number, on: boolean) =>
    setSelected((s) => {
      const n = new Set(s);
      if (on) n.add(id);
      else n.delete(id);
      return n;
    });
  const setAll = (ids: number[], on: boolean) => setSelected(on ? new Set(ids) : new Set());
  const run = (a: BulkAction) =>
    start(async () => {
      try {
        const r = await a.action([...selected]);
        toast(r.message, r.ok ? "success" : "error");
        if (r.ok) {
          setSelected(new Set());
          router.refresh();
        }
      } catch {
        toast("Something went wrong. Please try again.", "error");
      }
    });
  return (
    <Ctx.Provider value={{ selected, toggle, setAll }}>
      <div
        className={cn(
          "sticky top-16 z-20 mb-2 flex flex-wrap items-center gap-2 rounded-sm bg-ink-950 px-3 py-2 text-sm text-white transition-all",
          selected.size ? "opacity-100" : "pointer-events-none hidden opacity-0",
        )}
        aria-live="polite"
      >
        <span className="px-1 font-semibold tabular">{selected.size} selected</span>
        <button type="button" onClick={() => setSelected(new Set())} className="rounded-xs px-2 py-1 text-xs text-white/60 hover:text-white">
          Clear
        </button>
        <span className="mx-1 h-4 w-px bg-white/15" aria-hidden />
        {actions.map((a) =>
          a.confirm ? (
            <ConfirmDialog
              key={a.label}
              title={`${a.label}?`}
              description={a.confirm.replace("{n}", String(selected.size))}
              confirmLabel={a.label}
              tone={a.tone ?? "danger"}
              onConfirm={async () => run(a)}
              trigger={
                <button type="button" disabled={pending} className={cn("h-8 rounded-xs px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em]", a.tone === "default" ? "bg-white/10 hover:bg-white/20" : "bg-brand-600 hover:bg-brand-700")}>
                  {a.label}
                </button>
              }
            />
          ) : (
            <button key={a.label} type="button" disabled={pending} onClick={() => run(a)} className="h-8 rounded-xs bg-white/10 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] hover:bg-white/20">
              {a.label}
            </button>
          ),
        )}
      </div>
      {children}
    </Ctx.Provider>
  );
}

const checkCls = "size-4 cursor-pointer rounded-xs border-ink-300 accent-brand-600";

export function RowCheck({ id, label }: { id: number; label: string }) {
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  return <input type="checkbox" className={checkCls} checked={ctx.selected.has(id)} onChange={(e) => ctx.toggle(id, e.target.checked)} aria-label={`Select ${label}`} />;
}

export function SelectAll({ ids }: { ids: number[] }) {
  const ctx = useContext(Ctx);
  if (!ctx) return null;
  const all = ids.length > 0 && ids.every((i) => ctx.selected.has(i));
  return (
    <input
      type="checkbox"
      className={checkCls}
      checked={all}
      ref={(el) => {
        if (el) el.indeterminate = !all && ids.some((i) => ctx.selected.has(i));
      }}
      onChange={(e) => ctx.setAll(ids, e.target.checked)}
      aria-label="Select all rows on this page"
    />
  );
}

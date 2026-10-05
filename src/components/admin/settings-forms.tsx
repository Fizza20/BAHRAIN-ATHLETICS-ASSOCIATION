"use client";

import { startTransition, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Trash2 } from "lucide-react";
import { purgeDemoData, saveSettings } from "@/lib/actions/settings";
import type { FormState } from "@/lib/actions/helpers";
import { ConfirmDialog } from "./actions";
import { inputCls } from "./styles";
import { toast } from "./toast";

export function SettingsForm({ tagline, demoBanner }: { tagline: string; demoBanner: boolean }) {
  const [state, action, pending] = useActionState(saveSettings, {} as FormState);
  useEffect(() => {
    if (state.message) toast(state.message, state.ok ? "success" : "error");
  }, [state]);
  const err = state.errors?.["site.tagline"];
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="space-y-5"
    >
      <div>
        <label htmlFor="s-tagline" className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-900">
          Site tagline <span className="font-mono text-[0.6875rem] font-normal text-ink-400">site.tagline</span>
        </label>
        <input id="s-tagline" name="site.tagline" defaultValue={tagline} aria-invalid={err ? true : undefined} aria-describedby={err ? "s-tagline-err" : "s-tagline-hint"} className={inputCls} />
        {err ? (
          <p id="s-tagline-err" className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-700"><CircleAlert className="size-3.5" aria-hidden /> {err}</p>
        ) : (
          <p id="s-tagline-hint" className="mt-1.5 text-xs text-ink-500">Used in the homepage hero and metadata.</p>
        )}
      </div>
      <label htmlFor="s-demo" className="flex cursor-pointer items-start gap-3 rounded-xs border border-line px-3 py-2.5 hover:border-ink-300">
        <input id="s-demo" type="checkbox" name="site.demoBanner" defaultChecked={demoBanner} className="mt-0.5 size-4 accent-brand-600" />
        <span>
          <span className="text-[0.8125rem] font-semibold text-ink-900">Show the prototype banner</span> <span className="font-mono text-[0.6875rem] text-ink-400">site.demoBanner</span>
          <span className="mt-0.5 block text-xs text-ink-500">Tells visitors this is a pitch prototype with demo content.</span>
        </span>
      </label>
      <div className="flex justify-end">
        <button type="submit" disabled={pending} className="h-11 rounded-xs bg-brand-600 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-brand-700 disabled:opacity-60">
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}

export function PurgeDemo({ total }: { total: number }) {
  const router = useRouter();
  return (
    <ConfirmDialog
      title="Purge all demo data?"
      description={`${total} placeholder rows (marked “Demo”) will be permanently deleted across athletes, results, news, events, competitions, governance, documents and media. Verified data is not touched.`}
      confirmLabel="Purge demo data"
      requireText="DELETE DEMO"
      onConfirm={async () => {
        const r = await purgeDemoData("DELETE DEMO");
        toast(r.message, r.ok ? "success" : "error");
        if (r.ok) router.refresh();
      }}
      trigger={
        <button type="button" disabled={total === 0} className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xs bg-brand-700 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-brand-800 disabled:opacity-40">
          <Trash2 className="size-4" aria-hidden /> Purge demo data
        </button>
      }
    />
  );
}

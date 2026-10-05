"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw, TriangleAlert } from "lucide-react";

export function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div role="alert" className="relative overflow-hidden rounded-sm border border-line bg-white px-6 py-14 text-center">
      <div className="absolute inset-x-0 top-0 h-1 bg-brand-600" aria-hidden />
      <span className="mx-auto flex size-11 items-center justify-center rounded-sm bg-brand-50 text-brand-600">
        <TriangleAlert className="size-5" aria-hidden />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold uppercase text-ink-950 [font-variation-settings:'wdth'_74]">This section failed to load</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-500">
        Something went wrong on our side. Your data is safe. Try again, or go back to the overview.
        {error.digest && <span className="mt-2 block font-mono text-xs text-ink-400">Reference: {error.digest}</span>}
      </p>
      <div className="mt-6 flex justify-center gap-2">
        <button type="button" onClick={() => retry()} className="inline-flex h-11 items-center gap-2 rounded-xs bg-ink-950 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-ink-800">
          <RotateCcw className="size-4" aria-hidden /> Try again
        </button>
        <Link href="/admin" className="inline-flex h-11 items-center rounded-xs px-5 text-xs font-semibold uppercase tracking-[0.08em] text-ink-700 hover:bg-ink-950/5">
          Overview
        </Link>
      </div>
    </div>
  );
}

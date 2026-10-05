"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { thumb } from "./thumb";

/** Thumbnail with a designed fallback (no broken-image icon) for arbitrary pasted URLs. */
export function AdminImg({ src, alt, w = 400, className }: { src: string; alt: string; w?: number; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span role="img" aria-label={alt || "Image unavailable"} className={cn("relative flex items-center justify-center overflow-hidden bg-ink-950", className)}>
        <svg className="absolute inset-0 size-full stroke-white/10" viewBox="0 0 100 75" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx="100" cy="75" r={30 + i * 12} strokeWidth="0.6" />
          ))}
        </svg>
        <span className="relative text-[0.5625rem] font-semibold uppercase tracking-[0.16em] text-white/40">No preview</span>
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={thumb(src, w)} alt={alt} loading="lazy" onError={() => setFailed(true)} className={className} />;
}

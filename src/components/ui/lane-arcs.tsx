"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Track lanes drawn as concentric arcs that "run" in on load. Decorative only.
 * Uses currentColor, so set the colour with a text-* class on `className`.
 */
export function LaneArcs({ className, lanes = 7, draw = true }: { className?: string; lanes?: number; draw?: boolean }) {
  return (
    <svg className={cn("pointer-events-none", className)} viewBox="0 0 600 600" fill="none" aria-hidden preserveAspectRatio="xMaxYMid slice">
      {Array.from({ length: lanes }).map((_, i) => (
        <motion.circle
          key={i}
          cx={600}
          cy={300}
          r={140 + i * 46}
          stroke="currentColor"
          strokeWidth={1.5}
          vectorEffect="non-scaling-stroke"
          initial={draw ? { pathLength: 0, opacity: 0 } : false}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.8, delay: 0.15 * i, ease: [0.16, 1, 0.3, 1] }}
        />
      ))}
    </svg>
  );
}

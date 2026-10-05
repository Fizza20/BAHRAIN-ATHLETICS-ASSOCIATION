import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/motion";

/**
 * Lane lines: concentric arches drawn as track lanes. Used only by the admin sign-in
 * screen; the public site no longer uses decorative motifs.
 */
export function LaneLines({
  className,
  lanes = 8,
  origin = "bottom-right",
  strokeClass = "stroke-white/10",
}: {
  className?: string;
  lanes?: number;
  origin?: "bottom-right" | "bottom-left" | "top-right" | "center";
  strokeClass?: string;
}) {
  const o = { "bottom-right": [600, 600], "bottom-left": [0, 600], "top-right": [600, 0], center: [300, 600] }[origin];
  return (
    <svg className={cn("pointer-events-none", strokeClass, className)} viewBox="0 0 600 600" fill="none" aria-hidden preserveAspectRatio="xMidYMid slice">
      {Array.from({ length: lanes }).map((_, i) => (
        <circle key={i} cx={o[0]} cy={o[1]} r={180 + i * 44} strokeWidth={1.25} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

/**
 * Standard section heading: short label, sentence-case title, optional intro,
 * and one action aligned to the right on desktop.
 */
export function SectionHeader({
  eyebrow,
  title,
  intro,
  action,
  className,
  as: As = "h2",
  inverse,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2";
  /** For dark sections. */
  inverse?: boolean;
}) {
  return (
    <Reveal className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8", className)}>
      <div className="max-w-2xl">
        {eyebrow && (
          <p className={cn("text-eyebrow mb-3 flex items-center gap-3", inverse ? "text-white/85" : "text-brand-700")}>
            <span className="h-0.5 w-8 bg-brand-500" aria-hidden />
            {eyebrow}
          </p>
        )}
        <As className={cn(As === "h1" ? "text-h1" : "text-h2", inverse ? "text-white" : "text-ink-950")}>{title}</As>
        {intro && <p className={cn("mt-3 text-lg", inverse ? "text-white/85" : "text-ink-600")}>{intro}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Reveal>
  );
}

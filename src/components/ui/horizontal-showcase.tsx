"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * Pinned horizontal scroll (GSAP ScrollTrigger). On large screens the section pins and its
 * cards travel sideways as you scroll; below `lg`, or with reduced motion, it is a normal
 * wrapping grid, so nothing is hidden and no scroll is hijacked.
 */
export function HorizontalShowcase({
  header,
  children,
  className,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const { dir } = useI18n();
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current;
        const wrap = section.current;
        if (!el || !wrap) return;
        const sign = dir === "rtl" ? 1 : -1;
        const distance = () => Math.max(0, el.scrollWidth - (el.parentElement?.clientWidth ?? 0));
        gsap.to(el, {
          x: () => sign * distance(),
          ease: "none",
          scrollTrigger: {
            trigger: wrap,
            start: "top 72px",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            },
          },
        });
      });
      return () => mm.revert();
    },
    { scope: section, dependencies: [dir] },
  );

  return (
    <section ref={section} className={cn("relative overflow-hidden", className)}>
      <div className="container-x">{header}</div>
      <div className="container-x mt-8 lg:overflow-hidden">
        <div ref={track} className="flex flex-col gap-4 md:grid md:grid-cols-2 lg:flex lg:w-max lg:flex-row lg:gap-6 lg:pb-2">
          {children}
        </div>
      </div>
      <div className="container-x mt-6 hidden lg:block" aria-hidden>
        <div className="h-1 overflow-hidden rounded-full bg-ink-100">
          <div ref={bar} className="h-full origin-left bg-brand-600 rtl:origin-right" style={{ transform: "scaleX(0)" }} />
        </div>
      </div>
    </section>
  );
}

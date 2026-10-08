"use client";

import { animate, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform, type HTMLMotionProps, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Section reveal: a short rise, once. Respects reduced motion. */
export function Reveal({ delay = 0, y = 24, children, ...props }: { delay?: number; y?: number } & HTMLMotionProps<"div">) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Headline line that slides in from the left like a sprint start. */
export function StartLine({ delay = 0, children, className }: { delay?: number; children: React.ReactNode; className?: string }) {
  return (
    <span className={`block overflow-hidden ${className ?? ""}`}>
      <motion.span
        className="block"
        initial={{ x: "-8%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.0, ease: EASE, delay }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Animated counter for real figures. Renders the final value for SSR/no-JS. */
export function Counter({ value, decimals = 0, duration = 1.6, format }: { value: number; decimals?: number; duration?: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -10% 0px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState<number>(value);
  const started = useRef(false);

  useEffect(() => {
    if (!inView || reduce || started.current) return;
    started.current = true;
    const controls = animate(0, value, { duration, ease: EASE, onUpdate: (v) => setDisplay(v) });
    return () => {
      controls.stop();
      started.current = false;
      setDisplay(value);
    };
  }, [inView, reduce, value, duration]);

  const text = format ? format(display) : display.toFixed(decimals);
  return (
    <span ref={ref} className="tabular">
      {text}
    </span>
  );
}

/** Animated split-time counter for marks like 12:45.70. */
export function MarkCounter({ mark }: { mark: string }) {
  const parts = mark.split(":");
  const total = parts.reduce((a, n) => a * 60 + Number(n), 0);
  const decimals = (mark.split(".")[1] ?? "").length;
  const hasMinutes = parts.length > 1;
  return (
    <Counter
      value={total}
      decimals={decimals}
      format={(v) => {
        if (!hasMinutes) return v.toFixed(decimals);
        const m = Math.floor(v / 60);
        const sec = (v - m * 60).toFixed(decimals).padStart(decimals ? decimals + 3 : 2, "0");
        return `${m}:${sec}`;
      }}
    />
  );
}

/* ------------------------------------------------------------------
   Motion primitives. All of them honour prefers-reduced-motion.
   ------------------------------------------------------------------ */

/** Card entrance: a short rise and fade the first time it scrolls into view. */
export function RevealCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

/** Staggered group: children marked with <StaggerItem> animate in one after another. */
export function Stagger({ children, className, gap = 0.08, as = "div" }: { children: React.ReactNode; className?: string; gap?: number; as?: "div" | "ul" | "ol" | "dl" }) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp
      className={className}
      initial={"hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      variants={{ hidden: {}, show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </Comp>
  );
}

export function StaggerItem({ children, className, as = "div" }: { children: React.ReactNode; className?: string; as?: "div" | "li" }) {
  const Comp = motion[as] as typeof motion.div;
  return (
    <Comp className={className} variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } } }}>
      {children}
    </Comp>
  );
}

/** Thin red reading/scroll progress bar pinned to the top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return <motion.div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-brand-600 rtl:origin-right" style={{ scaleX }} />;
}

/** Gentle vertical parallax for background media inside a clipped container. */
export function Parallax({ children, className, distance = 60 }: { children: React.ReactNode; className?: string; distance?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : distance]);
  return (
    <div ref={ref} className={className}>
      <motion.div style={{ y }} className="absolute inset-0 will-change-transform">
        {children}
      </motion.div>
    </div>
  );
}

/** Word-by-word headline reveal. */
export function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom" aria-hidden>
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: delay + i * 0.07 }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Magnetic hover: the child drifts slightly toward the pointer. Pointer devices only. */
export function Magnetic({ children, className, strength = 0.25 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(0, { stiffness: 220, damping: 18, mass: 0.4 });
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x, y, display: "inline-block" }}
      onPointerMove={(e) => {
        if (reduce || e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/** Image/section reveal: the box opens from the bottom like a finish-line tape. */
export function ClipReveal({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ clipPath: "inset(100% 0 0 0)" }}
      whileInView={{ clipPath: "inset(0% 0 0 0)" }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1.1, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** 3D tilt that follows the pointer, with a soft light reflection. Mouse only; static on touch. */
export function TiltCard({ children, className, max = 7 }: { children: React.ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, { stiffness: 180, damping: 18, mass: 0.5 });
  const ry = useSpring(0, { stiffness: 180, damping: 18, mass: 0.5 });
  const gx = useMotionValue(50);
  const gy = useMotionValue(50);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx}% ${gy}%, rgb(255 255 255 / 0.16), transparent 60%)`;
  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ rotateX: rx, rotateY: ry, transformPerspective: 1000, transformStyle: "preserve-3d" }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        ry.set((px - 0.5) * 2 * max);
        rx.set(-(py - 0.5) * 2 * max);
        gx.set(px * 100);
        gy.set(py * 100);
      }}
      onPointerLeave={() => {
        rx.set(0);
        ry.set(0);
      }}
    >
      {children}
      <motion.span aria-hidden className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ background: glare }} />
    </motion.div>
  );
}

function ScrubWord({ word, progress, start, end }: { word: string; progress: MotionValue<number>; start: number; end: number }) {
  const opacity = useTransform(progress, [start, end], [0.16, 1]);
  return (
    <motion.span style={{ opacity }} className="inline-block">
      {word}
      {"\u00A0"}
    </motion.span>
  );
}

/** Statement text whose words light up one by one as it scrolls through the viewport. */
export function ScrubText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "end 0.55"] });
  const words = text.split(" ");
  return (
    <p ref={ref} className={className} aria-label={text}>
      {words.map((w, i) => (
        <span key={i} aria-hidden>
          <ScrubWord word={w} progress={scrollYProgress} start={i / words.length} end={Math.min(1, (i + 1.6) / words.length)} />
        </span>
      ))}
    </p>
  );
}

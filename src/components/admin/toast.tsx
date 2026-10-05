"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, CircleAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "success" | "error";
type Item = { id: number; message: string; tone: Tone };

const EVENT = "baa:toast";

/** Fire a toast from any client component. */
export function toast(message: string, tone: Tone = "success") {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, tone } }));
}

/**
 * Tiny toast system. Two inputs: imperative `toast()` calls, and a `?toast=` URL param
 * set by server actions that redirect (so feedback survives the navigation).
 */
export function Toaster() {
  const [items, setItems] = useState<Item[]>([]);
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const push = useCallback((message: string, tone: Tone) => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs.slice(-3), { id, message, tone }]);
    window.setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4500);
  }, []);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<{ message: string; tone: Tone }>).detail;
      push(d.message, d.tone);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, [push]);

  const flash = params.get("toast");
  useEffect(() => {
    if (!flash) return;
    const tone: Tone = params.get("toastTone") === "error" ? "error" : "success";
    const timer = window.setTimeout(() => push(flash.slice(0, 200), tone), 0);
    const next = new URLSearchParams(params.toString());
    next.delete("toast");
    next.delete("toastTone");
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flash]);

  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-end gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6">
      <AnimatePresence initial={false}>
        {items.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-auto flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-sm bg-ink-950 py-3 pl-3 pr-2 text-sm text-white shadow-[0_12px_40px_-12px_rgb(11_11_13/0.5)]"
          >
            <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full", t.tone === "success" ? "bg-success" : "bg-brand-600")}>
              {t.tone === "success" ? <Check className="size-3" strokeWidth={3} aria-hidden /> : <CircleAlert className="size-3" strokeWidth={3} aria-hidden />}
            </span>
            <p className="flex-1 leading-snug">{t.message}</p>
            <button
              type="button"
              onClick={() => setItems((xs) => xs.filter((x) => x.id !== t.id))}
              className="flex size-6 shrink-0 items-center justify-center rounded-xs text-white/50 hover:bg-white/10 hover:text-white"
            >
              <X className="size-3.5" aria-hidden />
              <span className="sr-only">Dismiss notification</span>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

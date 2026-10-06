"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";
import { AlertCircle, ArrowRight, Loader2 } from "lucide-react";
import { sendMessage, type ContactState } from "./actions";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";
import { Stagger, StaggerItem } from "@/components/ui/motion";

const initial: ContactState = { ok: false };
const MAX = 4000;
const TOPICS = ["general", "athletes", "events", "media", "integrity"] as const;

/** Floating-label field shell: the label sits inside the input and lifts when focused or filled. */
const control =
  "peer w-full rounded-sm border bg-white px-4 pb-2 pt-6 text-base text-ink-900 shadow-[0_1px_0_rgb(16_18_27/0.02)] transition-[border-color,box-shadow] duration-200 placeholder:text-transparent hover:border-ink-300 focus:border-brand-600 focus:outline-none focus:ring-4 focus:ring-brand-600/10";
const floatLabel =
  "pointer-events-none absolute start-4 top-4 origin-left text-base text-ink-500 transition-all duration-200 rtl:origin-right peer-focus:top-2 peer-focus:text-xs peer-focus:font-semibold peer-focus:text-brand-700 peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:font-semibold";

export function ContactForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(sendMessage, initial);
  const [len, setLen] = useState(0);

  if (state.ok) {
    return (
      <div role="status" className="flex min-h-[420px] flex-col items-center justify-center text-center">
        <motion.svg viewBox="0 0 80 80" className="size-24" fill="none" aria-hidden initial="hidden" animate="show">
          <motion.circle
            cx="40"
            cy="40"
            r="34"
            strokeWidth="4"
            className="stroke-success"
            variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.8, ease: "easeOut" } } }}
          />
          <motion.path
            d="M26 41l9 9 19-20"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="stroke-success"
            variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.5, delay: 0.7, ease: "easeOut" } } }}
          />
        </motion.svg>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1, duration: 0.5 }} className="mt-6 text-h2 text-ink-950">
          {t("contactForm.sent")}
        </motion.p>
        <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.15, duration: 0.5 }} className="mt-3 max-w-sm text-lg text-ink-600">
          {state.message}
        </motion.p>
      </div>
    );
  }

  const v = state.values ?? {};
  const err = state.errors ?? {};
  const cls = (name: string) => cn(control, err[name] ? "animate-shake border-brand-700" : "border-ink-200");

  return (
    <form action={action} noValidate>
      {state.message && (
        <p role="alert" className="mb-6 flex items-center gap-2 rounded-sm bg-brand-50 p-4 text-sm font-medium text-brand-800">
          <AlertCircle className="size-4 shrink-0" aria-hidden /> {state.message}
        </p>
      )}
      <Stagger className="space-y-5" gap={0.07}>
        <StaggerItem className="grid gap-5 sm:grid-cols-2">
          <Field name="firstName" error={err.firstName}>
            <input id="firstName" name="firstName" placeholder=" " autoComplete="given-name" defaultValue={v.firstName} aria-invalid={!!err.firstName} aria-describedby={err.firstName ? "firstName-err" : undefined} className={cls("firstName")} required />
            <label htmlFor="firstName" className={floatLabel}>
              {t("contactForm.firstName")}
            </label>
          </Field>
          <Field name="lastName" error={err.lastName}>
            <input id="lastName" name="lastName" placeholder=" " autoComplete="family-name" defaultValue={v.lastName} aria-invalid={!!err.lastName} aria-describedby={err.lastName ? "lastName-err" : undefined} className={cls("lastName")} required />
            <label htmlFor="lastName" className={floatLabel}>
              {t("contactForm.lastName")}
            </label>
          </Field>
        </StaggerItem>

        <StaggerItem>
          <Field name="email" error={err.email}>
            <input id="email" name="email" type="email" placeholder=" " autoComplete="email" dir="auto" defaultValue={v.email} aria-invalid={!!err.email} aria-describedby={err.email ? "email-err" : undefined} className={cls("email")} required />
            <label htmlFor="email" className={floatLabel}>
              {t("contactForm.email")}
            </label>
          </Field>
        </StaggerItem>

        <StaggerItem>
          <fieldset>
            <legend className="mb-3 text-sm font-semibold text-ink-800">{t("contactForm.topic")}</legend>
            <div className="flex flex-wrap gap-2">
              {TOPICS.map((k) => (
                <label key={k} className="cursor-pointer">
                  <input type="radio" name="topic" value={k} defaultChecked={(v.topic ?? "general") === k} className="peer sr-only" />
                  <span className="inline-flex min-h-11 items-center rounded-full border border-ink-200 bg-white px-4 text-[0.9375rem] font-medium text-ink-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-ink-400 peer-checked:border-brand-600 peer-checked:bg-brand-600 peer-checked:text-white peer-checked:shadow-[0_8px_20px_-8px_rgb(206_17_38/0.6)] peer-focus-visible:ring-4 peer-focus-visible:ring-brand-600/25">
                    {t(`contactForm.topic.${k}`)}
                  </span>
                </label>
              ))}
            </div>
            {err.topic && <p className="mt-1.5 text-sm font-medium text-brand-700">{err.topic}</p>}
          </fieldset>
        </StaggerItem>

        <StaggerItem>
          <Field name="body" error={err.body}>
            <textarea
              id="body"
              name="body"
              rows={6}
              maxLength={MAX}
              placeholder=" "
              defaultValue={v.body}
              onChange={(e) => setLen(e.target.value.length)}
              aria-invalid={!!err.body}
              aria-describedby={err.body ? "body-err" : undefined}
              className={cn(cls("body"), "resize-y pt-7")}
              required
            />
            <label htmlFor="body" className={floatLabel}>
              {t("contactForm.message")}
            </label>
            <span className="pointer-events-none absolute bottom-2.5 end-3 text-xs tabular text-ink-500" aria-hidden dir="ltr">
              {len || (v.body?.length ?? 0)} / {MAX}
            </span>
          </Field>
        </StaggerItem>

        <div className="hidden" aria-hidden>
          <label htmlFor="company">{t("contactForm.company")}</label>
          <input id="company" name="company" tabIndex={-1} autoComplete="off" />
        </div>

        <StaggerItem className="flex flex-col gap-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xs text-sm text-ink-600">{t("contactForm.reportNote")}</p>
          <motion.button
            type="submit"
            disabled={pending}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group/btn relative inline-flex h-14 items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-600 px-8 text-base font-semibold text-white shadow-[0_14px_30px_-12px_rgb(206_17_38/0.7)] transition-colors hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-70"
          >
            {/* light sweep on hover */}
            <span aria-hidden className="absolute inset-y-0 -start-1/2 w-1/3 -skew-x-12 bg-white/25 opacity-0 transition-all duration-700 group-hover/btn:start-[130%] group-hover/btn:opacity-100" />
            <span className="relative">{pending ? t("contactForm.sending") : t("contactForm.submit")}</span>
            {pending ? <Loader2 className="relative size-5 animate-spin" aria-hidden /> : <ArrowRight className="relative size-5 transition-transform duration-300 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1" aria-hidden />}
          </motion.button>
        </StaggerItem>
      </Stagger>
    </form>
  );
}

function Field({ name, error, children }: { name: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      {error && (
        <p id={`${name}-err`} className="mt-1.5 text-sm font-medium text-brand-700">
          {error}
        </p>
      )}
    </div>
  );
}

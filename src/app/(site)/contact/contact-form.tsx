"use client";

import { useActionState } from "react";
import { CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { sendMessage, type ContactState } from "./actions";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/client";

const initial: ContactState = { ok: false };

export function ContactForm() {
  const { t } = useI18n();
  const [state, action, pending] = useActionState(sendMessage, initial);

  if (state.ok) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-md bg-success/10 p-8">
        <CheckCircle2 className="size-8 text-success" aria-hidden />
        <p className="text-h3 text-ink-950">{t("contactForm.sent")}</p>
        <p className="text-ink-700">{state.message}</p>
      </div>
    );
  }

  const v = state.values ?? {};
  const err = state.errors ?? {};
  const input = (name: string) =>
    cn(
      "mt-2 h-12 w-full rounded-xs border bg-white px-4 text-base text-ink-900 transition-colors placeholder:text-ink-500 focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/30",
      err[name] ? "border-brand-700" : "border-ink-200 hover:border-ink-300",
    );

  return (
    <form action={action} noValidate className="space-y-6">
      {state.message && (
        <p role="alert" className="flex items-center gap-2 rounded-xs bg-brand-50 p-4 text-sm font-medium text-brand-800">
          <AlertCircle className="size-4" aria-hidden /> {state.message}
        </p>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label={t("contactForm.firstName")} name="firstName" error={err.firstName}>
          <input id="firstName" name="firstName" autoComplete="given-name" defaultValue={v.firstName} aria-invalid={!!err.firstName} aria-describedby={err.firstName ? "firstName-err" : undefined} className={input("firstName")} required />
        </Field>
        <Field label={t("contactForm.lastName")} name="lastName" error={err.lastName}>
          <input id="lastName" name="lastName" autoComplete="family-name" defaultValue={v.lastName} aria-invalid={!!err.lastName} aria-describedby={err.lastName ? "lastName-err" : undefined} className={input("lastName")} required />
        </Field>
      </div>
      <Field label={t("contactForm.email")} name="email" error={err.email}>
        <input id="email" name="email" type="email" autoComplete="email" defaultValue={v.email} aria-invalid={!!err.email} aria-describedby={err.email ? "email-err" : undefined} className={input("email")} required />
      </Field>
      <Field label={t("contactForm.topic")} name="topic" error={err.topic}>
        <span className="relative block">
          <select id="topic" name="topic" defaultValue={v.topic ?? "general"} className={cn(input("topic"), "appearance-none pe-10")}>
            <option value="general">{t("contactForm.topic.general")}</option>
            <option value="athletes">{t("contactForm.topic.athletes")}</option>
            <option value="events">{t("contactForm.topic.events")}</option>
            <option value="media">{t("contactForm.topic.media")}</option>
            <option value="integrity">{t("contactForm.topic.integrity")}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute end-4 top-1/2 mt-1 size-4 -translate-y-1/2 text-ink-600" aria-hidden />
        </span>
      </Field>
      <Field label={t("contactForm.message")} name="body" error={err.body}>
        <textarea id="body" name="body" rows={6} defaultValue={v.body} aria-invalid={!!err.body} aria-describedby={err.body ? "body-err" : undefined} className={cn(input("body"), "h-auto py-3")} required />
      </Field>
      <div className="hidden" aria-hidden>
        <label htmlFor="company">{t("contactForm.company")}</label>
        <input id="company" name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-ink-600">{t("contactForm.reportNote")}</p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-12 items-center justify-center rounded-xs bg-brand-600 px-6 text-base font-semibold text-white transition-colors hover:bg-brand-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? t("contactForm.sending") : t("contactForm.submit")}
        </button>
      </div>
    </form>
  );
}

function Field({ label, name, error, children }: { label: string; name: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-semibold text-ink-800">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-err`} className="mt-1.5 text-sm font-medium text-brand-700">
          {error}
        </p>
      )}
    </div>
  );
}

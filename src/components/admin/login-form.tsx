"use client";

import { useActionState, useRef } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/helpers";
import { cn } from "@/lib/utils";
import { inputCls } from "./styles";

export type DemoAccount = { email: string; role: string; summary: string };

export function LoginForm({ next, demo, password }: { next?: string; demo: DemoAccount[]; password: string }) {
  const [state, action, pending] = useActionState(loginAction, {} as FormState);
  const email = useRef<HTMLInputElement>(null);
  const pw = useRef<HTMLInputElement>(null);
  const errors = state.errors ?? {};

  return (
    <>
      <form action={action} className="space-y-5" noValidate>
        {next && <input type="hidden" name="next" value={next} />}
        {state.message && (
          <div role="alert" className="flex items-center gap-2.5 rounded-xs border border-brand-200 bg-brand-50 px-3.5 py-3 text-sm font-medium text-brand-800">
            <CircleAlert className="size-4 shrink-0" aria-hidden />
            {state.message}
          </div>
        )}
        <div>
          <label htmlFor="email" className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-900">
            Email
          </label>
          <input
            ref={email}
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-err" : undefined}
            className={cn(inputCls, "h-12")}
            placeholder="name@baa.bh"
          />
          {errors.email && (
            <p id="email-err" className="mt-1.5 text-xs font-medium text-brand-700">
              {errors.email}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-900">
            Password
          </label>
          <input
            ref={pw}
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-err" : undefined}
            className={cn(inputCls, "h-12")}
          />
          {errors.password && (
            <p id="password-err" className="mt-1.5 text-xs font-medium text-brand-700">
              {errors.password}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="group flex h-12 w-full items-center justify-center gap-2 rounded-xs bg-brand-600 text-xs font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
          {!pending && <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />}
        </button>
      </form>

      <section aria-labelledby="demo-title" className="mt-10 rounded-sm border border-dashed border-ink-300 bg-white/60 p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h2 id="demo-title" className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-ink-500">
            Demo accounts
          </h2>
          <p className="text-xs text-ink-500">
            Password <code className="rounded-xs bg-ink-950 px-1.5 py-0.5 font-mono text-[0.6875rem] text-white">{password}</code>
          </p>
        </div>
        <p className="mt-1 text-xs text-ink-400">Pitch prototype only. Pick a role to fill the form.</p>
        <ul className="mt-3 divide-y divide-line">
          {demo.map((d) => (
            <li key={d.email}>
              <button
                type="button"
                onClick={() => {
                  if (email.current) email.current.value = d.email;
                  if (pw.current) pw.current.value = password;
                  pw.current?.focus();
                }}
                className="group flex w-full items-center gap-3 py-2 text-left"
              >
                <span className="w-32 shrink-0 text-[0.8125rem] font-semibold text-ink-950 group-hover:text-brand-600">{d.role}</span>
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-ink-500">{d.email}</span>
                <ArrowRight className="size-3.5 shrink-0 text-ink-300 group-hover:text-brand-600" aria-hidden />
                <span className="sr-only">Use the {d.role} account</span>
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

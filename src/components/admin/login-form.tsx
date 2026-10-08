"use client";

import { useActionState } from "react";
import { ArrowRight, CircleAlert } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import type { FormState } from "@/lib/actions/helpers";
import { cn } from "@/lib/utils";
import { inputCls } from "./styles";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(loginAction, {} as FormState);
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
            id="email"
            name="email"
            type="email"
            autoComplete="username" spellCheck={false} autoCapitalize="none" maxLength={200}
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
            id="password"
            name="password"
            type="password"
            autoComplete="current-password" maxLength={200}
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

    </>
  );
}

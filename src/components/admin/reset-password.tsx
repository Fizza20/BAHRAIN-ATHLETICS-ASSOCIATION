"use client";

import { startTransition, useActionState, useEffect, useRef } from "react";
import { CircleAlert, KeyRound } from "lucide-react";
import { resetPassword } from "@/lib/actions/users";
import type { FormState } from "@/lib/actions/helpers";
import { inputCls } from "./styles";
import { toast } from "./toast";

export function ResetPasswordForm({ userId }: { userId: number }) {
  const [state, action, pending] = useActionState(resetPassword, {} as FormState);
  const ref = useRef<HTMLFormElement>(null);
  const errors = state.errors ?? {};
  useEffect(() => {
    if (!state.message) return;
    toast(state.message, state.ok ? "success" : "error");
    if (state.ok) ref.current?.reset();
  }, [state]);
  return (
    <form
      ref={ref}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => action(fd));
      }}
      className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
    >
      <input type="hidden" name="id" value={userId} />
      {(["password", "confirm"] as const).map((name) => (
        <div key={name}>
          <label htmlFor={`rp-${name}`} className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-900">
            {name === "password" ? "New password" : "Confirm password"}
          </label>
          <input id={`rp-${name}`} name={name} type="password" autoComplete="new-password" aria-invalid={errors[name] ? true : undefined} aria-describedby={errors[name] ? `rp-${name}-err` : undefined} className={inputCls} />
          {errors[name] && (
            <p id={`rp-${name}-err`} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-700">
              <CircleAlert className="size-3.5" aria-hidden /> {errors[name]}
            </p>
          )}
        </div>
      ))}
      <button type="submit" disabled={pending} className="inline-flex h-10 items-center gap-2 rounded-xs bg-ink-950 px-4 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white hover:bg-ink-800 disabled:opacity-60 sm:mt-[1.6rem]">
        <KeyRound className="size-4" aria-hidden /> {pending ? "Resetting…" : "Reset password"}
      </button>
    </form>
  );
}

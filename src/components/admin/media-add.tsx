"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { CircleAlert, Plus, X } from "lucide-react";
import { addMedia } from "@/lib/actions/media";
import type { FormState } from "@/lib/actions/helpers";
import { cn } from "@/lib/utils";
import { inputCls } from "./styles";
import { thumb } from "./thumb";
import { toast } from "./toast";

export function MediaAddDialog() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, pending] = useActionState(async (prev: FormState, fd: FormData) => {
    const r = await addMedia(prev, fd);
    if (r.ok && r.message) {
      toast(r.message);
      setOpen(false);
      setUrl("");
      formRef.current?.reset();
      router.refresh();
      return {} as FormState;
    }
    return r;
  }, {} as FormState);
  const errors = state.errors ?? {};

  const field = (name: string, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, required = false) => (
    <div>
      <label htmlFor={`m-${name}`} className="mb-1.5 flex gap-1 text-[0.8125rem] font-semibold text-ink-900">
        {label}
        {required && <span className="text-brand-600" aria-hidden>*</span>}
      </label>
      <input id={`m-${name}`} name={name} aria-invalid={errors[name] ? true : undefined} aria-describedby={errors[name] ? `m-${name}-err` : undefined} className={inputCls} {...props} />
      {errors[name] && (
        <p id={`m-${name}-err`} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-700">
          <CircleAlert className="size-3.5" aria-hidden /> {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger className="inline-flex h-11 items-center gap-2 rounded-xs bg-brand-600 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-brand-700">
        <Plus className="size-4" aria-hidden /> Add media
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-sm bg-white focus:outline-none">
          <div className="h-1 bg-ink-950" aria-hidden />
          <div className="flex items-start justify-between gap-4 px-6 pt-5">
            <div>
              <Dialog.Title className="text-xl font-extrabold uppercase [font-variation-settings:'wdth'_78]">Add to media library</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-ink-500">Paste a hosted image URL. Alt text is required for accessibility.</Dialog.Description>
            </div>
            <Dialog.Close className="flex size-8 items-center justify-center rounded-xs hover:bg-ink-950/5">
              <X className="size-4" aria-hidden />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>
          <form
            ref={formRef}
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              startTransition(() => action(fd));
            }}
            className="grid gap-5 p-6 sm:grid-cols-[1fr_11rem]"
          >
            <div className="space-y-4">
              {field("url", "Image URL", { type: "url", placeholder: "https://…", value: url, onChange: (e) => setUrl(e.target.value), className: cn(inputCls, "font-mono text-[0.8125rem]") }, true)}
              {field("title", "Title", { placeholder: "National championships, 100m final" }, true)}
              {field("alt", "Alt text", { placeholder: "Describe what the image shows" }, true)}
              <div className="grid gap-4 sm:grid-cols-2">
                {field("credit", "Credit", { placeholder: "Photographer / agency" })}
                <div>
                  <label htmlFor="m-kind" className="mb-1.5 block text-[0.8125rem] font-semibold text-ink-900">Kind</label>
                  <select id="m-kind" name="kind" defaultValue="image" className={cn(inputCls, "appearance-none")}>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                    <option value="document">Document</option>
                  </select>
                </div>
              </div>
              {field("tags", "Tags", { placeholder: "sprints, national-team" })}
            </div>
            <div>
              <p className="mb-1.5 text-[0.8125rem] font-semibold text-ink-900">Preview</p>
              <div className="aspect-[3/4] overflow-hidden rounded-xs border border-line bg-pearl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {url.startsWith("https://") ? <img src={thumb(url)} alt="" className="size-full object-cover" /> : <span className="flex size-full items-center justify-center text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-400">No image</span>}
              </div>
            </div>
            {state.message && !state.ok && (
              <p role="alert" className="text-sm font-medium text-brand-700 sm:col-span-2">{state.message}</p>
            )}
            <div className="flex justify-end gap-2 border-t border-line pt-4 sm:col-span-2">
              <Dialog.Close className="h-11 rounded-xs px-4 text-xs font-semibold uppercase tracking-[0.08em] text-ink-700 hover:bg-ink-950/5">Cancel</Dialog.Close>
              <button type="submit" disabled={pending} className="h-11 rounded-xs bg-brand-600 px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white hover:bg-brand-700 disabled:opacity-60">
                {pending ? "Adding…" : "Add to library"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

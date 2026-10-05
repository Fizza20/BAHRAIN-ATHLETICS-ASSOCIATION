"use client";

import { startTransition, useActionState, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { CircleAlert, Images, Search, X } from "lucide-react";
import { cn, slugify } from "@/lib/utils";
import type { FormState } from "@/lib/actions/helpers";
import { toast } from "./toast";
import { thumb } from "./thumb";
import { inputCls } from "./styles";

export type Opt = { value: string; label: string; hint?: string };
export type FieldType =
  | "text"
  | "email"
  | "url"
  | "number"
  | "date"
  | "datetime-local"
  | "password"
  | "textarea"
  | "select"
  | "checkbox"
  | "slug"
  | "image"
  | "multi";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  hint?: string;
  placeholder?: string;
  span?: "full" | "half" | "third" | "two-thirds";
  rows?: number;
  options?: Opt[];
  /** Label for the empty option of a select. Omit to make the select required-only. */
  emptyLabel?: string;
  /** slug: the field it is generated from. */
  from?: string;
  /** slug: public URL prefix shown before the input. */
  prefix?: string;
  min?: number;
  max?: number;
  step?: string;
  mono?: boolean;
  autoComplete?: string;
};

export type Section = { title: string; description?: string; fields: FieldDef[] };
export type MediaItem = { url: string; alt: string; title: string };
export type FormValue = string | number | boolean | null | undefined | string[];
type Intent = { value: string; label: string; variant?: "primary" | "secondary" };

const labelText = "text-[0.8125rem] font-semibold text-ink-900";

const spanCls = { full: "sm:col-span-6", half: "sm:col-span-3", third: "sm:col-span-2", "two-thirds": "sm:col-span-4" };

/**
 * Config-driven entity form. Server pages pass plain field definitions + defaults; the
 * server action re-validates everything with zod and returns field errors.
 * Submits via startTransition (not the form `action` prop) so React doesn't reset the
 * inputs when validation fails.
 */
export function EntityForm({
  action,
  sections,
  defaults,
  hidden,
  cancelHref,
  submitLabel = "Save changes",
  intents,
  media = [],
  footerExtra,
}: {
  action: (state: FormState, fd: FormData) => Promise<FormState>;
  sections: Section[];
  defaults: Record<string, unknown>;
  hidden?: Record<string, string | number | null | undefined>;
  cancelHref: string;
  submitLabel?: string;
  /** Multiple submit buttons that send `intent=<value>` (e.g. Save draft / Publish). */
  intents?: Intent[];
  media?: MediaItem[];
  footerExtra?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.message && !state.ok) {
      toast(state.message, "error");
      formRef.current?.querySelector<HTMLElement>("[aria-invalid=true]")?.focus();
    }
  }, [state]);

  const slugFields = useMemo(() => sections.flatMap((s) => s.fields).filter((f) => f.type === "slug"), [sections]);
  const [slugs, setSlugs] = useState<Record<string, { value: string; touched: boolean }>>(() =>
    Object.fromEntries(slugFields.map((f) => [f.name, { value: String(defaults[f.name] ?? ""), touched: !!defaults[f.name] }])),
  );

  const onChange = (e: React.FormEvent<HTMLFormElement>) => {
    const t = e.target as HTMLInputElement;
    for (const f of slugFields) {
      const sources = (f.from ?? "").split(",");
      if (sources.includes(t.name) && !slugs[f.name]?.touched) {
        const form = e.currentTarget;
        const text = sources.map((n) => (form.elements.namedItem(n) as HTMLInputElement | null)?.value ?? "").join(" ");
        setSlugs((s) => ({ ...s, [f.name]: { value: slugify(text), touched: false } }));
      }
    }
  };

  const errors = state.errors ?? {};

  return (
    <form
      ref={formRef}
      noValidate
      onChange={onChange}
      onSubmit={(e) => {
        e.preventDefault();
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const fd = new FormData(e.currentTarget, submitter);
        startTransition(() => formAction(fd));
      }}
      className="pb-28"
    >
      {Object.entries(hidden ?? {}).map(([k, v]) => (v === null || v === undefined ? null : <input key={k} type="hidden" name={k} value={String(v)} />))}

      {state.message && !state.ok && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-sm border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div>
            <p className="font-semibold">{state.message}</p>
            {Object.keys(errors).length > 0 && <p className="mt-0.5 text-brand-700">{Object.keys(errors).length} field(s) need attention.</p>}
          </div>
        </div>
      )}

      <div className="space-y-6">
        {sections.map((section) => (
          <fieldset key={section.title} className="grid gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
            <legend className="sr-only">{section.title}</legend>
            <div className="pt-1">
              <p className="text-[0.8125rem] font-bold uppercase tracking-[0.08em] text-ink-950 [font-variation-settings:'wdth'_85]" aria-hidden>
                {section.title}
              </p>
              {section.description && <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-500">{section.description}</p>}
            </div>
            <div className="grid grid-cols-1 gap-x-4 gap-y-5 rounded-sm border border-line bg-white p-5 sm:grid-cols-6 md:p-6">
              {section.fields.map((f) => (
                <div key={f.name} className={cn("col-span-1", spanCls[f.span ?? "full"])}>
                  <Field
                    def={f}
                    defaultValue={defaults[f.name] as FormValue}
                    error={errors[f.name]}
                    media={media}
                    slug={slugs[f.name]}
                    onSlug={(value) => setSlugs((s) => ({ ...s, [f.name]: { value, touched: true } }))}
                  />
                </div>
              ))}
            </div>
          </fieldset>
        ))}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white/95 backdrop-blur lg:left-64">
        <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-8">
          <div className="hidden min-w-0 text-xs text-ink-500 sm:block">{footerExtra ?? "All changes are validated on the server and logged."}</div>
          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <Link href={cancelHref} className="inline-flex h-11 items-center rounded-xs px-4 text-xs font-semibold uppercase tracking-[0.08em] text-ink-700 hover:bg-ink-950/5">
              Cancel
            </Link>
            {(intents ?? [{ value: "save", label: submitLabel, variant: "primary" as const }]).map((i) => (
              <button
                key={i.value}
                type="submit"
                name="intent"
                value={i.value}
                disabled={pending}
                className={cn(
                  "inline-flex h-11 items-center rounded-xs px-5 text-xs font-semibold uppercase tracking-[0.08em] text-white transition-colors disabled:opacity-60",
                  i.variant === "secondary" ? "bg-ink-950 hover:bg-ink-800" : "bg-brand-600 hover:bg-brand-700",
                )}
              >
                {pending ? "Saving…" : i.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </form>
  );
}

function Field({
  def: f,
  defaultValue,
  error,
  media,
  slug,
  onSlug,
}: {
  def: FieldDef;
  defaultValue: FormValue;
  error?: string;
  media: MediaItem[];
  slug?: { value: string; touched: boolean };
  onSlug: (v: string) => void;
}) {
  const id = `f-${f.name}`;
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const described = [error ? errId : null, f.hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  const common = { id, name: f.name, "aria-invalid": error ? true : undefined, "aria-describedby": described, required: f.required };

  if (f.type === "checkbox") {
    return (
      <div>
        <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-xs border border-line px-3 py-2.5 hover:border-ink-300">
          <input type="checkbox" {...common} defaultChecked={!!defaultValue} className="mt-0.5 size-4 shrink-0 accent-brand-600" />
          <span>
            <span className={labelText}>{f.label}</span>
            {f.hint && (
              <span id={hintId} className="mt-0.5 block text-xs text-ink-500">
                {f.hint}
              </span>
            )}
          </span>
        </label>
        <FieldError id={errId} error={error} />
      </div>
    );
  }

  let control: React.ReactNode;
  switch (f.type) {
    case "textarea":
      control = <textarea {...common} defaultValue={(defaultValue as string) ?? ""} rows={f.rows ?? 4} placeholder={f.placeholder} className={cn(inputCls, "h-auto py-2.5 leading-relaxed", f.mono && "font-mono text-[0.8125rem]")} />;
      break;
    case "select":
      control = (
        <div className="relative">
          <select {...common} defaultValue={defaultValue === null || defaultValue === undefined ? "" : String(defaultValue)} className={cn(inputCls, "appearance-none pr-9")}>
            {f.emptyLabel !== undefined && <option value="">{f.emptyLabel}</option>}
            {f.options?.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2 text-ink-500" viewBox="0 0 12 12" aria-hidden>
            <path d="M3 4.5 6 7.5 9 4.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </div>
      );
      break;
    case "slug":
      control = (
        <div className="flex">
          {f.prefix && <span className="inline-flex h-10 items-center rounded-l-xs border border-r-0 border-line bg-pearl px-3 font-mono text-xs text-ink-500">{f.prefix}</span>}
          <input
            {...common}
            value={slug?.value ?? ""}
            onChange={(e) => onSlug(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className={cn(inputCls, "font-mono text-[0.8125rem]", f.prefix && "rounded-l-none")}
          />
        </div>
      );
      break;
    case "image":
      return (
        <div>
          <ImageField common={common} label={f.label} required={f.required} defaultValue={(defaultValue as string) ?? ""} media={media} placeholder={f.placeholder} />
          {f.hint && (
            <p id={hintId} className="mt-1.5 text-xs text-ink-500">
              {f.hint}
            </p>
          )}
          <FieldError id={errId} error={error} />
        </div>
      );
    case "multi":
      return (
        <div>
          <MultiField id={id} name={f.name} label={f.label} options={f.options ?? []} defaultValue={(defaultValue as string[]) ?? []} />
          {f.hint && (
            <p id={hintId} className="mt-1.5 text-xs text-ink-500">
              {f.hint}
            </p>
          )}
          <FieldError id={errId} error={error} />
        </div>
      );
    default:
      control = (
        <input
          {...common}
          type={f.type}
          defaultValue={defaultValue === null || defaultValue === undefined ? "" : String(defaultValue)}
          placeholder={f.placeholder}
          min={f.min}
          max={f.max}
          step={f.step}
          autoComplete={f.autoComplete}
          className={cn(inputCls, f.mono && "font-mono text-[0.8125rem]", (f.type === "number" || f.type === "date") && "tabular")}
        />
      );
  }

  return (
    <div>
      <label htmlFor={id} className={cn(labelText, "mb-1.5 flex items-baseline gap-1")}>
        {f.label}
        {f.required && (
          <span className="text-brand-600" aria-hidden>
            *
          </span>
        )}
      </label>
      {control}
      {f.hint && (
        <p id={hintId} className="mt-1.5 text-xs text-ink-500">
          {f.hint}
        </p>
      )}
      <FieldError id={errId} error={error} />
    </div>
  );
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-brand-700">
      <CircleAlert className="size-3.5 shrink-0" aria-hidden />
      {error}
    </p>
  );
}

function ImageField({
  common,
  label,
  required,
  defaultValue,
  media,
  placeholder,
}: {
  common: Record<string, unknown> & { id: string; name: string };
  label: string;
  required?: boolean;
  defaultValue: string;
  media: MediaItem[];
  placeholder?: string;
}) {
  const [url, setUrl] = useState(defaultValue);
  const [broken, setBroken] = useState(false);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const shown = media.filter((m) => !q || `${m.title} ${m.alt}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
      <div>
        <label htmlFor={common.id} className={cn(labelText, "mb-1.5 flex items-baseline gap-1")}>
          {label}
          {required && (
            <span className="text-brand-600" aria-hidden>
              *
            </span>
          )}
        </label>
        <div className="flex gap-2">
          <input
            {...common}
            type="url"
            value={url}
            placeholder={placeholder ?? "https://…"}
            onChange={(e) => {
              setUrl(e.target.value);
              setBroken(false);
            }}
            className={cn(inputCls, "font-mono text-[0.8125rem]")}
          />
          {media.length > 0 && (
            <Dialog.Root open={open} onOpenChange={setOpen}>
              <Dialog.Trigger className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xs border border-ink-950 px-3 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-950 hover:bg-ink-950 hover:text-white">
                <Images className="size-4" aria-hidden /> Library
              </Dialog.Trigger>
              <Dialog.Portal>
                <Dialog.Overlay className="fixed inset-0 z-50 bg-ink-950/50" />
                <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[85dvh] w-[calc(100vw-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-sm bg-white focus:outline-none">
                  <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
                    <Dialog.Title className="text-lg font-extrabold uppercase [font-variation-settings:'wdth'_78]">Media library</Dialog.Title>
                    <Dialog.Close className="flex size-8 items-center justify-center rounded-xs hover:bg-ink-950/5">
                      <X className="size-4" aria-hidden />
                      <span className="sr-only">Close</span>
                    </Dialog.Close>
                  </div>
                  <Dialog.Description className="sr-only">Pick an image to use</Dialog.Description>
                  <div className="border-b border-line px-5 py-3">
                    <label className="relative block">
                      <span className="sr-only">Filter media</span>
                      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
                      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by title or alt text" className={cn(inputCls, "pl-9")} />
                    </label>
                  </div>
                  <ul className="grid grid-cols-2 gap-3 overflow-y-auto p-5 sm:grid-cols-4">
                    {shown.map((m) => (
                      <li key={m.url}>
                        <button
                          type="button"
                          onClick={() => {
                            setUrl(m.url);
                            setBroken(false);
                            setOpen(false);
                          }}
                          className={cn("group block w-full overflow-hidden rounded-xs border text-left", url === m.url ? "border-brand-600 ring-2 ring-brand-600" : "border-line hover:border-ink-950")}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={thumb(m.url)} alt={m.alt} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                          <span className="block truncate px-2 py-1.5 text-xs text-ink-700">{m.title}</span>
                        </button>
                      </li>
                    ))}
                    {shown.length === 0 && <li className="col-span-full py-10 text-center text-sm text-ink-500">No media matches.</li>}
                  </ul>
                </Dialog.Content>
              </Dialog.Portal>
            </Dialog.Root>
          )}
        </div>
      </div>
      <div className="relative aspect-[4/3] overflow-hidden rounded-xs border border-line bg-pearl">
        {url && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb(url)} alt="Preview" className="size-full object-cover" onError={() => setBroken(true)} />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center px-2 text-center text-[0.625rem] font-semibold uppercase tracking-[0.14em] text-ink-400">
            {broken ? "Can’t load image" : "No image"}
          </span>
        )}
      </div>
    </div>
  );
}


function MultiField({ id, name, label, options, defaultValue }: { id: string; name: string; label: string; options: Opt[]; defaultValue: string[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(defaultValue));
  const [q, setQ] = useState("");
  const shown = options.filter((o) => !q || o.label.toLowerCase().includes(q.toLowerCase()));
  return (
    <div role="group" aria-labelledby={`${id}-label`}>
      <div className="mb-1.5 flex items-baseline justify-between">
        <span id={`${id}-label`} className={labelText}>
          {label}
        </span>
        <span className="text-xs text-ink-500 tabular">{selected.size} selected</span>
      </div>
      <div className="rounded-xs border border-line">
        <label className="relative block border-b border-line">
          <span className="sr-only">Filter {label}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-400" aria-hidden />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter…" className="h-9 w-full bg-transparent pl-9 pr-3 text-sm focus:outline-none" />
        </label>
        <ul className="grid max-h-56 grid-cols-1 overflow-y-auto p-1 sm:grid-cols-2">
          {options.map((o) => (
            <li key={o.value} className={cn(!shown.includes(o) && "hidden")}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xs px-2 py-1.5 text-sm hover:bg-pearl">
                <input
                  type="checkbox"
                  name={name}
                  value={o.value}
                  checked={selected.has(o.value)}
                  onChange={(e) =>
                    setSelected((s) => {
                      const n = new Set(s);
                      if (e.target.checked) n.add(o.value);
                      else n.delete(o.value);
                      return n;
                    })
                  }
                  className="size-4 accent-brand-600"
                />
                <span className="truncate">{o.label}</span>
                {o.hint && <span className="ml-auto shrink-0 text-xs text-ink-400">{o.hint}</span>}
              </label>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

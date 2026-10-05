/** Loading skeleton for list pages: header, toolbar, table rows. */
export function ListSkeleton() {
  const bar = "animate-pulse rounded-xs bg-ink-950/[0.06]";
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-line pb-6">
        <div className="space-y-3">
          <div className={`${bar} h-3 w-24`} />
          <div className={`${bar} h-9 w-56`} />
          <div className={`${bar} h-3 w-96 max-w-full`} />
        </div>
        <div className={`${bar} hidden h-11 w-36 sm:block`} />
      </div>
      <div className="mb-4 flex gap-2">
        <div className={`${bar} h-10 w-full max-w-sm`} />
        <div className={`${bar} hidden h-10 w-32 md:block`} />
        <div className={`${bar} hidden h-10 w-32 md:block`} />
      </div>
      <div className="overflow-hidden rounded-sm border border-line bg-white">
        <div className="h-10 border-b border-line bg-pearl/70" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-line px-4 py-3.5 last:border-0">
            <div className={`${bar} size-9 shrink-0`} />
            <div className="flex-1 space-y-2">
              <div className={`${bar} h-3`} style={{ width: `${40 + ((i * 17) % 35)}%` }} />
              <div className={`${bar} h-2.5 w-1/4`} />
            </div>
            <div className={`${bar} hidden h-3 w-24 md:block`} />
            <div className={`${bar} hidden h-3 w-16 md:block`} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function FormSkeleton() {
  const bar = "animate-pulse rounded-xs bg-ink-950/[0.06]";
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="mb-6 space-y-3 border-b border-line pb-6">
        <div className={`${bar} h-3 w-24`} />
        <div className={`${bar} h-9 w-72`} />
      </div>
      {[0, 1].map((k) => (
        <div key={k} className="mb-6 grid gap-4 lg:grid-cols-[15rem_1fr] lg:gap-10">
          <div className={`${bar} h-4 w-28`} />
          <div className="space-y-5 rounded-sm border border-line bg-white p-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="space-y-2">
                <div className={`${bar} h-3 w-24`} />
                <div className={`${bar} h-10`} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function OverviewSkeleton() {
  const bar = "animate-pulse rounded-sm bg-ink-950/[0.06]";
  return (
    <div className="space-y-6" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <div className="h-40 animate-pulse rounded-sm bg-ink-950/90" />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line sm:grid-cols-4 xl:grid-cols-7">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-32 bg-white p-5">
            <div className={`${bar} h-3 w-16`} />
            <div className={`${bar} mt-4 h-9 w-12`} />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className={`${bar} h-80 xl:col-span-2`} />
        <div className={`${bar} h-80`} />
      </div>
    </div>
  );
}

import { getT } from "@/lib/i18n/server";

export default async function Loading() {
  const { t } = await getT();
  return (
    <div aria-busy="true" aria-label={t("loading.aria")} className="min-h-screen bg-bone">
      <div className="border-b border-line bg-pearl py-12">
        <div className="container-x">
          <div className="h-3 w-40 animate-pulse rounded-xs bg-ink-100" />
          <div className="mt-6 h-12 w-2/3 animate-pulse rounded-xs bg-ink-100" />
          <div className="mt-5 h-4 w-1/2 animate-pulse rounded-xs bg-ink-100" />
        </div>
      </div>
      <div className="container-x grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-md bg-ink-100" />
        ))}
      </div>
    </div>
  );
}

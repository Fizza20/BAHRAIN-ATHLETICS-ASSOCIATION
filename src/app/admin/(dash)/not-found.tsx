import Link from "next/link";
import { EmptyState } from "@/components/admin/ui";

export default function NotFound() {
  return (
    <EmptyState
      title="Not found"
      description="This record doesn’t exist or was deleted."
      action={
        <Link href="/admin" className="inline-flex h-10 items-center rounded-xs bg-ink-950 px-4 text-xs font-semibold uppercase tracking-[0.08em] text-white">
          Back to overview
        </Link>
      }
    />
  );
}

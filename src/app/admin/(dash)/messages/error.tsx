"use client";

import { AdminError } from "@/components/admin/error-view";

export default function Error(props: { error: Error & { digest?: string }; retry: () => void }) {
  return <AdminError {...props} />;
}

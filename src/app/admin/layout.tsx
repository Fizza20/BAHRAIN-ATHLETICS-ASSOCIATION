import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n/client";

export const metadata: Metadata = {
  title: { default: "Control room", template: "%s · BAA Control room" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  // The control room is English-only and always left-to-right, whatever language the public site is in.
  return (
    <div dir="ltr" lang="en">
      <I18nProvider locale="en">{children}</I18nProvider>
    </div>
  );
}

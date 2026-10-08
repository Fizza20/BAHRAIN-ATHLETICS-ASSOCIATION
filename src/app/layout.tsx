import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Sans_Arabic, Instrument_Serif } from "next/font/google";
import { SITE_URL } from "@/lib/utils";
import { getLocale } from "@/lib/i18n/server";
import { dirOf } from "@/lib/i18n/config";
import { I18nProvider } from "@/lib/i18n/client";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Bahrain Athletics Association | The home of Bahraini athletics",
    template: "%s | Bahrain Athletics Association",
  },
  description:
    "Official platform of the Bahrain Athletics Association: athletes, results, competitions, events, news and clean athletics for the Kingdom of Bahrain.",
  applicationName: "Bahrain Athletics Association",
  openGraph: {
    type: "website",
    siteName: "Bahrain Athletics Association",
    locale: "en_BH",
    alternateLocale: ["ar_BH"],
  },
  twitter: { card: "summary_large_image", site: "@baa_bh" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [{ color: "#ffffff" }],
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  return (
    <html lang={locale} dir={dirOf(locale)} className={`${archivo.variable} ${plexArabic.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-dvh">
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}

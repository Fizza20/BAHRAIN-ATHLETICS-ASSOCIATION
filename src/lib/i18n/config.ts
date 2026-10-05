export const LOCALES = ["en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "baa-locale";

export const dirOf = (l: Locale): "ltr" | "rtl" => (l === "ar" ? "rtl" : "ltr");

/** BCP-47 tags for Intl. Arabic uses the Gregorian calendar and Latin digits so marks and dates stay consistent. */
export const INTL_TAG: Record<Locale, string> = {
  en: "en-GB",
  ar: "ar-BH-u-ca-gregory-nu-latn",
};

export const isLocale = (v: unknown): v is Locale => LOCALES.includes(v as Locale);

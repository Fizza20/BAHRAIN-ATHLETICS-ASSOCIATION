import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, dirOf, isLocale, type Locale } from "./config";
import { translate, type TFn } from "./dict";

export const getLocale = cache(async (): Promise<Locale> => {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : DEFAULT_LOCALE;
});

/** Server components: `const { t, locale, dir } = await getT();` */
export async function getT() {
  const locale = await getLocale();
  const t: TFn = (key, vars) => translate(locale, key, vars);
  return { t, locale, dir: dirOf(locale) };
}

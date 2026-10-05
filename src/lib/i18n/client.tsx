"use client";

import { createContext, useContext, useMemo } from "react";
import { MotionConfig } from "motion/react";
import { dirOf, type Locale } from "./config";
import { translate, type TFn } from "./dict";

type Ctx = { locale: Locale; dir: "ltr" | "rtl"; t: TFn };
const I18nContext = createContext<Ctx>({ locale: "en", dir: "ltr", t: (k, v) => translate("en", k, v) });

export function I18nProvider({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const value = useMemo<Ctx>(() => ({ locale, dir: dirOf(locale), t: (k, v) => translate(locale, k, v) }), [locale]);
  return (
    <I18nContext.Provider value={value}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </I18nContext.Provider>
  );
}

/** Client components and shared presentational components: `const { t, locale } = useI18n();` */
export function useI18n() {
  return useContext(I18nContext);
}

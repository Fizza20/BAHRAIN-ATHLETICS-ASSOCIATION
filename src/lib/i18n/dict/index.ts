import type { Locale } from "../config";
import common from "./common";
import home from "./home";
import athletes from "./athletes";
import results from "./results";
import competitions from "./competitions";
import events from "./events";
import news from "./news";
import about from "./about";
import clean from "./clean";
import misc from "./misc";

const modules = [common, home, athletes, results, competitions, events, news, about, clean, misc];

export type DictKey = keyof (typeof common)["en"] |
  keyof (typeof home)["en"] |
  keyof (typeof athletes)["en"] |
  keyof (typeof results)["en"] |
  keyof (typeof competitions)["en"] |
  keyof (typeof events)["en"] |
  keyof (typeof news)["en"] |
  keyof (typeof about)["en"] |
  keyof (typeof clean)["en"] |
  keyof (typeof misc)["en"];

export type Dict = Record<string, string>;

export const dictionaries: Record<Locale, Dict> = {
  en: Object.assign({}, ...modules.map((m) => m.en)),
  ar: Object.assign({}, ...modules.map((m) => m.ar)),
};

export function translate(locale: Locale, key: DictKey, vars?: Record<string, string | number>) {
  let s = dictionaries[locale][key] ?? dictionaries.en[key] ?? key;
  if (vars) for (const [k, v] of Object.entries(vars)) s = s.replaceAll(`{${k}}`, String(v));
  return s;
}

export type TFn = (key: DictKey, vars?: Record<string, string | number>) => string;

/** Build a dictionary key from a data value, e.g. keyOf("category", a.category) -> "category.senior". */
export function keyOf(prefix: string, value: string): DictKey {
  return `${prefix}.${value}` as DictKey;
}

export type UnitSystem = "metric" | "imperial";

/**
 * Initial measurement system per UI locale.
 *
 * Only English-locale visitors (this site's `en` targets US traffic first)
 * start in imperial; every other locale defaults to metric. This only picks
 * the initial toggle position — users can always switch manually, and tools
 * that persist drafts keep whatever the user last chose.
 */
export function defaultUnitSystem(locale: string): UnitSystem {
  return locale === "en" || locale.startsWith("en-") ? "imperial" : "metric";
}

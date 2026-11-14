/**
 * Fills `{name}` slots in a text: tr('Mission day {day}', { day: 61 }) → "Mission day 61".
 * Every text the app shows passes through here, so there is one place to change if the app
 * is ever offered in another language.
 */
export function tr(text: string, vars?: Record<string, string | number>): string {
  let out = text
  if (vars) for (const k in vars) out = out.replaceAll(`{${k}}`, String(vars[k]))
  return out
}

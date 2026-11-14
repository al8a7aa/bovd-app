/**
 * Reaction-time self-test, modelled on the idea behind NASA's Reaction Self-Test on the space
 * station (a 3-minute psychomotor vigilance test, one of the ten tests in NASA's Cognition battery).
 * Lost sleep slows reactions before a person feels tired, so the test is an early warning.
 *
 * This is a simplified version: screens and mice add their own delay, so a result is only
 * compared with the same person's earlier results on the same device, never with a fixed limit.
 */

export interface ReactionResult {
  /** middle reaction time in milliseconds */
  median: number
  /** responses slower than SLOW_MS, including ones never answered */
  slow: number
  /** taps before the number appeared */
  early: number
  trials: number
}

/** day → that day's result */
export type Reactions = Record<number, ReactionResult>

/** A response this slow counts as a lapse of attention. */
export const SLOW_MS = 500
/** No answer after this long: the trial ends and counts as slow. */
export const TIMEOUT_MS = 3000
/** How much slower than usual counts as a warning. */
const SLOWER_BY = 1.15
const BASELINE_TESTS = 5
const BASELINE_MIN = 3

export function summarize(times: number[], early: number): ReactionResult {
  const sorted = [...times].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median = sorted.length === 0 ? 0 : sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
  return { median: Math.round(median), slow: times.filter((t) => t >= SLOW_MS).length, early, trials: times.length }
}

/** The person's usual speed: the average of their first few tests. Null until there are enough. */
export function usualSpeed(results: Reactions): number | null {
  const first = Object.keys(results).map(Number).sort((a, b) => a - b).slice(0, BASELINE_TESTS)
  if (first.length < BASELINE_MIN) return null
  return Math.round(first.reduce((sum, d) => sum + results[d].median, 0) / first.length)
}

export const isSlower = (result: ReactionResult, usual: number | null) => usual !== null && result.median > usual * SLOWER_BY

/** The most recent result from today or yesterday; older ones say nothing about now. */
export function recentReaction(results: Reactions, today: number): { day: number; result: ReactionResult } | null {
  for (const day of [today, today - 1]) if (results[day]) return { day, result: results[day] }
  return null
}

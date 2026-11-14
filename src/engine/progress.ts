import { INDICATORS } from '../data/indicators'
import { assessEntry, type Entries, type Entry } from './status'

/** Daily habits that earn points. */
export function dailyGoals(entry: Entry | undefined): { id: string; label: string; done: boolean }[] {
  const v = entry?.values ?? {}
  return [
    { id: 'checkin', label: 'Complete today’s health check', done: !!entry },
    { id: 'exercise', label: 'Exercise for 90 minutes or more', done: (v.exercise ?? 0) >= 90 },
    { id: 'sleep', label: 'Sleep 7 hours or more', done: (v.sleep ?? 0) >= 7 },
    { id: 'water', label: 'Drink 2 litres or more', done: (v.water ?? 0) >= 2 },
  ]
}

/** Consecutive logged days ending today, or yesterday if today is not logged yet. */
export function streak(entries: Entries, today: number): number {
  let d = entries[today] ? today : today - 1
  let n = 0
  while (d >= 1 && entries[d]) {
    n++
    d--
  }
  return n
}

function longestRun(entries: Entries, today: number, ok: (e: Entry) => boolean): number {
  let best = 0
  let run = 0
  for (let d = 1; d <= today; d++) {
    const e = entries[d]
    run = e && ok(e) ? run + 1 : 0
    if (run > best) best = run
  }
  return best
}

export const POINTS_PER_GOAL = 10
export const POINTS_PER_LEVEL = 200
export const RANKS = ['Cadet', 'Crew member', 'Specialist', 'Flight engineer', 'Pilot', 'Commander']

export function totalPoints(entries: Entries, today: number): number {
  let points = 0
  for (let d = 1; d <= today; d++) {
    if (entries[d]) points += dailyGoals(entries[d]).filter((g) => g.done).length * POINTS_PER_GOAL
  }
  return points
}

export interface Badge {
  id: string
  name: string
  how: string
  earned: boolean
}

export function badges(entries: Entries, today: number): Badge[] {
  const logged = longestRun(entries, today, () => true)
  const allGreen = Object.values(entries).some((e) => {
    const a = Object.values(assessEntry(entries, e))
    return a.length === INDICATORS.length && a.every((x) => x.status === 'green')
  })
  const run = (ok: (e: Entry) => boolean) => longestRun(entries, today, ok)
  return [
    { id: 'first', name: 'First check', how: 'Log your first health check', earned: logged >= 1 },
    { id: 'week', name: 'Steady week', how: 'Log 7 days in a row', earned: logged >= 7 },
    { id: 'month', name: 'Mission habit', how: 'Log 30 days in a row', earned: logged >= 30 },
    { id: 'bones', name: 'Iron bones', how: 'Hit the exercise target 7 days in a row', earned: run((e) => (e.values.exercise ?? 0) >= 90) >= 7 },
    { id: 'rest', name: 'Well rested', how: 'Sleep 7 hours or more for 5 nights in a row', earned: run((e) => (e.values.sleep ?? 0) >= 7) >= 5 },
    { id: 'hydrated', name: 'Hydrated', how: 'Drink 2 litres or more for 7 days in a row', earned: run((e) => (e.values.water ?? 0) >= 2) >= 7 },
    { id: 'green', name: 'All systems go', how: 'Have every indicator in the normal range on one day', earned: allGreen },
  ]
}

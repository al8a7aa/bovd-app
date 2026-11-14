import { useMemo } from 'react'
import { CREW, PLACE } from './data/places'
import type { Status } from './data/indicators'
import { buildAlerts, type Alert } from './engine/guidance'
import { assessEntry, latestEntry, type Entries } from './engine/status'
import type { Reactions } from './engine/reaction'
import { missionDay, useStore } from './store'

const EMPTY: Entries = {}
const NO_TESTS: Reactions = {}

export const overallStatus = (alerts: Alert[]): Status =>
  alerts.some((a) => a.level === 'red') ? 'red' : alerts.length ? 'amber' : 'green'

/** Everything the screens need about "now" for the selected crew member. */
export function useHealth() {
  const records = useStore((s) => s.records)
  const activeId = useStore((s) => s.activeId)
  const startDate = useStore((s) => s.startDate)
  const placeId = useStore((s) => s.placeId)
  const demo = useStore((s) => s.demo)
  const reactions = useStore((s) => s.reactions?.[s.activeId] ?? NO_TESTS)
  const today = missionDay(startDate)
  const place = PLACE[placeId]
  const entries = records[activeId] ?? EMPTY

  return useMemo(() => {
    const latest = latestEntry(entries, today)
    return {
      entries,
      today,
      place,
      demo,
      member: CREW.find((c) => c.id === activeId) ?? CREW[0],
      latest,
      todayEntry: entries[today],
      assessments: latest ? assessEntry(entries, latest.entry) : {},
      reactions,
      alerts: buildAlerts(entries, today, place, reactions),
    }
  }, [entries, today, place, demo, activeId, reactions])
}

/** One overall status per crew member, for the crew switch. */
export function useCrewStatus(): { id: string; name: string; status: Status | null }[] {
  const records = useStore((s) => s.records)
  const startDate = useStore((s) => s.startDate)
  const placeId = useStore((s) => s.placeId)
  const reactions = useStore((s) => s.reactions)
  const today = missionDay(startDate)

  return useMemo(
    () =>
      CREW.map((c) => {
        const entries = records[c.id] ?? EMPTY
        const status = latestEntry(entries, today) ? overallStatus(buildAlerts(entries, today, PLACE[placeId], reactions?.[c.id])) : null
        return { id: c.id, name: c.name, status }
      }),
    [records, today, placeId, reactions],
  )
}

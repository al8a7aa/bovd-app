import { useMemo } from 'react'
import { CREW, PLACE } from './data/places'
import type { Status } from './data/indicators'
import { buildAlerts, type Alert } from './engine/guidance'
import { assessEntry, latestEntry, type Entries } from './engine/status'
import { missionDay, useStore } from './store'
import { useLang } from './i18n'

const EMPTY: Entries = {}

export const overallStatus = (alerts: Alert[]): Status =>
  alerts.some((a) => a.level === 'red') ? 'red' : alerts.length ? 'amber' : 'green'

/** Everything the screens need about "now" for the selected crew member. */
export function useHealth() {
  const records = useStore((s) => s.records)
  const activeId = useStore((s) => s.activeId)
  const startDate = useStore((s) => s.startDate)
  const placeId = useStore((s) => s.placeId)
  const demo = useStore((s) => s.demo)
  // alert texts are translated when built, so they must be rebuilt when the language changes
  const lang = useLang()
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
      alerts: buildAlerts(entries, today, place),
    }
  }, [entries, today, place, demo, activeId, lang])
}

/** One overall status per crew member, for the crew switch. */
export function useCrewStatus(): { id: string; name: string; status: Status | null }[] {
  const records = useStore((s) => s.records)
  const startDate = useStore((s) => s.startDate)
  const placeId = useStore((s) => s.placeId)
  const today = missionDay(startDate)

  return useMemo(
    () =>
      CREW.map((c) => {
        const entries = records[c.id] ?? EMPTY
        const status = latestEntry(entries, today) ? overallStatus(buildAlerts(entries, today, PLACE[placeId])) : null
        return { id: c.id, name: c.name, status }
      }),
    [records, today, placeId],
  )
}

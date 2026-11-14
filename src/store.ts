import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CREW, type PlaceId } from './data/places'
import type { Entries, Entry } from './engine/status'
import { DEMO_DAYS, applyScenario, seedEntries, type ScenarioId } from './engine/seed'

function isoDaysAgo(days: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** Mission day number for today; day 1 is the start date. */
export function missionDay(startDate: string): number {
  const [y, m, d] = startDate.split('-').map(Number)
  const start = new Date(y, m - 1, d).getTime()
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.max(1, Math.round((now.getTime() - start) / 86_400_000) + 1)
}

export interface Timer {
  id: string
  label: string
  /** epoch milliseconds */
  endsAt: number
}

interface State {
  placeId: PlaceId
  startDate: string
  /** one health record per crew member, keyed by crew id */
  records: Record<string, Entries>
  activeId: string
  /** true while the records are the simulated demo crew */
  demo: boolean
  /** ticked plan tasks and alert steps: crew id → mission day → keys */
  done: Record<string, Record<number, string[]>>
  timers: Timer[]
  /** private journal text: crew id → mission day → entry. Never leaves the device. */
  journal: Record<string, Record<number, string>>
  setPlace: (id: PlaceId) => void
  setActive: (id: string) => void
  saveEntry: (day: number, entry: Entry) => void
  toggleDone: (day: number, key: string) => void
  startTimer: (label: string, minutes: number) => void
  clearTimer: (id: string) => void
  setJournal: (day: number, text: string) => void
  loadDemo: (scenario?: ScenarioId) => void
  startOwnRecord: () => void
}

/** The demo crew's health data. The journal is left alone: it is the user's own writing. */
const demoState = () => ({
  startDate: isoDaysAgo(DEMO_DAYS),
  records: Object.fromEntries(CREW.map((c) => [c.id, seedEntries(c.seed, c.hr, c.sleep)])),
  demo: true,
  done: {},
  timers: [],
})

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      placeId: 'transit',
      activeId: CREW[0].id,
      journal: {},
      ...demoState(),
      setPlace: (placeId) => set({ placeId }),
      setActive: (activeId) => set({ activeId }),
      saveEntry: (day, entry) => {
        const { records, activeId } = get()
        set({ records: { ...records, [activeId]: { ...records[activeId], [day]: entry } } })
      },
      toggleDone: (day, key) => {
        const { done, activeId } = get()
        const mine = done[activeId] ?? {}
        const list = mine[day] ?? []
        const next = list.includes(key) ? list.filter((k) => k !== key) : [...list, key]
        set({ done: { ...done, [activeId]: { ...mine, [day]: next } } })
      },
      startTimer: (label, minutes) =>
        set({ timers: [...get().timers, { id: `${Date.now()}`, label, endsAt: Date.now() + minutes * 60_000 }] }),
      clearTimer: (id) => set({ timers: get().timers.filter((t) => t.id !== id) }),
      setJournal: (day, text) => {
        const { journal, activeId } = get()
        const mine = { ...(journal[activeId] ?? {}) }
        // an empty entry is removed rather than kept as a blank day
        if (text.trim()) mine[day] = text.trim()
        else delete mine[day]
        set({ journal: { ...journal, [activeId]: mine } })
      },
      loadDemo: (scenario) => {
        const fresh = demoState()
        const { activeId } = get()
        if (scenario) fresh.records[activeId] = applyScenario(fresh.records[activeId], missionDay(fresh.startDate), scenario)
        set(fresh)
      },
      startOwnRecord: () => set({ startDate: isoDaysAgo(0), records: {}, demo: false, done: {}, timers: [], journal: {} }),
    }),
    { name: 'bovd-app-v1' },
  ),
)

const NONE: string[] = []
/** Keys ticked today by the selected crew member. */
export const useDoneToday = () => useStore((s) => s.done[s.activeId]?.[missionDay(s.startDate)] ?? NONE)

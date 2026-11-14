import { useState } from 'react'
import { Award, Bell, BellOff, CheckCircle2, Circle, Flame, Lock } from 'lucide-react'
import type { Page } from '../App'
import { SCHEDULE, clockNow, type Task } from '../data/places'
import { POINTS_PER_LEVEL, RANKS, badges, streak, totalPoints } from '../engine/progress'
import { missionDay, useDoneToday, useStore } from '../store'
import { useHealth } from '../hooks'
import { tr } from '../i18n'
import { BreathingCard } from '../components/Breathing'
import { canNotify, useNow } from '../components/Timers'
import { BTN_PRIMARY, BTN_QUIET, Card, LABEL, LIST, PageTitle, ROW, SectionTitle } from '../components/ui'

/** Which plan tasks are done today. The health check counts itself when it is saved. */
function usePlan() {
  const { todayEntry } = useHealth()
  const done = useDoneToday()
  useNow(30_000) // re-check which tasks are due as the clock moves
  const now = clockNow()
  const isDone = (t: Task) => (t.auto === 'checkin' ? !!todayEntry : done.includes(t.id))
  const open = SCHEDULE.filter((t) => !isDone(t))
  // the earliest task still open is what to do next
  return { now, isDone, next: open[0], left: open.length }
}

/** The single next task, with a one-tap way to finish it. Shown on Today and in the wide side panel. */
export function NextUp({ go, compact = false }: { go: (p: Page) => void; compact?: boolean }) {
  const { now, next } = usePlan()
  const day = useStore((s) => missionDay(s.startDate))
  const toggleDone = useStore((s) => s.toggleDone)
  const frame = compact ? '' : 'rounded-lg border border-line bg-panel p-4'

  if (!next) return <p className={`text-sm text-muted ${frame}`}>{tr('Today’s plan is complete.')}</p>
  const due = next.time <= now
  const check = next.auto === 'checkin'

  return (
    <div className={frame}>
      <div className="flex items-start gap-3">
        <span className={`font-mono text-lg tabular-nums ${due ? 'text-accent' : 'text-muted'}`} dir="ltr">{next.time}</span>
        <div className="min-w-0 flex-1">
          {!compact && <div className={LABEL}>{due ? tr('Due now') : tr('Next up')}</div>}
          <div className="font-semibold">{tr(next.label)}</div>
          <div className="text-sm text-muted">{tr(next.detail)}</div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button onClick={() => (check ? go('checkin') : toggleDone(day, next.id))} className={BTN_PRIMARY}>
          {check ? tr('Start check') : tr('Mark done')}
        </button>
        <button onClick={() => go('plan')} className={BTN_QUIET}>{tr('See full plan')}</button>
      </div>
    </div>
  )
}

function Reminders() {
  const [permission, setPermission] = useState(canNotify() ? Notification.permission : 'unsupported')
  if (permission === 'unsupported') {
    return <p className="text-sm text-muted">{tr('This browser cannot show reminders. Keep the plan open instead.')}</p>
  }
  if (permission === 'granted') {
    return (
      <p className="flex items-center gap-2 text-sm">
        <Bell size={16} className="shrink-0 text-accent" aria-hidden />
        {tr('Reminders are on. You get a notice when a task is due or a timer ends, while the app is open.')}
      </p>
    )
  }
  if (permission === 'denied') {
    return (
      <p className="flex items-center gap-2 text-sm text-muted">
        <BellOff size={16} className="shrink-0" aria-hidden />
        {tr('Reminders are blocked. Allow notifications for this site in your browser settings.')}
      </p>
    )
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="min-w-0 flex-1 text-sm text-muted">{tr('Get a notice when a task is due or a re-measure timer ends.')}</p>
      <button onClick={() => Notification.requestPermission().then(setPermission)} className={BTN_QUIET}>
        <Bell size={16} aria-hidden />
        {tr('Turn on reminders')}
      </button>
    </div>
  )
}

export default function Plan({ go }: { go: (p: Page) => void }) {
  const { entries, today } = useHealth()
  const { now, isDone, left } = usePlan()
  const toggleDone = useStore((s) => s.toggleDone)
  const points = totalPoints(entries, today)
  const level = Math.floor(points / POINTS_PER_LEVEL) + 1
  const into = points % POINTS_PER_LEVEL
  const run = streak(entries, today)
  const earned = badges(entries, today)

  return (
    <>
      <PageTitle title={tr('Today’s plan')} sub={left === 0 ? tr('Everything is done. Rest well.') : tr('Tasks left today: {n}', { n: left })} />

      <Card className="mb-3"><Reminders /></Card>

      <ol className={LIST}>
        {SCHEDULE.map((t) => {
          const done = isDone(t)
          const due = !done && t.time <= now
          const check = t.auto === 'checkin'
          return (
            <li key={t.id} className={`flex items-center gap-3 px-4 ${ROW}`}>
              <span className={`w-12 shrink-0 font-mono text-sm tabular-nums ${due ? 'text-accent' : 'text-muted'}`} dir="ltr">{t.time}</span>
              <div className="min-w-0 flex-1 py-3">
                <div className={done ? 'text-muted line-through' : 'font-medium'}>{tr(t.label)}</div>
                <div className="text-sm text-muted">{tr(t.detail)}</div>
                {due && <div className="mt-0.5 text-xs font-semibold text-accent">{tr('Due now')}</div>}
              </div>
              {check && !done ? (
                <button onClick={() => go('checkin')} className={BTN_QUIET}>{tr('Start check')}</button>
              ) : (
                <button
                  onClick={() => !check && toggleDone(today, t.id)}
                  disabled={check}
                  aria-pressed={done}
                  aria-label={done ? tr('Done') : tr('Mark done')}
                  className="grid size-11 shrink-0 place-items-center"
                >
                  {done ? <CheckCircle2 size={24} className="text-ok" aria-hidden /> : <Circle size={24} className="text-muted" aria-hidden />}
                </button>
              )}
            </li>
          )
        })}
      </ol>

      <SectionTitle>{tr('Calm your mind')}</SectionTitle>
      <BreathingCard />

      <SectionTitle>{tr('Progress')}</SectionTitle>
      <div className="grid gap-3 md:grid-cols-2">
        <Card className="flex items-center gap-4">
          <Flame size={36} className={run > 0 ? 'shrink-0 text-warn' : 'shrink-0 text-muted'} aria-hidden />
          <div>
            <div className="font-mono text-3xl font-semibold tabular-nums">{tr('{n} days', { n: run })}</div>
            <div className="text-sm text-muted">{tr('Check-in streak')}</div>
          </div>
        </Card>
        <Card>
          <div className="flex items-baseline justify-between gap-2">
            <div className="text-lg font-semibold">{tr('Level {n} · {rank}', { n: level, rank: tr(RANKS[Math.min(level - 1, RANKS.length - 1)]) })}</div>
            <div className="font-mono text-sm tabular-nums text-muted">{tr('{n} points', { n: points })}</div>
          </div>
          <div className="mt-3 h-1.5 bg-panel2" role="progressbar" aria-valuenow={into} aria-valuemin={0} aria-valuemax={POINTS_PER_LEVEL} aria-label={tr('Progress to next level')}>
            <div className="h-full bg-accent" style={{ width: `${(into / POINTS_PER_LEVEL) * 100}%` }} />
          </div>
          <div className="mt-2 text-xs text-muted">{tr('{n} points to level {next}', { n: POINTS_PER_LEVEL - into, next: level + 1 })}</div>
        </Card>
      </div>

      <SectionTitle>{tr('Badges · {a} of {b}', { a: earned.filter((b) => b.earned).length, b: earned.length })}</SectionTitle>
      <ul className={`grid gap-x-6 px-4 sm:grid-cols-2 ${LIST}`}>
        {earned.map((b) => (
          <li key={b.id} className={`flex items-center gap-3 py-3 ${ROW}`}>
            {b.earned ? <Award size={22} className="shrink-0 text-accent" aria-hidden /> : <Lock size={20} className="shrink-0 text-muted" aria-hidden />}
            <div>
              <div className={`font-medium ${b.earned ? '' : 'text-muted'}`}>{tr(b.name)}</div>
              <div className="text-xs text-muted">{b.earned ? tr('Earned') : tr(b.how)}</div>
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

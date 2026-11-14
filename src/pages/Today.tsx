import { ChevronRight } from 'lucide-react'
import type { Page } from '../App'
import { INDICATORS, formatValue, type IndicatorId } from '../data/indicators'
import { readiness } from '../engine/status'
import { streak } from '../engine/progress'
import { delayText } from '../engine/physics'
import { overallStatus, useHealth } from '../hooks'
import { tr } from '../i18n'
import { AlertCard } from '../components/AlertCard'
import { RadiationCard, SpaceWeatherCard } from '../components/Space'
import { NextUp } from './Plan'
import { BTN_PRIMARY, Card, LABEL, LIST, PageTitle, ROW, ReadinessRing, SectionTitle, Sparkline, STATUS_HEX, StatusTag } from '../components/ui'

interface Props {
  go: (p: Page) => void
  openTrend: (id: IndicatorId) => void
}

export default function Today({ go, openTrend }: Props) {
  const { entries, today, place, member, latest, todayEntry, assessments, alerts } = useHealth()
  const where = tr(place.name)

  if (!latest) {
    return (
      <>
        <PageTitle title={tr('Welcome aboard, {name}', { name: tr(member.name) })} sub={tr('Mission day {day} · {place}', { day: today, place: where })} />
        <Card>
          <p>{tr('You have no health checks yet. The first week sets your personal baseline, so try to log every day.')}</p>
          <button onClick={() => go('checkin')} className={`mt-4 ${BTN_PRIMARY}`}>{tr('Start first health check')}</button>
        </Card>
      </>
    )
  }

  const overall = overallStatus(alerts)
  const headline =
    overall === 'green'
      ? tr('All indicators are in range.')
      : overall === 'amber'
        ? tr('Items to watch: {n}', { n: alerts.length })
        : tr('Something needs action now.')

  return (
    <>
      <PageTitle
        title={tr('{name} — today', { name: tr(member.name) })}
        sub={tr('Mission day {day} · {place} · signal delay to Earth: {delay}', { day: today, place: where, delay: delayText(place) })}
      />

      <Card className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
        <div className="flex items-center gap-4 sm:contents">
          <ReadinessRing score={readiness(entries, latest.entry)} status={overall} />
          <div className="min-w-0 flex-1">
            <div className={LABEL}>{tr('Health readiness')}</div>
            <p className="mt-1 text-lg font-semibold">{headline}</p>
            <p className="mt-1 text-sm text-muted">
              {tr('Based on your check on day {day}.', { day: latest.day })} {latest.day !== today && tr('Today’s check is still due.')}{' '}
              {tr('Streak: {n} days.', { n: streak(entries, today) })}
            </p>
          </div>
        </div>
        <button onClick={() => go('checkin')} className={`${BTN_PRIMARY} w-full sm:w-auto`}>
          {todayEntry ? tr('Update today’s check') : tr('Start today’s check')}
        </button>
      </Card>

      {/* on a wide screen the side panel already shows the next task */}
      <div className="mt-3 xl:hidden">
        <NextUp go={go} />
      </div>

      {alerts.length > 0 && (
        <>
          <SectionTitle>{tr('What to do')}</SectionTitle>
          <div className="grid gap-3 lg:grid-cols-2">
            {alerts.map((a) => (
              <AlertCard key={a.id} alert={a} />
            ))}
          </div>
        </>
      )}

      <SectionTitle>{tr('Your indicators')}</SectionTitle>
      {/* one table, not a wall of tiles: every reading on a line with its status */}
      <ul className={LIST}>
        {INDICATORS.map((ind) => {
          const v = latest.entry.values[ind.id]
          const a = assessments[ind.id]
          const history: number[] = []
          for (let d = Math.max(1, latest.day - 13); d <= latest.day; d++) {
            const x = entries[d]?.values[ind.id]
            if (x !== undefined) history.push(x)
          }
          const status = a ? <StatusTag status={a.status} /> : <span className="text-xs text-muted">{tr('Not measured')}</span>
          return (
            <li key={ind.id} className={ROW}>
              <button
                onClick={() => openTrend(ind.id)}
                className="grid min-h-14 w-full grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-x-3 px-4 py-2 text-start hover:bg-panel2 md:grid-cols-[minmax(0,1fr)_7rem_5rem_8rem_auto]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-sm">{tr(ind.name)}</span>
                  {/* phone: status sits under the name; computer: it has its own column */}
                  <span className="mt-0.5 block md:hidden">{status}</span>
                </span>
                <span className="text-end">
                  <span className="font-mono text-lg font-semibold tabular-nums">{v === undefined ? '—' : formatValue(ind, v)}</span>
                  {v !== undefined && ind.id !== 'mood' && <span className="ms-1 text-xs text-muted">{tr(ind.unit)}</span>}
                </span>
                <span className="hidden md:block">
                  <Sparkline values={history} color={a ? STATUS_HEX[a.status] : '#8f9bb0'} />
                </span>
                <span className="hidden md:block">
                  {status}
                  {a?.unusual && <span className="block text-xs text-muted">{tr('Unusual for you')}</span>}
                </span>
                <ChevronRight size={16} className="text-muted" aria-hidden />
              </button>
            </li>
          )
        })}
      </ul>

      <SectionTitle>{tr('Your environment')}</SectionTitle>
      <div className="grid gap-3 lg:grid-cols-2">
        <RadiationCard place={place} days={today} />
        <SpaceWeatherCard />
      </div>
    </>
  )
}

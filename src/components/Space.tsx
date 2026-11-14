import { useEffect, useState } from 'react'
import type { Place } from '../data/places'
import type { Status } from '../data/indicators'
import { CAREER_LIMIT_MSV, missionDose } from '../engine/physics'
import { tr } from '../i18n'
import { Card, StatusTag } from './ui'

export function RadiationCard({ place, days }: { place: Place; days: number }) {
  const { dose, percent, daysLeft } = missionDose(place, days)
  const status: Status = percent >= 80 ? 'red' : percent >= 50 ? 'amber' : 'green'
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">{tr('Radiation dose this mission')}</h3>
        <StatusTag status={status} />
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="font-mono text-2xl font-semibold tabular-nums">{dose.toFixed(0)}</span>
        <span className="text-sm text-muted">{tr('of {limit} mSv career limit', { limit: CAREER_LIMIT_MSV })}</span>
      </div>
      <div className="mt-2 h-1.5 bg-panel2" role="progressbar" aria-valuenow={Math.round(percent)} aria-valuemin={0} aria-valuemax={100} aria-label={tr('Share of career radiation limit used')}>
        <div className={`h-full ${status === 'red' ? 'bg-bad' : status === 'amber' ? 'bg-warn' : 'bg-ok'}`} style={{ width: `${Math.min(100, percent)}%` }} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {tr('{rate} mSv per day × {days} days. At this rate you reach the limit in {left} more days.', { rate: place.doseRate, days, left: daysLeft })}
      </p>
      <p className="mt-1 text-xs text-muted">
        {tr('Estimate, not a dosimeter reading. Rate source:')} <span>{place.doseSource}</span>. {tr('Limit: NASA-STD-3001.')}
      </p>
    </Card>
  )
}

interface Flare {
  classType: string
  peakTime: string
}
type Source = 'NASA DONKI' | 'NOAA SWPC GOES'
type Weather = { state: 'loading' } | { state: 'offline' } | { state: 'ok'; flares: Flare[]; source: Source }

const CACHE = 'bovd-flares'
const isoDate = (d: Date) => d.toISOString().slice(0, 10)
/** "X1.2" → comparable number: the letter sets the power of ten, the digits the multiplier */
const flarePower = (c: string) => 10 ** 'ABCMX'.indexOf(c[0]) * (parseFloat(c.slice(1)) || 1)

async function getJson(url: string): Promise<unknown[]> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(String(r.status))
  return r.json()
}

/** NASA DONKI first; if it does not answer, the NOAA GOES satellite flare list. */
async function loadFlares(): Promise<{ flares: Flare[]; source: Source }> {
  const end = new Date()
  const start = new Date(end.getTime() - 7 * 86_400_000)
  try {
    const rows = (await getJson(
      `https://api.nasa.gov/DONKI/FLR?startDate=${isoDate(start)}&endDate=${isoDate(end)}&api_key=DEMO_KEY`,
    )) as { classType?: string; peakTime?: string }[]
    return { source: 'NASA DONKI', flares: rows.filter((f) => f.classType).map((f) => ({ classType: f.classType!, peakTime: f.peakTime ?? '' })) }
  } catch {
    const rows = (await getJson('https://services.swpc.noaa.gov/json/goes/primary/xray-flares-7-day.json')) as { max_class?: string; max_time?: string }[]
    return { source: 'NOAA SWPC GOES', flares: rows.filter((f) => f.max_class).map((f) => ({ classType: f.max_class!, peakTime: f.max_time ?? '' })) }
  }
}

/** Live solar flare list. The app works without it: with no link, the card just says so. */
export function SpaceWeatherCard() {
  const [w, setW] = useState<Weather>({ state: 'loading' })

  useEffect(() => {
    let alive = true
    try {
      const cached = sessionStorage.getItem(CACHE)
      if (cached) {
        setW({ state: 'ok', ...JSON.parse(cached) })
        return
      }
    } catch { /* storage blocked: fetch instead */ }
    loadFlares()
      .then((data) => {
        try { sessionStorage.setItem(CACHE, JSON.stringify(data)) } catch { /* ignore */ }
        if (alive) setW({ state: 'ok', ...data })
      })
      .catch(() => alive && setW({ state: 'offline' }))
    return () => { alive = false }
  }, [])

  let body
  if (w.state === 'loading') body = <p className="mt-2 text-sm text-muted">{tr('Asking for the latest solar activity…')}</p>
  else if (w.state === 'offline') body = <p className="mt-2 text-sm text-muted">{tr('No link to Earth data right now. Your health checks still work without it.')}</p>
  else if (w.flares.length === 0) body = <p className="mt-2 text-sm">{tr('No solar flares reported in the last 7 days.')}</p>
  else {
    const top = w.flares.reduce((a, b) => (flarePower(b.classType) > flarePower(a.classType) ? b : a))
    const level: Status = top.classType[0] === 'X' ? 'red' : top.classType[0] === 'M' ? 'amber' : 'green'
    const label = level === 'red' ? 'Strong flare' : level === 'amber' ? 'Medium flare' : 'Quiet'
    const advice =
      level === 'red'
        ? 'Strong flares can be followed by a particle storm. Know your route to the storm shelter and listen for a shelter call.'
        : level === 'amber'
          ? 'Medium flares are common. No action needed unless a particle storm warning follows.'
          : 'The Sun is quiet. No extra radiation action needed.'
    body = (
      <>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="font-mono text-2xl font-semibold">{top.classType}</span>
          <StatusTag status={level} label={tr(label)} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {tr('Strongest solar flare of the last 7 days ({n} reported), on {date}.', { n: w.flares.length, date: top.peakTime.slice(0, 10) })}
        </p>
        <p className="mt-2 text-sm">{tr(advice)}</p>
      </>
    )
  }

  return (
    <Card>
      <h3 className="font-semibold">{tr('Space weather')}</h3>
      {body}
      <p className="mt-2 text-xs text-muted">
        {tr('Live solar flare data:')} <span>{w.state === 'ok' ? w.source : 'NASA DONKI / NOAA SWPC GOES'}</span>
      </p>
    </Card>
  )
}

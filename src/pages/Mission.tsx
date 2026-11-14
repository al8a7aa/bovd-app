import { HAZARDS, PLACES } from '../data/places'
import { SOURCES } from '../data/nasa'
import { SCENARIOS } from '../engine/seed'
import { delayText } from '../engine/physics'
import { useStore } from '../store'
import { useHealth } from '../hooks'
import { tr } from '../i18n'
import { BTN_QUIET, Card, LIST, PageTitle, ROW, SectionTitle } from '../components/ui'

/** Used only where NASA publishes no number limit, or as a backup. */
const OTHER_SOURCES = [
  'NEWS2, Royal College of Physicians (2017) — heart rate, blood oxygen, temperature',
  'ACC/AHA blood pressure guideline (2017)',
  'ADA Standards of Care in Diabetes — fasting blood sugar',
  'Stahn et al., Scientific Reports (2017) — body temperature in space',
  'NOAA SWPC GOES — backup solar flare list',
  'Zeitlin 2013, Hassler 2014, Zhang 2020 — measured radiation dose rates',
]

export default function Mission() {
  const { place, demo } = useHealth()
  const { setPlace, loadDemo, startOwnRecord } = useStore()
  const sources = [...SOURCES.map((s) => s.name), ...OTHER_SOURCES]

  return (
    <>
      <PageTitle title={tr('Mission')} sub={tr('Where you are changes how much help you can get, and how fast.')} />

      <SectionTitle>{tr('Where are you?')}</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2">
        {PLACES.map((p) => {
          const active = p.id === place.id
          return (
            <button
              key={p.id}
              onClick={() => setPlace(p.id)}
              aria-pressed={active}
              className={`rounded-lg border p-4 text-start ${active ? 'border-accent bg-accent/10' : 'border-line bg-panel hover:border-accent/50'}`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold">{tr(p.name)}</span>
                {active && <span className="text-xs font-semibold text-accent">{tr('Selected')}</span>}
              </div>
              <p className="mt-1 text-sm text-muted">{tr(p.note)}</p>
              <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div><dt className="text-muted">{tr('Gravity')}</dt><dd className="mt-0.5 font-mono" dir="ltr">{p.gravity}</dd></div>
                <div><dt className="text-muted">{tr('Signal delay')}</dt><dd className="mt-0.5">{delayText(p)}</dd></div>
                <div><dt className="text-muted">{tr('Return to Earth')}</dt><dd className="mt-0.5">{tr(p.returnTime)}</dd></div>
              </dl>
            </button>
          )
        })}
      </div>

      <SectionTitle>{tr('The five hazards of spaceflight')}</SectionTitle>
      <ul className={LIST}>
        {HAZARDS.map((h) => (
          <li key={h.name} className={`px-4 py-3 ${ROW}`}>
            <div className="font-semibold">{tr(h.name)}</div>
            <p className="mt-0.5 text-sm text-muted">{tr(h.effect)}</p>
            <p className="mt-1 text-sm"><span className="text-muted">{tr('Watch:')} </span>{tr(h.watch)}</p>
          </li>
        ))}
      </ul>

      <SectionTitle>{tr('Demo controls')}</SectionTitle>
      <Card>
        <p className="text-sm text-muted">
          {tr('Load a simulated situation to see how the app responds. Each one reloads the demo crew and applies the situation to the selected crew member.')}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {SCENARIOS.map((s) => (
            <button key={s.id} onClick={() => loadDemo(s.id)} className="rounded-md border border-line bg-panel2 p-3 text-start hover:border-accent/50">
              <div className="font-semibold">{tr(s.name)}</div>
              <div className="mt-0.5 text-xs text-muted">{tr(s.what)}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => loadDemo()} className={BTN_QUIET}>{tr('Load healthy demo crew')}</button>
          <button
            onClick={() => (demo || window.confirm(tr('This deletes your saved health checks and journal and starts a new record at day 1. Continue?'))) && startOwnRecord()}
            className={BTN_QUIET}
          >
            {tr('Start an empty record')}
          </button>
        </div>
      </Card>

      <SectionTitle>{tr('About')}</SectionTitle>
      <Card className="text-sm">
        <p>
          {tr('BÖVD was built by team BÖVD (Ibn Al Atheer School, Shinas, Oman) during the NASA Space Apps Challenge 2026. It is a prototype, not a medical device, and it does not diagnose. All data stays on this device.')}
        </p>
        <p className="mt-2 text-muted">{tr('The crew data is simulated. Real astronaut vital signs are not public.')}</p>
        <p className="mt-2 text-muted">{tr('Signal delay uses the Earth–Mars distance from Kepler’s equation, solved with Newton’s method.')}</p>
        <p className="mt-2 text-muted">{tr('The code was written with an AI coding assistant (Claude Code), under the team’s direction.')}</p>
        <p className="mt-3 text-muted">{tr('Built on these NASA sources, with medical references only where NASA gives no number:')}</p>
        <ul className="mt-1 list-disc space-y-0.5 ps-5 text-muted" dir="ltr">
          {sources.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </Card>
    </>
  )
}

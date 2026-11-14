import { useEffect, useRef, useState } from 'react'
import { SLOW_MS, TIMEOUT_MS, isSlower, summarize, usualSpeed, type ReactionResult } from '../engine/reaction'
import { useStore } from '../store'
import { useHealth } from '../hooks'
import { tr } from '../i18n'
import { BTN_PRIMARY, BTN_QUIET, Card, LABEL, LIST, PageTitle, ROW, SectionTitle, Sparkline, StatusTag } from '../components/ui'

const QUICK_SECONDS = 60
/** the length of NASA's Reaction Self-Test */
const FULL_SECONDS = 180

type Phase = 'idle' | 'running' | 'done'

export default function Reaction() {
  const { today, reactions } = useHealth()
  const saveReaction = useStore((s) => s.saveReaction)
  const [phase, setPhase] = useState<Phase>('idle')
  const [lit, setLit] = useState(false)
  const [counter, setCounter] = useState(0)
  const [note, setNote] = useState('')
  const [result, setResult] = useState<ReactionResult | null>(null)

  // Timing state lives in refs: it changes many times a second and must not wait for a re-render.
  const running = useRef(false)
  const times = useRef<number[]>([])
  const early = useRef(0)
  const litAt = useRef<number | null>(null)
  const endAt = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const frame = useRef(0)

  const stopClocks = () => {
    clearTimeout(timer.current)
    cancelAnimationFrame(frame.current)
  }
  useEffect(() => () => {
    running.current = false
    stopClocks()
  }, [])

  function finish() {
    running.current = false
    stopClocks()
    const r = summarize(times.current, early.current)
    if (r.trials > 0) saveReaction(today, r)
    setResult(r)
    setPhase('done')
  }

  /** Wait a random 1 to 4 seconds, so the number cannot be predicted, then show it. */
  function arm() {
    litAt.current = null
    setLit(false)
    if (performance.now() >= endAt.current) return finish()
    timer.current = setTimeout(() => {
      litAt.current = performance.now()
      setLit(true)
      setNote('')
      const tick = () => {
        if (litAt.current === null) return
        setCounter(Math.round(performance.now() - litAt.current))
        frame.current = requestAnimationFrame(tick)
      }
      tick()
      timer.current = setTimeout(() => record(TIMEOUT_MS), TIMEOUT_MS)
    }, 1000 + Math.random() * 3000)
  }

  function record(ms: number) {
    stopClocks()
    times.current.push(ms)
    litAt.current = null
    setLit(false)
    setNote(ms >= TIMEOUT_MS ? tr('No response.') : tr('{ms} ms', { ms: Math.round(ms) }))
    timer.current = setTimeout(arm, 800)
  }

  function respond() {
    if (!running.current) return
    if (litAt.current === null) {
      early.current++
      setNote(tr('Too early. Wait for the number.'))
      return
    }
    record(performance.now() - litAt.current)
  }

  function start(seconds: number) {
    times.current = []
    early.current = 0
    running.current = true
    endAt.current = performance.now() + seconds * 1000
    setNote('')
    setResult(null)
    setPhase('running')
    arm()
  }

  useEffect(() => {
    if (phase !== 'running') return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        respond()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase])

  const usual = usualSpeed(reactions)
  const days = Object.keys(reactions).map(Number).sort((a, b) => a - b)
  const header = (
    <PageTitle
      title={tr('Reaction test')}
      sub={tr('Tiredness slows your reactions before you feel tired. This short test catches it early.')}
    />
  )

  if (phase === 'running') {
    return (
      <>
        {header}
        {/* pointerdown, not click: a click only fires when the finger lifts, which would add to the time */}
        <button
          onPointerDown={respond}
          className={`grid min-h-80 w-full touch-manipulation place-items-center rounded-lg border-2 select-none ${lit ? 'border-accent bg-accent/10' : 'border-line bg-panel'}`}
        >
          <span>
            <span className={`block font-mono font-semibold tabular-nums ${lit ? 'text-7xl text-accent' : 'text-2xl text-muted'}`}>
              {lit ? counter : tr('Wait…')}
            </span>
            <span className="mt-4 block min-h-6 text-sm text-muted" aria-live="polite">{note}</span>
          </span>
        </button>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <p className="min-w-0 flex-1 text-sm text-muted">{tr('Tap the box, or press the space bar, as soon as the number appears.')}</p>
          <button onClick={finish} className={BTN_QUIET}>{tr('Finish now')}</button>
        </div>
      </>
    )
  }

  return (
    <>
      {header}

      {phase === 'done' && result && (
        <Card className="mb-3">
          {result.trials === 0 ? (
            <p className="font-semibold">{tr('No responses were recorded, so nothing was saved.')}</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">{tr('Your result')}</h2>
                <StatusTag status={isSlower(result, usual) ? 'amber' : 'green'} label={isSlower(result, usual) ? tr('Slower than usual') : tr('Saved')} />
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
                <div><dt className="text-xs text-muted">{tr('Middle reaction time')}</dt><dd className="font-mono text-2xl font-semibold tabular-nums">{result.median} ms</dd></div>
                <div><dt className="text-xs text-muted">{tr('Slow responses (over {ms} ms)', { ms: SLOW_MS })}</dt><dd className="font-mono text-2xl font-semibold tabular-nums">{result.slow}</dd></div>
                <div><dt className="text-xs text-muted">{tr('Too-early taps')}</dt><dd className="font-mono text-2xl font-semibold tabular-nums">{result.early}</dd></div>
                <div><dt className="text-xs text-muted">{tr('Responses')}</dt><dd className="font-mono text-2xl font-semibold tabular-nums">{result.trials}</dd></div>
              </dl>
              <p className="mt-3 text-sm">
                {usual === null
                  ? tr('After three tests the app will know your usual speed and can tell you when you are slower.')
                  : isSlower(result, usual)
                    ? tr('Your usual is {ms} ms. You are slower today, and tiredness may be the reason. See the Today screen for what to do.', { ms: usual })
                    : tr('Your usual is {ms} ms. This is in line with it.', { ms: usual })}
              </p>
            </>
          )}
        </Card>
      )}

      <Card>
        <h2 className="font-semibold">{tr('How it works')}</h2>
        <ol className="mt-2 list-decimal space-y-1.5 ps-5 text-sm">
          <li>{tr('A box shows “Wait…”. After a few seconds a running number appears.')}</li>
          <li>{tr('Tap the box, or press the space bar, as fast as you can.')}</li>
          <li>{tr('It repeats until the time is up. Do not guess: a tap before the number counts against you.')}</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-2">
          <button onClick={() => start(QUICK_SECONDS)} className={BTN_PRIMARY}>{tr('Start 1-minute test')}</button>
          <button onClick={() => start(FULL_SECONDS)} className={BTN_QUIET}>{tr('Start 3-minute test')}</button>
        </div>
        <h3 className={`mt-5 ${LABEL}`}>{tr('What NASA says')}</h3>
        <p className="mt-2 text-sm text-muted">
          {tr('Crews on the space station take a 3-minute Reaction Self-Test. It is one of the ten tests in NASA’s Cognition battery, and NASA uses it because lost sleep and heavy workload slow reactions.')}
        </p>
        <p className="mt-1 text-xs text-muted">NASA Reaction Self-Test (PVT-B); NASA Standard Measures — Cognition</p>
        <p className="mt-3 text-xs text-muted">
          {tr('This is a simpler version for a quick self-check, not NASA’s test. Screens and mice add their own delay, so compare a result only with your own earlier results on the same device.')}
        </p>
      </Card>

      <SectionTitle>{tr('Your earlier results')}</SectionTitle>
      {days.length === 0 ? (
        <p className="text-sm text-muted">{tr('No tests yet. Your first three set your usual speed.')}</p>
      ) : (
        <>
          <Card className="mb-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs text-muted">{tr('Your usual speed')}</div>
              <div className="font-mono text-2xl font-semibold tabular-nums">{usual === null ? '—' : `${usual} ms`}</div>
            </div>
            <Sparkline values={days.slice(-14).map((d) => reactions[d].median)} color="#22b8e6" />
          </Card>
          <ul className={LIST}>
            {days.slice(-5).reverse().map((d) => (
              <li key={d} className={`flex items-center justify-between gap-3 px-4 py-2.5 text-sm ${ROW}`}>
                <span>{tr('Mission day {day}', { day: d })}</span>
                <span className="flex items-center gap-4">
                  <span className="font-mono tabular-nums">{reactions[d].median} ms</span>
                  <StatusTag status={isSlower(reactions[d], usual) ? 'amber' : 'green'} label={isSlower(reactions[d], usual) ? tr('Slower than usual') : tr('Usual')} />
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

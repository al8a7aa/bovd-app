import { INDICATOR, INDICATORS, formatValue, type IndicatorId, type RegionId } from '../data/indicators'
import { SYMPTOMS } from '../data/body'
import type { Place } from '../data/places'
import { tr } from '../i18n'
import { assessEntry, latestEntry, type Entries } from './status'

/** One action step. `timerMin` is set when the step asks you to measure again after a wait. */
export interface Step {
  text: string
  timerMin?: number
}

/** A finding the astronaut should act on. All texts are already in the current language. */
export interface Alert {
  id: string
  level: 'amber' | 'red'
  region: RegionId
  title: string
  seen: string
  why: string
  doNow: Step[]
  escalate: string
  source: string
}

/** Mean of the last `days` readings up to `day`; null if fewer than 60% were logged. */
export function recentMean(entries: Entries, day: number, id: IndicatorId, days: number): number | null {
  const xs: number[] = []
  for (let d = day; d > day - days && d >= 1; d--) {
    const v = entries[d]?.values[id]
    if (v !== undefined) xs.push(v)
  }
  if (xs.length < Math.ceil(days * 0.6)) return null
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

interface Draft {
  id: string
  level: 'amber' | 'red'
  region: RegionId
  /** already translated */
  title: string
  /** already translated */
  seen: string
  /** English; translated on the way out */
  why: string
  /** English; translated on the way out */
  doNow: string[]
  source: string
}

/**
 * Fixed rules, no machine learning: every alert can be traced to a reading and a cited source.
 * Patterns over several days (sleep debt, missed exercise) are checked first and replace the
 * single-reading alert for the same indicator, so one problem is reported once.
 */
export function buildAlerts(entries: Entries, today: number, place: Place): Alert[] {
  const latest = latestEntry(entries, today)
  if (!latest) return []
  const { day, entry } = latest
  const a = assessEntry(entries, entry)
  const drafts: Draft[] = []
  const covered = new Set<IndicatorId>()

  // Fever: temperature is the lead sign, a fast pulse supports it.
  const temp = entry.values.temp
  if (temp !== undefined && temp > INDICATOR.temp.green[1]) {
    const hr = entry.values.hr
    const fastPulse = hr !== undefined && hr > INDICATOR.hr.green[1]
    covered.add('temp')
    if (fastPulse) covered.add('hr')
    drafts.push({
      id: 'fever',
      level: a.temp?.status === 'red' || (fastPulse && a.hr?.status === 'red') ? 'red' : 'amber',
      region: 'immune',
      title: tr('Possible infection'),
      seen: fastPulse
        ? tr('Temperature {t} °C with a resting pulse of {hr} bpm.', { t: temp.toFixed(1), hr: hr! })
        : tr('Temperature {t} °C.', { t: temp.toFixed(1) }),
      why: 'Your immune system is weaker in space and germs spread fast in a sealed cabin. Acting on the first day protects you and the crew.',
      doNow: [
        'Re-measure temperature in 30 minutes.',
        'Drink extra water and rest; skip hard exercise today.',
        'Wear a mask and keep distance from crewmates.',
        'Log any sore throat, cough, rash or pain as symptoms.',
      ],
      source: INDICATOR.temp.source,
    })
  }

  const sleep3 = recentMean(entries, day, 'sleep', 3)
  if (sleep3 !== null && sleep3 < 6) {
    covered.add('sleep')
    drafts.push({
      id: 'sleep-debt',
      level: sleep3 < 5 ? 'red' : 'amber',
      region: 'brain',
      title: tr('Sleep debt is building'),
      seen: tr('You averaged {h} hours of sleep over the last 3 nights.', { h: sleep3.toFixed(1) }),
      why: 'NASA says an adult needs 7–9 hours. Several short nights in a row slow your reactions and raise the chance of errors in critical tasks.',
      doNow: [
        'Protect a full 8-hour sleep period tonight.',
        'No screens for the last hour; dim lights, earplugs and eye mask.',
        'No caffeine in the 6 hours before sleep.',
        'Ask to reschedule safety-critical tasks until you have recovered.',
      ],
      source: INDICATOR.sleep.source,
    })
  }

  const mood3 = recentMean(entries, day, 'mood', 3)
  if (mood3 !== null && mood3 <= 2.34) {
    covered.add('mood')
    drafts.push({
      id: 'low-mood',
      level: mood3 <= 1.34 ? 'red' : 'amber',
      region: 'brain',
      title: tr('Low mood for several days'),
      seen: tr('Your mood has averaged {m} out of 5 over the last 3 days.', { m: mood3.toFixed(1) }),
      why: 'A low stretch is common in isolation, and it is easier to turn around early. It is a health reading like any other, not a personal failing.',
      doNow: [
        'Tell a crewmate you trust how you are doing.',
        'Book a private call or message with family or the support team.',
        'Keep exercise and sleep times fixed.',
        'Write a few lines in your journal.',
      ],
      source: INDICATOR.mood.source,
    })
  }

  const ex7 = recentMean(entries, day, 'exercise', 7)
  if (ex7 !== null && ex7 < 90) {
    covered.add('exercise')
    drafts.push({
      id: 'deconditioning',
      level: ex7 < 45 ? 'red' : 'amber',
      region: 'bones',
      title: tr('Bone and muscle loss risk'),
      seen: tr('You averaged {min} minutes of exercise a day over the last week. NASA’s station crews do 90.', { min: Math.round(ex7) }),
      why: 'Unloaded bones lose about 1–1.5% of their density a month and it comes back slowly, if at all. Exercise is the only protection you carry.',
      doNow: [
        'Do a resistance session today: squats, deadlifts and heel raises.',
        'Do not miss two days in a row.',
        'If pain or fatigue is stopping you, log it so the plan can change.',
      ],
      source: INDICATOR.exercise.source,
    })
  }

  const water3 = recentMean(entries, day, 'water', 3)
  // NASA-STD-3001 Vol. 2: at least 2.5 litres of drinking water per crew member per day
  if (water3 !== null && water3 < 2.5) {
    covered.add('water')
    drafts.push({
      id: 'dehydration',
      level: water3 < 2 ? 'red' : 'amber',
      region: 'gut',
      title: tr('Not drinking enough'),
      seen: tr('You averaged {l} litres of fluid a day over the last 3 days. NASA’s minimum is 2.5.', { l: water3.toFixed(1) }),
      why: 'Thirst is weak in microgravity. Low fluid with extra calcium in your urine is how kidney stones form — a serious problem far from a hospital.',
      doNow: [
        'Drink 500 ml now.',
        'Keep a drink bag at your workstation and finish one with every meal.',
        'Check your urine colour — aim for pale yellow.',
      ],
      source: INDICATOR.water.source,
    })
  }

  // Any single reading outside its band, or far from the personal baseline.
  for (const ind of INDICATORS) {
    const x = a[ind.id]
    const v = entry.values[ind.id]
    if (!x || v === undefined || x.status === 'green' || covered.has(ind.id)) continue
    const advice = x.direction === 'low' ? ind.low : ind.high
    const outOfRange = v < ind.green[0] || v > ind.green[1]
    const shown = { name: tr(ind.name), value: formatValue(ind, v), unit: ind.id === 'mood' ? '' : tr(ind.unit) }
    drafts.push({
      id: ind.id,
      level: x.status,
      region: ind.region,
      title: outOfRange ? tr(advice.title) : tr('{name} has shifted from your baseline', { name: tr(ind.name) }),
      seen: outOfRange
        ? tr('{name}: {value} {unit}. Reference range is {lo}–{hi}.', { ...shown, lo: ind.green[0], hi: ind.green[1] })
        : tr('{name}: {value} {unit}. That is in the normal range but unusual for you — your first-week average was {mean}.', {
            ...shown,
            mean: x.baselineMean?.toFixed(ind.step < 1 ? 1 : 0) ?? '',
          }),
      why: ind.why,
      doNow: advice.doNow,
      source: ind.source,
    })
  }

  // Symptoms that need a response whatever the numbers say.
  for (const sym of SYMPTOMS) {
    if (!sym.urgent || !entry.symptoms.includes(sym.id)) continue
    const vision = sym.id === 'vision'
    drafts.push({
      id: `sym-${sym.id}`,
      level: sym.urgent,
      region: sym.region,
      title: tr('You reported: {symptom}', { symptom: tr(sym.label) }),
      seen: tr('Logged as a symptom on mission day {day}.', { day }),
      why: vision
        ? 'Fluid shifting toward the head can swell the optic nerve on long missions. Early reports let the medical team track it before it affects your work.'
        : 'Chest and breathing symptoms can come from the heart, the lungs or the cabin air, and all three need a fast check.',
      doNow: vision
        ? ['Do the near-vision card test with each eye and record the result.', 'Try your adjustable glasses.', 'Note any headache or blind spots.']
        : ['Stop what you are doing and rest.', 'Measure pulse, blood pressure and blood oxygen now.', 'Check the cabin air readout.', 'Do not stay alone.'],
      source: 'NASA Human Research Program — Risks of Human Spaceflight',
    })
  }

  return drafts
    .map((d): Alert => ({
      id: d.id,
      level: d.level,
      region: d.region,
      title: d.title,
      seen: d.seen,
      source: d.source,
      why: tr(d.why),
      doNow: d.doNow.map((s) => {
        const wait = /re-measure/i.test(s) ? /(\d+) minutes/.exec(s) : null
        return { text: tr(s), timerMin: wait ? Number(wait[1]) : undefined }
      }),
      escalate: tr(d.level === 'red' ? place.red : place.amber),
    }))
    .sort((x, y) => (x.level === y.level ? 0 : x.level === 'red' ? -1 : 1))
}

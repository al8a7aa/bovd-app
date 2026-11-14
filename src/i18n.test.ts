import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { AR } from './ar'
import { INDICATORS, MOOD_LABELS } from './data/indicators'
import { REGIONS, SYMPTOMS } from './data/body'
import { CREW, HAZARDS, PLACES, SCHEDULE } from './data/places'
import { SCENARIOS } from './engine/seed'
import { RANKS, badges, dailyGoals } from './engine/progress'
import { MODELS } from './engine/helper'

/** Words the source scan picks up inside tr(...) calls that are code, not text shown to anyone. */
const NOT_TEXT = ['red', 'amber', 'green', 'mood', 'local', 'online', 'setup', 'checkin', 'user', 'granted', 'denied', 'unsupported']

/** Every English text the app can show: data texts, plus every quoted text passed to tr() in the source. */
function allTexts(): string[] {
  const out = new Set<string>()
  const add = (...xs: string[]) => xs.forEach((x) => x && out.add(x))

  for (const i of INDICATORS) add(i.name, i.unit, i.why, ...i.how, i.low.title, ...i.low.doNow, i.high.title, ...i.high.doNow)
  add(...MOOD_LABELS, ...RANKS)
  for (const r of REGIONS) add(r.name, r.short, r.hazard, r.does, r.inSpace, ...r.protect)
  for (const s of SYMPTOMS) add(s.label)
  for (const p of PLACES) add(p.name, p.returnTime, p.note, p.red, p.amber)
  for (const h of HAZARDS) add(h.name, h.effect, h.watch)
  for (const c of CREW) add(c.name)
  for (const t of SCHEDULE) add(t.label, t.detail)
  for (const s of SCENARIOS) add(s.name, s.what)
  for (const g of dailyGoals(undefined)) add(g.label)
  for (const b of badges({}, 1)) add(b.name, b.how)
  for (const m of MODELS) add(m.name, m.note)
  // report lines the source scan below cannot pick apart
  add('7-day averages', 'Symptoms: {list}', 'Open findings: {n}', 'Made by the BÖVD prototype. Not a medical record.', ', ')

  // In the source: any quoted text on a line that calls tr(, and any sentence-like text in files
  // whose strings are translated later through a variable (alert texts, labels kept in tables).
  const viaVariable = /guidance\.ts$|[\\/]pages[\\/]|[\\/]components[\\/]|App\.tsx$/
  const walk = (dir: string) => {
    for (const f of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, f.name)
      if (f.isDirectory()) walk(path)
      else if (/\.tsx?$/.test(f.name) && !f.name.includes('.test.') && f.name !== 'ar.ts') {
        for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
          const code = line.trimStart()
          if (code.startsWith('import') || code.startsWith('//') || code.startsWith('*') || code.startsWith('/*') || code.startsWith('{/*')) continue
          for (const m of line.matchAll(/'([^']+)'/g)) {
            const text = m[1]
            if (/className|^[a-z0-9-]+(\s[a-z0-9:[\]/.%-]+)+$/.test(text) && !line.includes('tr(')) continue
            const inTr = line.includes(`tr('${text}'`)
            const sentence = viaVariable.test(path) && /^[A-Z]/.test(text) && (text.includes(' ') || /^[A-Z][a-z]+(-[a-z]+)?$/.test(text)) && !/[{}<>=]|\$\{/.test(text.replace(/\{\w+\}/g, ''))
            if (inTr || sentence) out.add(text)
          }
        }
      }
    }
  }
  walk('src')
  // names of sources and keyboard keys stay as they are
  const kept = /^(NASA|NOAA|Canadian Space Agency|English$|Enter$)/
  return [...out].filter((t) => (/[A-Za-z]/.test(t) || t === ', ') && !NOT_TEXT.includes(t) && !kept.test(t))
}

describe('Arabic translation', () => {
  it('covers every text the app can show', () => {
    expect(allTexts().filter((t) => AR[t] === undefined)).toEqual([])
  })
  it('keeps the same {slots} as the English text', () => {
    const slots = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join()
    expect(Object.entries(AR).filter(([en, ar]) => slots(en) !== slots(ar)).map(([en]) => en)).toEqual([])
  })
})

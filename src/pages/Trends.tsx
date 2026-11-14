import { useState } from 'react'
import { CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { INDICATOR, INDICATORS, MOOD_LABELS, formatValue, type IndicatorId } from '../data/indicators'
import { assess, baselineStats } from '../engine/status'
import { useHealth } from '../hooks'
import { tr } from '../i18n'
import { Card, PageTitle, STATUS_HEX, StatusTag } from '../components/ui'

const RANGES = [14, 30, 60]

export default function Trends({ id, setId }: { id: IndicatorId; setId: (id: IndicatorId) => void }) {
  const { entries, today } = useHealth()
  const [days, setDays] = useState(30)
  const ind = INDICATOR[id]
  const unit = id === 'mood' ? '' : tr(ind.unit)

  const data: { day: number; value: number | null }[] = []
  for (let d = Math.max(1, today - days + 1); d <= today; d++) data.push({ day: d, value: entries[d]?.values[id] ?? null })
  const ys = data.flatMap((p) => (p.value === null ? [] : [p.value]))
  const last = ys.at(-1)
  const baseline = ind.baseline ? baselineStats(entries, id) : null

  // keep the whole normal band in view, plus any reading outside it
  const pad = (ind.green[1] - ind.green[0]) * 0.25 || 1
  const yMin = Math.max(ind.min, Math.min(ind.green[0], ...ys) - pad)
  const yMax = Math.min(ind.max, Math.max(Math.min(ind.green[1], ind.max), ...ys) + pad)
  const average = ys.length ? ys.reduce((a, b) => a + b, 0) / ys.length : null

  return (
    <>
      <PageTitle title={tr('Trends')} sub={tr('The shaded band is the normal range. Dots are coloured by status.')} />
      <div className="mb-3 flex flex-wrap gap-2">
        <label className="sr-only" htmlFor="indicator">{tr('Indicator')}</label>
        <select
          id="indicator"
          value={id}
          onChange={(e) => setId(e.target.value as IndicatorId)}
          className="h-11 min-w-0 flex-1 basis-full rounded-md border border-line bg-panel px-3 text-sm sm:basis-auto"
        >
          {INDICATORS.map((i) => (
            <option key={i.id} value={i.id}>{tr(i.name)}</option>
          ))}
        </select>
        <div className="flex rounded-md border border-line bg-panel" role="group" aria-label={tr('Time range')}>
          {RANGES.map((r) => (
            <button key={r} onClick={() => setDays(r)} aria-pressed={days === r} className={`min-h-11 px-3 text-sm ${days === r ? 'bg-panel2 text-accent' : 'text-muted'}`}>
              {tr('{n} days', { n: r })}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="mb-3 flex flex-wrap items-center gap-x-8 gap-y-2">
          <div>
            <div className="text-xs text-muted">{tr('Latest')}</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl font-semibold tabular-nums">{last === undefined ? '—' : formatValue(ind, last)}</span>
              {unit && <span className="text-sm text-muted">{unit}</span>}
              {last !== undefined && <StatusTag status={assess(ind, last, entries).status} />}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted">{tr('{n}-day average', { n: days })}</div>
            <div className="font-mono text-lg tabular-nums">{average === null ? '—' : `${+average.toFixed(1)} ${tr(ind.unit)}`}</div>
          </div>
          {baseline && (
            <div>
              <div className="text-xs text-muted">{tr('Your first-week baseline')}</div>
              <div className="font-mono text-lg tabular-nums">{+baseline.mean.toFixed(1)} {unit}</div>
            </div>
          )}
        </div>

        {ys.length < 2 ? (
          <p className="py-12 text-center text-sm text-muted">{tr('Log at least two days to see a trend.')}</p>
        ) : (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
                <CartesianGrid stroke="#1f2a3c" strokeDasharray="2 4" vertical={false} />
                <ReferenceArea y1={Math.max(ind.green[0], yMin)} y2={Math.min(ind.green[1], yMax)} fill="#46d39a" fillOpacity={0.1} stroke="none" />
                {baseline && <ReferenceLine y={baseline.mean} stroke="#8f9bb0" strokeDasharray="5 5" />}
                <XAxis dataKey="day" tick={{ fill: '#8f9bb0', fontSize: 12 }} stroke="#1f2a3c" tickLine={false} minTickGap={24} />
                <YAxis
                  domain={[yMin, yMax]}
                  tick={{ fill: '#8f9bb0', fontSize: 12 }}
                  stroke="#1f2a3c"
                  tickLine={false}
                  tickFormatter={(v: number) => String(+v.toFixed(1))}
                  allowDecimals={ind.step < 1}
                />
                <Tooltip
                  cursor={{ stroke: '#8f9bb0', strokeDasharray: '3 3' }}
                  contentStyle={{ background: '#121926', border: '1px solid #1f2a3c', borderRadius: 6, color: '#eef2f8' }}
                  labelFormatter={(d) => tr('Mission day {day}', { day: String(d) })}
                  formatter={(v) => [id === 'mood' ? tr(MOOD_LABELS[Number(v)]) : `${v} ${unit}`, tr(ind.name)]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22b8e6"
                  strokeWidth={2}
                  connectNulls
                  isAnimationActive={false}
                  dot={(p: { cx?: number; cy?: number; value?: number | null; index?: number }) =>
                    p.value == null || p.cx == null || p.cy == null ? (
                      <g key={p.index} />
                    ) : (
                      <circle key={p.index} cx={p.cx} cy={p.cy} r={3.5} fill={STATUS_HEX[assess(ind, p.value, entries).status]} stroke="#05070c" strokeWidth={1} />
                    )
                  }
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {baseline && <p className="mt-2 text-xs text-muted">{tr('Dashed line: your personal baseline from mission days 1–7.')}</p>}
      </Card>

      <Card className="mt-3">
        <h2 className="text-sm font-semibold">{tr('Why we track this')}</h2>
        <p className="mt-1 text-sm text-muted">{tr(ind.why)}</p>
        <h2 className="mt-3 text-sm font-semibold">{tr('What NASA says')}</h2>
        <p className="mt-1 text-sm text-muted">{tr(ind.nasa)}</p>
        <p className="mt-1 text-xs text-muted">{ind.nasaSource}</p>
        <p className="mt-3 text-xs text-muted">
          {tr('Normal range from:')} <span>{ind.source}</span>
        </p>
      </Card>
    </>
  )
}

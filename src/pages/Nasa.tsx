import { Check, CircleDashed, Minus } from 'lucide-react'
import { LSAH_SYSTEMS, NUMBERS, RESEARCH, RISKS, SOURCES, STANDARD_MEASURES, coverageCount, type Coverage, type Link } from '../data/nasa'
import { tr } from '../i18n'
import { Card, LIST, PageTitle, ROW, SectionTitle } from '../components/ui'

const LABEL: Record<Coverage, string> = { yes: 'Monitored', partly: 'Partly', no: 'Not covered' }
const TONE: Record<Coverage, string> = { yes: 'text-ok', partly: 'text-warn', no: 'text-muted' }
const ICON = { yes: Check, partly: CircleDashed, no: Minus }

function CoverageTag({ coverage }: { coverage: Coverage }) {
  const Icon = ICON[coverage]
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold whitespace-nowrap ${TONE[coverage]}`}>
      <Icon size={14} aria-hidden />
      {tr(LABEL[coverage])}
    </span>
  )
}

/** One NASA item (kept in English as a proper name) and what the app does about it. */
function Rows({ items, note }: { items: Link[]; note?: (i: Link) => string | undefined }) {
  return (
    <ul className={LIST}>
      {items.map((i) => (
        <li key={i.name} className={`px-4 py-3 ${ROW}`}>
          <div className="flex items-start justify-between gap-3">
            <span className="font-medium">{i.name}</span>
            <CoverageTag coverage={i.coverage} />
          </div>
          {note?.(i) && <div className="font-mono text-xs text-muted">{note(i)}</div>}
          <p className="mt-1 text-sm text-muted">{tr(i.how)}</p>
        </li>
      ))}
    </ul>
  )
}

const Tally = ({ items }: { items: Link[] }) => {
  const c = coverageCount(items)
  return <p className="mb-2 text-sm">{tr('{a} monitored · {b} partly · {c} not covered', { a: c.yes, b: c.partly, c: c.no })}</p>
}

/** Shows, for a judge or a curious crew member, exactly which NASA material each part of the app rests on. */
export default function Nasa() {
  const groups = [...new Set(RISKS.map((r) => r.group))]

  return (
    <>
      <PageTitle
        title={tr('NASA basis')}
        sub={tr('Every part of this app is tied to a NASA source. This screen shows the link, and is honest about what the app does not cover.')}
      />

      <SectionTitle>{tr('NASA numbers used in the app')}</SectionTitle>
      <ul className={`grid sm:grid-cols-2 ${LIST}`}>
        {NUMBERS.map((n) => (
          <li key={n.value} className="border-b border-line px-4 py-3">
            <div className="font-mono text-xl font-semibold text-accent">{n.value}</div>
            <p className="text-sm">{tr(n.what)}</p>
            <p className="mt-0.5 text-xs text-muted">{n.source}</p>
          </li>
        ))}
      </ul>

      <SectionTitle>{tr('NASA’s 17 risks of human spaceflight')}</SectionTitle>
      <Tally items={RISKS} />
      {groups.map((g) => (
        <div key={g} className="mb-3">
          <h3 className="mb-1 text-sm font-semibold">{tr(g)}</h3>
          <Rows items={RISKS.filter((r) => r.group === g)} />
        </div>
      ))}

      <SectionTitle>{tr('NASA Standard Measures on the space station')}</SectionTitle>
      <p className="mb-2 text-sm text-muted">
        {tr('NASA collects the same core measurements from every station crew member who takes part. This is how our daily check compares.')}
      </p>
      <Tally items={STANDARD_MEASURES} />
      <Rows items={STANDARD_MEASURES} note={(i) => STANDARD_MEASURES.find((m) => m.name === i.name)?.discipline} />

      <SectionTitle>{tr('NASA’s astronaut health programme (LSAH)')}</SectionTitle>
      <p className="mb-2 text-sm text-muted">
        {tr('The Lifetime Surveillance of Astronaut Health watches ten body systems for every astronaut. Our body map follows the same systems.')}
      </p>
      <Tally items={LSAH_SYSTEMS} />
      <Rows items={LSAH_SYSTEMS} />

      <SectionTitle>{tr('NASA research this app follows')}</SectionTitle>
      <ul className={LIST}>
        {RESEARCH.map((r) => (
          <li key={r.name} className={`px-4 py-3 ${ROW}`}>
            <div className="font-medium">{r.name}</div>
            <p className="mt-1 text-sm text-muted">{tr(r.what)}</p>
            <p className="mt-1 text-sm"><span className="text-muted">{tr('In the app:')} </span>{tr(r.ours)}</p>
          </li>
        ))}
      </ul>

      <SectionTitle>{tr('What does not come from NASA')}</SectionTitle>
      <Card className="space-y-2 text-sm">
        <p>
          {tr('NASA’s public pages give no number limits for heart rate, blood pressure, blood oxygen, temperature or blood sugar. For those five readings the app uses published medical ranges, and names the source next to each one.')}
        </p>
        <p>
          {tr('The crew data is simulated. NASA keeps each astronaut’s health record private: its LSAH programme says records may show “normal” rather than specific values, and data that could identify a person needs a formal request.')}
        </p>
      </Card>

      <SectionTitle>{tr('Sources')}</SectionTitle>
      <ul className={LIST}>
        {SOURCES.map((s) => (
          <li key={s.url} className={ROW}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className="flex min-h-11 items-center px-4 py-2 text-sm text-accent underline underline-offset-4">
              {s.name}
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}

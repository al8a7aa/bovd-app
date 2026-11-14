import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { useHealth } from '../hooks'
import { tr } from '../i18n'
import { BTN_PRIMARY, Card, LABEL, LIST, PageTitle, ROW, SectionTitle } from '../components/ui'

/** One question a day, in turn, so the page is never blank. */
export const PROMPTS = [
  'What went well today?',
  'What was hard today, and what helped?',
  'What are you looking forward to?',
  'Who did you enjoy working with today, and why?',
  'What do you miss from home, and what reminds you of it here?',
]

const NO_ENTRIES: Record<number, string> = {}

/** NASA calls journaling an invaluable tool in long isolation. These notes stay private: nothing else in the app reads them. */
export default function Journal() {
  const { today } = useHealth()
  const entries = useStore((s) => s.journal[s.activeId] ?? NO_ENTRIES)
  const setJournal = useStore((s) => s.setJournal)
  const [draft, setDraft] = useState(entries[today] ?? '')
  const [saved, setSaved] = useState(false)

  const past = Object.keys(entries).map(Number).filter((d) => d !== today).sort((a, b) => b - a)
  const unchanged = draft.trim() === (entries[today] ?? '')

  return (
    <>
      <PageTitle
        title={tr('Journal')}
        sub={tr('Private notes, only for you. They stay on this device. They are never put in the report and never shown to the helper.')}
      />

      <Card>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            setJournal(today, draft)
            setSaved(true)
          }}
        >
          <label htmlFor="entry" className="block font-semibold">{tr(PROMPTS[today % PROMPTS.length])}</label>
          <p className="mt-1 text-sm text-muted">{tr('Write as much or as little as you like. You can also ignore the question.')}</p>
          <textarea
            id="entry"
            rows={7}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              setSaved(false)
            }}
            className="mt-3 w-full rounded-md border border-line bg-bg p-3 text-sm leading-relaxed"
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={unchanged} className={BTN_PRIMARY}>{tr('Save entry')}</button>
            <span className="text-sm text-muted" role="status">{saved && unchanged && tr('Saved on this device.')}</span>
          </div>
        </form>
      </Card>

      <SectionTitle>{tr('Earlier entries')}</SectionTitle>
      {past.length === 0 ? (
        <p className="text-sm text-muted">{tr('Nothing here yet. Entries from earlier days will show up in this list.')}</p>
      ) : (
        <ul className={LIST}>
          {past.map((d) => (
            <li key={d} className={`flex items-start gap-2 px-4 py-3 ${ROW}`}>
              <div className="min-w-0 flex-1">
                <div className={LABEL}>{tr('Mission day {day}', { day: d })}</div>
                <p className="mt-1 text-sm whitespace-pre-wrap">{entries[d]}</p>
              </div>
              <button
                onClick={() => window.confirm(tr('Delete this journal entry? This cannot be undone.')) && setJournal(d, '')}
                aria-label={tr('Delete entry for mission day {day}', { day: d })}
                className="grid size-11 shrink-0 place-items-center text-muted hover:text-bad"
              >
                <Trash2 size={18} aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

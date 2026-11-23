import { useState } from 'react'
import { useLanguage } from './language-context'
import { addWrongLine, getCodeLines, isBugLine, isExplanationReady } from './lib/bug-check'
import { pick } from './lib/language'
import type { Lesson } from './lib/lesson'

type BugCheckPanelProps = {
  bugCheck: NonNullable<Lesson['bugCheck']>
  passed: boolean
  explained: boolean
  // Called in the click when the learner taps the right line, with how many different wrong lines were tapped first.
  onPassed: (wrongTaps: number) => void
  // Called in the click when the learner says their explanation matches the model answer.
  onExplained: () => void
}

// One value for the whole panel, so two screens can never show at once.
// searching: tap the line. explaining: write why. comparing: own text next to the model answer.
// showing: only the model answer (the learner could not explain yet). done: explained.
type PanelState = 'searching' | 'explaining' | 'comparing' | 'showing' | 'done'

function startState(passed: boolean, explained: boolean): PanelState {
  if (!passed) return 'searching'
  return explained ? 'done' : 'explaining'
}

const buttonClass =
  'min-h-11 rounded-md border border-border-strong bg-surface px-4 font-semibold text-accent disabled:opacity-50'

export function BugCheckPanel({
  bugCheck,
  passed,
  explained,
  onPassed,
  onExplained,
}: BugCheckPanelProps) {
  const { language, t } = useLanguage()
  const [panelState, setPanelState] = useState<PanelState>(() => startState(passed, explained))
  const [tappedLine, setTappedLine] = useState<number | null>(null)
  // Every wrong line tried so far. They stay amber, so the learner sees what was already tried.
  const [wrongLines, setWrongLines] = useState<number[]>([])
  // The explanation is kept in this panel only; it is not saved.
  const [explanation, setExplanation] = useState('')
  const [showNotYetNote, setShowNotYetNote] = useState(false)

  const lines = getCodeLines(bugCheck.code)
  const isSearching = panelState === 'searching'

  // Reported in the click and not in an effect, so switching steps never reports twice.
  function tapLine(lineNumber: number) {
    setTappedLine(lineNumber)
    if (isBugLine(bugCheck.bugLine, lineNumber)) {
      onPassed(wrongLines.length)
      setPanelState('explaining')
    } else {
      setWrongLines(addWrongLine(wrongLines, lineNumber))
    }
  }

  function markSame() {
    onExplained()
    setPanelState('done')
  }

  // Nothing is saved here: the learner is asked to try again, with the box cleared.
  function markNotYet() {
    setExplanation('')
    setShowNotYetNote(true)
    setPanelState('explaining')
  }

  function lineClass(lineNumber: number): string {
    const base = 'flex min-h-11 w-full items-center gap-3 px-3 text-left font-mono text-[15px] '
    if (!isSearching && lineNumber === bugCheck.bugLine) {
      return base + 'bg-surface-raised text-success'
    }
    if (wrongLines.includes(lineNumber)) return base + 'bg-surface-raised text-review'
    return base + 'hover:bg-surface-raised'
  }

  const modelAnswer = (
    <p className="mt-2 text-text-muted">
      <span className="font-semibold">{t.whyLabel}: </span>
      {pick(bugCheck.why, language)}
    </p>
  )

  return (
    <div className="rounded-2xl border border-review bg-surface p-5">
      <h3 className="font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t.bugCheckTitle}
        {passed && ` · ${t.bugCheckDone}`}
        {panelState === 'done' && ` · ${t.bugCheckExplained}`}
      </h3>
      <p className="mt-3">{pick(bugCheck.prompt, language)}</p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg py-2">
        {lines.map((text, index) => {
          const lineNumber = index + 1
          return (
            <button
              key={lineNumber}
              type="button"
              disabled={!isSearching}
              aria-label={`${t.bugCheckLineLabel} ${lineNumber}`}
              onClick={() => tapLine(lineNumber)}
              className={lineClass(lineNumber)}
            >
              <span aria-hidden="true" className="w-4 shrink-0 text-text-subtle">
                {lineNumber}
              </span>
              <span className="min-w-0 whitespace-pre-wrap wrap-break-word text-left">{text}</span>
            </button>
          )
        })}
      </div>

      {isSearching && tappedLine !== null && (
        <p role="status" className="mt-4 font-semibold text-review">
          {t.bugCheckNotThisLine}
        </p>
      )}

      {!isSearching && (
        <div role="status" className="mt-4">
          <p className="font-semibold text-success">{t.bugCheckFound}</p>
          {tappedLine !== null && (
            <p className="mt-2 font-mono text-sm text-text-subtle">
              {wrongLines.length === 0
                ? t.bugCheckFirstTap
                : `${t.bugCheckWrongTapsLabel}: ${wrongLines.length}`}
            </p>
          )}
        </div>
      )}

      {panelState === 'explaining' && (
        <div className="mt-4 space-y-3">
          {showNotYetNote && <p className="text-text-muted">{t.bugCheckNotYetNote}</p>}
          <label className="block font-semibold" htmlFor="bug-explanation">
            {t.bugCheckExplainLabel}
          </label>
          <textarea
            id="bug-explanation"
            value={explanation}
            onChange={(event) => setExplanation(event.target.value)}
            rows={3}
            className="w-full rounded-lg border border-border-strong bg-surface p-3 text-base"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={!isExplanationReady(explanation)}
              onClick={() => setPanelState('comparing')}
              className={buttonClass}
            >
              {t.bugCheckCompare}
            </button>
            <button type="button" onClick={() => setPanelState('showing')} className={buttonClass}>
              {t.bugCheckShowMe}
            </button>
          </div>
        </div>
      )}

      {panelState === 'comparing' && (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="min-w-0 rounded-lg border border-border bg-surface-raised p-3">
              <p className="font-mono text-xs uppercase tracking-wider text-text-subtle">
                {t.bugCheckYours}
              </p>
              <p className="mt-2 whitespace-pre-wrap wrap-break-word">{explanation.trim()}</p>
            </div>
            <div className="min-w-0 rounded-lg border border-border bg-surface-raised p-3">
              <p className="font-mono text-xs uppercase tracking-wider text-text-subtle">
                {t.bugCheckModel}
              </p>
              <p className="mt-2">{pick(bugCheck.why, language)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={markSame} className={buttonClass}>
              {t.bugCheckSame}
            </button>
            <button type="button" onClick={markNotYet} className={buttonClass}>
              {t.bugCheckNotYet}
            </button>
          </div>
        </div>
      )}

      {panelState === 'showing' && (
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-border bg-surface-raised p-3">
            <p className="font-mono text-xs uppercase tracking-wider text-text-subtle">
              {t.bugCheckModel}
            </p>
            <p className="mt-2">{pick(bugCheck.why, language)}</p>
          </div>
          <button type="button" onClick={() => setPanelState('explaining')} className={buttonClass}>
            {t.bugCheckTryExplain}
          </button>
        </div>
      )}

      {panelState === 'done' && modelAnswer}
    </div>
  )
}

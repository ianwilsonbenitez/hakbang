import { useState } from 'react'
import { useLanguage } from './language-context'
import { addWrongLine, getCodeLines, isBugLine } from './lib/bug-check'
import { pick } from './lib/language'
import type { Lesson } from './lib/lesson'

type BugCheckPanelProps = {
  bugCheck: NonNullable<Lesson['bugCheck']>
  passed: boolean
  // Called in the click when the learner taps the right line, with how many different wrong lines were tapped first.
  onPassed: (wrongTaps: number) => void
}

export function BugCheckPanel({ bugCheck, passed, onPassed }: BugCheckPanelProps) {
  const { language, t } = useLanguage()
  const [tappedLine, setTappedLine] = useState<number | null>(null)
  // Every wrong line tried so far. They stay amber, so the learner sees what was already tried.
  const [wrongLines, setWrongLines] = useState<number[]>([])

  const lines = getCodeLines(bugCheck.code)
  const isFound = tappedLine !== null && isBugLine(bugCheck.bugLine, tappedLine)

  // Reported in the click and not in an effect, so switching steps never reports twice.
  function tapLine(lineNumber: number) {
    setTappedLine(lineNumber)
    if (isBugLine(bugCheck.bugLine, lineNumber)) {
      onPassed(wrongLines.length)
    } else {
      setWrongLines(addWrongLine(wrongLines, lineNumber))
    }
  }

  function lineClass(lineNumber: number): string {
    const base = 'flex min-h-11 w-full items-center gap-3 px-3 text-left font-mono text-[15px] '
    if (isFound && lineNumber === tappedLine) return base + 'bg-surface-raised text-success'
    if (wrongLines.includes(lineNumber)) return base + 'bg-surface-raised text-review'
    return base + 'hover:bg-surface-raised'
  }

  return (
    <div className="rounded-2xl border border-review bg-surface p-5">
      <h3 className="font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t.bugCheckTitle}
        {passed && ` · ${t.bugCheckDone}`}
      </h3>
      <p className="mt-3">{pick(bugCheck.prompt, language)}</p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg py-2">
        {lines.map((text, index) => {
          const lineNumber = index + 1
          return (
            <button
              key={lineNumber}
              type="button"
              disabled={isFound}
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

      {tappedLine !== null && (
        <div role="status" className="mt-4">
          <p className={isFound ? 'font-semibold text-success' : 'font-semibold text-review'}>
            {isFound ? t.bugCheckFound : t.bugCheckNotThisLine}
          </p>
          {isFound && (
            <p className="mt-2 font-mono text-sm text-text-subtle">
              {wrongLines.length === 0
                ? t.bugCheckFirstTap
                : `${t.bugCheckWrongTapsLabel}: ${wrongLines.length}`}
            </p>
          )}
          {isFound && (
            <p className="mt-2 text-text-muted">
              <span className="font-semibold">{t.whyLabel}: </span>
              {pick(bugCheck.why, language)}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

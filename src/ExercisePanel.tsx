import { useState } from 'react'
import { useLanguage } from './language-context'
import { pick } from './lib/language'
import type { Lesson } from './lib/lesson'
import {
  MAX_HINTS,
  canUnlockMoreHints,
  isAcceptedAnswer,
  unlockNextHint,
  visibleHints,
} from './lib/exercise'

type ExercisePanelProps = {
  exercise: NonNullable<Lesson['exercise']>
  solved: boolean
  // Called once when the answer is right, with the number of hints that were opened.
  onSolved: (hintsUsed: number) => void
}

const buttonClass =
  'min-h-11 rounded-md border border-border-strong bg-surface px-4 font-semibold text-accent disabled:opacity-50'

export function ExercisePanel({ exercise, solved, onSolved }: ExercisePanelProps) {
  const { language, t } = useLanguage()
  const [answer, setAnswer] = useState('')
  const [hintsUsed, setHintsUsed] = useState(0)
  const [result, setResult] = useState<'none' | 'correct' | 'wrong'>('none')

  // Reported in the click and not in an effect, so switching steps never reports twice.
  function checkAnswer() {
    const isCorrect = isAcceptedAnswer(exercise.acceptedAnswers, answer)
    setResult(isCorrect ? 'correct' : 'wrong')
    if (isCorrect) onSolved(hintsUsed)
  }

  const shownHints = visibleHints(exercise.hints, hintsUsed)

  return (
    <div className="rounded-2xl border border-accent bg-surface p-5">
      <h3 className="font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t.exerciseTitle}
        {solved && ` · ${t.exerciseDone}`}
      </h3>
      <p className="mt-3">{pick(exercise.prompt, language)}</p>

      <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg p-4 font-mono text-[15px] leading-[1.9]">
        {exercise.code}
      </pre>

      <label className="mt-4 block font-semibold" htmlFor="exercise-answer">
        {t.exerciseBlankLabel}
      </label>
      <input
        id="exercise-answer"
        type="text"
        value={answer}
        onChange={(event) => setAnswer(event.target.value)}
        autoComplete="off"
        spellCheck={false}
        className="mt-2 min-h-11 w-full rounded-md border border-border-strong bg-surface-raised px-3 font-mono"
      />

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={checkAnswer}
          disabled={answer.trim() === ''}
          className={buttonClass}
        >
          {t.exerciseCheck}
        </button>
        <button
          type="button"
          onClick={() => setHintsUsed(unlockNextHint(hintsUsed))}
          disabled={!canUnlockMoreHints(hintsUsed)}
          className={buttonClass}
        >
          {t.showHint}
        </button>
        <p className="font-mono text-sm text-text-subtle">
          {t.hintsUsedLabel}: {hintsUsed} {t.hintsOf} {MAX_HINTS}
        </p>
      </div>

      {shownHints.length > 0 && (
        <ol className="mt-4 space-y-2">
          {shownHints.map((hint, index) => (
            <li key={index} className="rounded-lg border border-border bg-surface-raised p-3">
              <span className="font-semibold">
                {t.hintLabel} {index + 1}:{' '}
              </span>
              {pick(hint, language)}
            </li>
          ))}
        </ol>
      )}

      {result !== 'none' && (
        <p
          role="status"
          className={
            'mt-4 font-semibold ' + (result === 'correct' ? 'text-success' : 'text-review')
          }
        >
          {result === 'correct' ? t.exerciseCorrect : t.exerciseWrong}
        </p>
      )}
    </div>
  )
}

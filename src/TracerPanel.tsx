import { useState } from 'react'
import { useLanguage } from './language-context'
import { getCodeLines } from './lib/bug-check'
import { pick } from './lib/language'
import type { Lesson } from './lib/lesson'
import {
  getVarRows,
  isLastStep,
  isLineSkipped,
  nextStepIndex,
  previousStepIndex,
} from './lib/tracer'

type TracerPanelProps = {
  tracer: NonNullable<Lesson['tracer']>
}

const buttonClass =
  'min-h-11 rounded-md border border-border-strong bg-surface px-4 font-semibold text-accent disabled:opacity-50'

export function TracerPanel({ tracer }: TracerPanelProps) {
  const { language, t } = useLanguage()
  // The learner thinks first: stepping starts only after the answer is shown.
  const [isRevealed, setIsRevealed] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)

  const lines = getCodeLines(tracer.code)
  const totalSteps = tracer.steps.length
  const step = tracer.steps[stepIndex]
  const varRows = getVarRows(step.vars)

  return (
    <div className="rounded-2xl border border-accent bg-surface p-5">
      <h3 className="font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t.tracerTitle}
      </h3>

      <div className="mt-3 rounded-xl border border-border bg-surface-raised p-4">
        <p className="font-mono text-xs uppercase tracking-wider text-text-subtle">
          {t.tracerThinkFirst}
        </p>
        <p className="mt-2 font-semibold">{pick(tracer.predict.question, language)}</p>
        {!isRevealed && (
          <button type="button" onClick={() => setIsRevealed(true)} className={`${buttonClass} mt-3`}>
            {t.tracerShowAnswer}
          </button>
        )}
        {isRevealed && (
          <p className="mt-3 text-text-muted">
            <span className="font-semibold">{t.tracerAnswerLabel}: </span>
            {pick(tracer.predict.answer, language)}
          </p>
        )}
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border bg-bg py-2">
        {lines.map((text, index) => {
          const lineNumber = index + 1
          const isCurrent = isRevealed && step.line === lineNumber
          const isSkipped = isRevealed && isLineSkipped(step, lineNumber)
          return (
            <div
              key={lineNumber}
              aria-current={isCurrent ? 'step' : undefined}
              className={
                'flex min-h-9 items-center gap-3 px-3 font-mono text-[15px] ' +
                (isCurrent ? 'bg-surface-raised ' : '') +
                (isSkipped ? 'opacity-50' : '')
              }
            >
              <span aria-hidden="true" className="w-4 shrink-0 text-accent">
                {isCurrent ? '▶' : ''}
              </span>
              <span aria-hidden="true" className="w-4 shrink-0 text-text-subtle">
                {lineNumber}
              </span>
              <span className="whitespace-pre">{text}</span>
              {isCurrent && step.condition !== undefined && (
                <span className="ml-auto whitespace-nowrap pl-4 text-xs text-accent">
                  {step.condition}
                </span>
              )}
              {isSkipped && (
                <span className="ml-auto whitespace-nowrap pl-4 text-xs text-text-subtle">
                  {t.tracerSkipped}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {isRevealed && (
        <div className="mt-4 space-y-4">
          <div className="rounded-xl border border-border bg-surface-raised p-4">
            <p className="font-mono text-xs uppercase tracking-wider text-text-subtle">
              {t.tracerVarsTitle}
            </p>
            {varRows.length === 0 ? (
              <p className="mt-2 text-text-muted">{t.tracerNoVars}</p>
            ) : (
              <dl className="mt-2 space-y-1 font-mono">
                {varRows.map((row) => (
                  <div key={row.name} className="flex gap-2">
                    <dt className="font-semibold">{row.name}</dt>
                    <dd>= {row.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          <p role="status">{pick(step.note, language)}</p>

          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={() => setStepIndex(0)} className={buttonClass}>
              {t.tracerReset}
            </button>
            <button
              type="button"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex(previousStepIndex(stepIndex))}
              className={buttonClass}
            >
              {t.tracerPrevious}
            </button>
            <button
              type="button"
              disabled={isLastStep(stepIndex, totalSteps)}
              onClick={() => setStepIndex(nextStepIndex(stepIndex, totalSteps))}
              className={buttonClass}
            >
              {t.tracerStep}
            </button>
            <p className="font-mono text-sm text-text-subtle">
              {t.tracerStepLabel} {stepIndex + 1} {t.tracerOf} {totalSteps}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

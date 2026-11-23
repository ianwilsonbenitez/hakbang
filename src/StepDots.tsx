import { useLanguage } from './language-context'
import { isStepDone, type LessonStep } from './lib/lesson-flow'
import type { LessonProgress } from './lib/progress'

type StepDotsProps = {
  steps: LessonStep[]
  current: LessonStep
  labels: Record<LessonStep, string>
  entry: LessonProgress | undefined
  onSelect: (step: LessonStep) => void
}

export function StepDots({ steps, current, labels, entry, onSelect }: StepDotsProps) {
  const { t } = useLanguage()
  const position = steps.indexOf(current) + 1

  return (
    <div className="mt-4">
      <nav aria-label={t.stepsLabel} className="flex flex-wrap gap-1">
        {steps.map((step, index) => {
          const isCurrent = step === current
          const isDone = isStepDone(step, entry)
          const name = `${t.stepWord} ${index + 1} ${t.stepOf} ${steps.length}: ${labels[step]}${isDone ? ` (${t.stepDoneMark})` : ''}`
          return (
            // The button is 44px for touch; the dot drawn inside it is smaller.
            <button
              key={step}
              type="button"
              aria-label={name}
              aria-current={isCurrent ? 'step' : undefined}
              onClick={() => onSelect(step)}
              className="flex h-11 w-11 items-center justify-center rounded-md"
            >
              <span
                className={
                  'flex h-6 w-6 items-center justify-center rounded-full border-2 ' +
                  (isCurrent ? 'border-accent ring-2 ring-accent ring-offset-2 ring-offset-bg ' : 'border-border-strong ') +
                  (isDone ? 'bg-surface-raised text-success' : 'bg-surface text-text-muted')
                }
              >
                {isDone && (
                  // A check shape, so "done" does not depend on colour alone.
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 16 16"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M3 8.5l3.5 3.5L13 4.5" />
                  </svg>
                )}
              </span>
            </button>
          )
        })}
      </nav>
      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-text-subtle">
        {position} {t.stepOf} {steps.length} · {labels[current]}
      </p>
    </div>
  )
}

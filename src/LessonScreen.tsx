import { useState } from 'react'
import { useLanguage } from './language-context'
import { pick } from './lib/language'
import type { Lesson } from './lib/lesson'
import {
  LESSON_STEPS,
  isCorrectAnswer,
  nextStep,
  previousStep,
  type LessonStep,
} from './lib/lesson-flow'

const secondaryButtonClass =
  'min-h-11 rounded-md border border-border-strong bg-surface px-4 font-semibold text-accent disabled:opacity-50'

function PictureStep({ lesson }: { lesson: Lesson }) {
  const { language, t } = useLanguage()
  // Placeholder until the SVG diagram component is built; the alt text already explains the picture.
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <p className="font-mono text-xs uppercase tracking-wider text-text-subtle">{t.diagramSoon}</p>
      <p className="mt-3 text-text-muted">{pick(lesson.diagram.alt, language)}</p>
    </div>
  )
}

function ExplainStep({ lesson }: { lesson: Lesson }) {
  const { language } = useLanguage()
  return (
    <div className="space-y-4 leading-relaxed">
      {lesson.explain.map((paragraph, index) => (
        <p key={index}>{pick(paragraph, language)}</p>
      ))}
    </div>
  )
}

function TryStep({ lesson }: { lesson: Lesson }) {
  const { language, t } = useLanguage()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isChecked, setIsChecked] = useState(false)

  const { task } = lesson
  const isCorrect = isCorrectAnswer(task, selectedId)

  function optionClass(optionId: string): string {
    const base = 'min-h-11 w-full rounded-lg border px-4 py-3 text-left '
    if (isChecked && optionId === task.answer) return base + 'border-success bg-surface-raised'
    if (isChecked && optionId === selectedId) return base + 'border-review bg-surface-raised'
    if (optionId === selectedId) return base + 'border-accent bg-surface-raised'
    return base + 'border-border-strong bg-surface'
  }

  function tryAgain() {
    setSelectedId(null)
    setIsChecked(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-lg font-semibold">{pick(task.question, language)}</p>
      <div className="space-y-3">
        {task.options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={isChecked}
            aria-pressed={option.id === selectedId}
            onClick={() => setSelectedId(option.id)}
            className={optionClass(option.id)}
          >
            {pick(option.text, language)}
          </button>
        ))}
      </div>

      {!isChecked && (
        <button
          type="button"
          disabled={selectedId === null}
          onClick={() => setIsChecked(true)}
          className={secondaryButtonClass}
        >
          {t.checkAnswer}
        </button>
      )}

      {isChecked && (
        <div className="rounded-xl border border-border bg-surface p-4" role="status">
          <p className={isCorrect ? 'font-semibold text-success' : 'font-semibold text-review'}>
            {isCorrect ? t.answerCorrect : t.answerWrong}
          </p>
          <p className="mt-2 text-text-muted">
            <span className="font-semibold">{t.whyLabel}: </span>
            {pick(task.why, language)}
          </p>
          {!isCorrect && (
            <button type="button" onClick={tryAgain} className={`${secondaryButtonClass} mt-3`}>
              {t.tryAgain}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function LessonScreen({ lesson }: { lesson: Lesson }) {
  const { language, t } = useLanguage()
  const [step, setStep] = useState<LessonStep>('picture')

  const stepLabels: Record<LessonStep, string> = {
    picture: t.stepPicture,
    explain: t.stepExplain,
    try: t.stepTry,
  }

  return (
    <section>
      <p className="font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t.unitLabel} {lesson.unit} · {lesson.minutes} {t.minutesShort}
      </p>
      <h2 className="mt-1 text-xl font-bold">{pick(lesson.title, language)}</h2>

      <nav aria-label={t.stepsLabel} className="mt-4 flex flex-wrap gap-2">
        {LESSON_STEPS.map((lessonStep) => (
          <button
            key={lessonStep}
            type="button"
            aria-current={lessonStep === step ? 'step' : undefined}
            onClick={() => setStep(lessonStep)}
            className={
              lessonStep === step
                ? 'min-h-11 rounded-md border border-accent bg-surface-raised px-4 font-semibold text-accent'
                : 'min-h-11 rounded-md border border-border-strong bg-surface px-4 text-text-muted'
            }
          >
            {stepLabels[lessonStep]}
          </button>
        ))}
      </nav>

      <div className="mt-6">
        {step === 'picture' && <PictureStep lesson={lesson} />}
        {step === 'explain' && <ExplainStep lesson={lesson} />}
        {step === 'try' && <TryStep lesson={lesson} />}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={step === 'picture'}
          onClick={() => setStep(previousStep(step))}
          className={secondaryButtonClass}
        >
          {t.back}
        </button>
        <button
          type="button"
          disabled={step === 'try'}
          onClick={() => setStep(nextStep(step))}
          className={secondaryButtonClass}
        >
          {t.next}
        </button>
      </div>
    </section>
  )
}

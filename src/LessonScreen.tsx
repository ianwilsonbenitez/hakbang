import { useState } from 'react'
import { BugCheckPanel } from './BugCheckPanel'
import { CheckPanel } from './CheckPanel'
import { DiagramView } from './DiagramView'
import { ExercisePanel } from './ExercisePanel'
import { useLanguage } from './language-context'
import { TracerPanel } from './TracerPanel'
import { pick } from './lib/language'
import type { Lesson } from './lib/lesson'
import {
  getLessonSteps,
  isCorrectAnswer,
  nextStep,
  previousStep,
  type LessonStep,
} from './lib/lesson-flow'

const secondaryButtonClass =
  'min-h-11 rounded-md border border-border-strong bg-surface px-4 font-semibold text-accent disabled:opacity-50'

function PictureStep({ lesson }: { lesson: Lesson }) {
  const { language } = useLanguage()
  return (
    <div className="rounded-2xl border border-border bg-surface p-5">
      <DiagramView file={lesson.diagram.file} alt={pick(lesson.diagram.alt, language)} />
    </div>
  )
}

function ExplainStep({ lesson }: { lesson: Lesson }) {
  const { language, t } = useLanguage()
  const glossary = lesson.glossary ?? []
  return (
    <div className="space-y-4 leading-relaxed">
      {lesson.explain.map((paragraph, index) => (
        <p key={index}>{pick(paragraph, language)}</p>
      ))}
      {glossary.length > 0 && (
        <section className="rounded-xl border border-border bg-surface p-4">
          <h3 className="font-mono text-xs uppercase tracking-wider text-text-subtle">
            {t.glossaryTitle}
          </h3>
          <dl className="mt-3 space-y-3">
            {glossary.map((entry) => (
              <div key={entry.term}>
                <dt className="font-mono font-semibold">{entry.term}</dt>
                <dd className="text-text-muted">{pick(entry, language)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  )
}

function TaskStep({ lesson, onTaskPassed }: { lesson: Lesson; onTaskPassed: () => void }) {
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

  // Reported here, in the click, and not in an effect: effects re-run when the step is switched.
  function checkAnswer() {
    setIsChecked(true)
    if (isCorrect) onTaskPassed()
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
          onClick={checkAnswer}
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

type LessonScreenProps = {
  lesson: Lesson
  taskPassed: boolean
  onTaskPassed: () => void
  exerciseSolved: boolean
  onExerciseSolved: (hintsUsed: number) => void
  checkBestScore: number | undefined
  checkAttempts: number | undefined
  onCheckFinished: (rightCount: number) => void
  bugCheckPassed: boolean
  onBugCheckPassed: (wrongTaps: number) => void
  bugCheckExplained: boolean
  onBugCheckExplained: () => void
  // Called on the last step, so the learner can go back to the skill map.
  onClose: () => void
}

export function LessonScreen({
  lesson,
  taskPassed,
  onTaskPassed,
  exerciseSolved,
  onExerciseSolved,
  checkBestScore,
  checkAttempts,
  onCheckFinished,
  bugCheckPassed,
  onBugCheckPassed,
  bugCheckExplained,
  onBugCheckExplained,
  onClose,
}: LessonScreenProps) {
  const { language, t } = useLanguage()
  const [step, setStep] = useState<LessonStep>('picture')

  const steps = getLessonSteps({
    hasTracer: lesson.tracer !== undefined,
    hasExercise: lesson.exercise !== undefined,
    hasBugCheck: lesson.bugCheck !== undefined,
  })
  const isLastStep = step === steps[steps.length - 1]

  const stepLabels: Record<LessonStep, string> = {
    picture: t.stepPicture,
    explain: t.stepExplain,
    task: t.stepTask,
    trace: t.stepTrace,
    build: t.stepBuild,
    check: t.stepCheck,
    debug: t.stepDebug,
  }

  // Each panel sits in its own wrapper that is hidden, not removed, so opened hints,
  // typed answers and the tracer position survive a step change.
  function stepClass(lessonStep: LessonStep): string {
    return step === lessonStep ? '' : 'hidden'
  }

  return (
    <section>
      <p className="font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t.unitLabel} {lesson.unit} · {lesson.minutes} {t.minutesShort}
      </p>
      <h2 className="mt-1 text-xl font-bold">{pick(lesson.title, language)}</h2>
      {taskPassed && (
        // A word plus a check shape, so the meaning does not depend on colour alone.
        <p className="mt-2 flex items-center gap-2 font-semibold text-success">
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="h-4 w-4 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3 8.5l3.5 3.5L13 4.5" />
          </svg>
          {t.taskDone}
        </p>
      )}

      <nav aria-label={t.stepsLabel} className="mt-4 flex flex-wrap gap-2">
        {steps.map((lessonStep) => (
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
        <div className={stepClass('task')}>
          <TaskStep lesson={lesson} onTaskPassed={onTaskPassed} />
        </div>
        {lesson.tracer !== undefined && (
          <div className={stepClass('trace')}>
            <TracerPanel tracer={lesson.tracer} />
          </div>
        )}
        {lesson.exercise !== undefined && (
          <div className={stepClass('build')}>
            <ExercisePanel
              exercise={lesson.exercise}
              solved={exerciseSolved}
              onSolved={onExerciseSolved}
            />
          </div>
        )}
        <div className={stepClass('check')}>
          <CheckPanel
            questions={lesson.check}
            bestScore={checkBestScore}
            attempts={checkAttempts}
            onFinished={onCheckFinished}
          />
        </div>
        {lesson.bugCheck !== undefined && (
          <div className={stepClass('debug')}>
            <BugCheckPanel
              bugCheck={lesson.bugCheck}
              passed={bugCheckPassed}
              explained={bugCheckExplained}
              onPassed={onBugCheckPassed}
              onExplained={onBugCheckExplained}
            />
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={step === 'picture'}
          onClick={() => setStep(previousStep(steps, step))}
          className={secondaryButtonClass}
        >
          {t.back}
        </button>
        <button
          type="button"
          onClick={() => (isLastStep ? onClose() : setStep(nextStep(steps, step)))}
          className={secondaryButtonClass}
        >
          {isLastStep ? t.backToMap : t.next}
        </button>
      </div>
    </section>
  )
}

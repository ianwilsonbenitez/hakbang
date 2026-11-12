import { useState } from 'react'
import { useLanguage } from './language-context'
import { scoreCheck } from './lib/check'
import { pick } from './lib/language'
import type { Lesson } from './lib/lesson'

type CheckPanelProps = {
  questions: Lesson['check']
  bestScore: number | undefined
  // Called once when the learner finishes the last question, with the number of right answers.
  onFinished: (rightCount: number) => void
}

const buttonClass =
  'min-h-11 rounded-md border border-border-strong bg-surface px-4 font-semibold text-accent disabled:opacity-50'

export function CheckPanel({ questions, bestScore, onFinished }: CheckPanelProps) {
  const { language, t } = useLanguage()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<(string | null)[]>(() => questions.map(() => null))
  const [isFinished, setIsFinished] = useState(false)

  const question = questions[index]
  const selectedId = answers[index]
  const isLastQuestion = index === questions.length - 1

  function selectOption(optionId: string) {
    setAnswers(answers.map((answer, i) => (i === index ? optionId : answer)))
  }

  // Reported in the click and not in an effect, so switching steps never reports twice.
  function goNext() {
    if (!isLastQuestion) {
      setIndex(index + 1)
      return
    }
    setIsFinished(true)
    onFinished(scoreCheck(questions, answers).right)
  }

  function retry() {
    setIndex(0)
    setAnswers(questions.map(() => null))
    setIsFinished(false)
  }

  function optionClass(optionId: string): string {
    const base = 'min-h-11 w-full rounded-lg border px-4 py-3 text-left '
    return optionId === selectedId
      ? base + 'border-accent bg-surface-raised'
      : base + 'border-border-strong bg-surface'
  }

  return (
    <div className="rounded-2xl border border-review bg-surface p-5">
      <h3 className="font-mono text-xs uppercase tracking-wider text-text-subtle">
        {t.checkTitle}
        {bestScore !== undefined && ` · ${t.checkBestLabel}: ${bestScore} ${t.checkOf} ${questions.length}`}
      </h3>

      {!isFinished && (
        <div className="mt-3 space-y-4">
          <p className="font-mono text-sm text-text-subtle">
            {t.checkQuestionLabel} {index + 1} {t.checkOf} {questions.length}
          </p>
          <p className="text-lg font-semibold">{pick(question.question, language)}</p>
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={option.id === selectedId}
                onClick={() => selectOption(option.id)}
                className={optionClass(option.id)}
              >
                {pick(option.text, language)}
              </button>
            ))}
          </div>
          <button
            type="button"
            disabled={selectedId === null}
            onClick={goNext}
            className={buttonClass}
          >
            {isLastQuestion ? t.checkFinish : t.next}
          </button>
        </div>
      )}

      {isFinished && (
        <div className="mt-3 space-y-4">
          <p role="status" className="text-lg font-semibold text-success">
            {t.checkScoreLabel}: {scoreCheck(questions, answers).right} {t.checkOf} {questions.length}
          </p>
          <ol className="space-y-3">
            {questions.map((item, i) => {
              const isRight = answers[i] === item.answer
              const rightOption = item.options.find((option) => option.id === item.answer)
              return (
                <li key={i} className="rounded-lg border border-border bg-surface-raised p-3">
                  <p className="font-semibold">{pick(item.question, language)}</p>
                  <p className={isRight ? 'mt-1 font-semibold text-success' : 'mt-1 font-semibold text-review'}>
                    {isRight ? t.answerCorrect : t.answerWrong}
                  </p>
                  {!isRight && rightOption !== undefined && (
                    <p className="mt-1">
                      <span className="font-semibold">{t.checkRightAnswerLabel}: </span>
                      {pick(rightOption.text, language)}
                    </p>
                  )}
                  <p className="mt-1 text-text-muted">
                    <span className="font-semibold">{t.whyLabel}: </span>
                    {pick(item.why, language)}
                  </p>
                </li>
              )
            })}
          </ol>
          <button type="button" onClick={retry} className={buttonClass}>
            {t.tryAgain}
          </button>
        </div>
      )}
    </div>
  )
}

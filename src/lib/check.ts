import type { LessonChoice } from './lesson'
import { isCorrectAnswer } from './lesson-flow'

export type CheckScore = { right: number; wrong: number; total: number }

// answers[i] is the option id picked for question i, or null if it was not answered.
// An unanswered question counts as wrong, so the score always adds up to the number of questions.
export function scoreCheck(
  questions: Pick<LessonChoice, 'answer'>[],
  answers: (string | null)[],
): CheckScore {
  const right = questions.filter((question, index) =>
    isCorrectAnswer(question, answers[index] ?? null),
  ).length

  return { right, wrong: questions.length - right, total: questions.length }
}

import type { LessonChoice } from './lesson'

export type LessonStep = 'picture' | 'explain' | 'try'

export const LESSON_STEPS: LessonStep[] = ['picture', 'explain', 'try']

// Both stop at the ends instead of going past them.
export function nextStep(step: LessonStep): LessonStep {
  const index = LESSON_STEPS.indexOf(step)
  return LESSON_STEPS[Math.min(index + 1, LESSON_STEPS.length - 1)]
}

export function previousStep(step: LessonStep): LessonStep {
  const index = LESSON_STEPS.indexOf(step)
  return LESSON_STEPS[Math.max(index - 1, 0)]
}

export function isCorrectAnswer(choice: Pick<LessonChoice, 'answer'>, selectedId: string | null): boolean {
  return selectedId !== null && selectedId === choice.answer
}

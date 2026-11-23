import type { LessonChoice } from './lesson'
import { isCheckPassed } from './mastery'
import type { LessonProgress } from './progress'

export type LessonStep = 'picture' | 'explain' | 'task' | 'trace' | 'build' | 'check' | 'debug'

// Which optional parts this lesson has. Small flags, so we do not need the whole lesson file.
export type LessonStepParts = {
  hasTracer: boolean
  hasExercise: boolean
  hasBugCheck: boolean
}

// The steps this lesson has, in learning order. A step the lesson does not have is left out.
export function getLessonSteps(parts: LessonStepParts): LessonStep[] {
  const steps: LessonStep[] = ['picture', 'explain', 'task']
  if (parts.hasTracer) steps.push('trace')
  if (parts.hasExercise) steps.push('build')
  steps.push('check')
  if (parts.hasBugCheck) steps.push('debug')
  return steps
}

// Both stop at the ends instead of going past them. They take the list, because it differs per lesson.
export function nextStep(steps: LessonStep[], step: LessonStep): LessonStep {
  const index = steps.indexOf(step)
  return steps[Math.min(index + 1, steps.length - 1)]
}

export function previousStep(steps: LessonStep[], step: LessonStep): LessonStep {
  const index = steps.indexOf(step)
  return steps[Math.max(index - 1, 0)]
}

// Only steps with a saved fact can be done. Picture, Explain and Trace save nothing, so they are never marked.
export function isStepDone(step: LessonStep, entry: LessonProgress | undefined): boolean {
  switch (step) {
    case 'task':
      return entry?.taskPassed === true
    case 'build':
      return entry?.exerciseSolved === true
    case 'check':
      return isCheckPassed(entry?.checkBestScore ?? 0)
    case 'debug':
      return entry?.bugCheckExplained === true
    default:
      return false
  }
}

export function isCorrectAnswer(choice: Pick<LessonChoice, 'answer'>, selectedId: string | null): boolean {
  return selectedId !== null && selectedId === choice.answer
}

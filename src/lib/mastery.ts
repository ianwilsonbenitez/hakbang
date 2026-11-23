import type { LessonProgress } from './progress'

// The pass mark lives here and not in saved data, so changing it later needs no data change.
export const CHECK_PASS_SCORE = 2

// One place that knows what "passed" means, so the pip and the score colour always agree.
export function isCheckPassed(score: number): boolean {
  return score >= CHECK_PASS_SCORE
}

// Which optional parts this lesson has. Small flags, so we do not need the whole lesson file.
export type LessonParts = {
  hasExercise: boolean
  hasBugCheck: boolean
}

// One yes/no per pip. Worked out every time from the saved facts; never saved itself.
export type Mastery = {
  understands: boolean // Level 1: the lesson task was answered right
  builds: boolean // Level 2: the exercise was solved
  debugs: boolean // Level 3: the check was passed, the bug was found and explained
}

export function getMastery(entry: LessonProgress | undefined, parts: LessonParts): Mastery {
  const understands = entry?.taskPassed === true

  // A lesson without an exercise cannot ask for one, so Level 2 follows Level 1.
  const builds = parts.hasExercise ? entry?.exerciseSolved === true : understands

  const checkPassed = isCheckPassed(entry?.checkBestScore ?? 0)
  // Finding the line is not enough: the learner must also explain it (and say it matched the model answer).
  const bugCheckMet = parts.hasBugCheck
    ? entry?.bugCheckPassed === true && entry?.bugCheckExplained === true
    : true
  const debugs = checkPassed && bugCheckMet

  return { understands, builds, debugs }
}

export function isFinished(mastery: Mastery): boolean {
  return mastery.understands && mastery.builds && mastery.debugs
}

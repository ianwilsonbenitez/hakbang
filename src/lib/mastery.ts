import type { LessonProgress } from './progress'

// The pass mark lives here and not in saved data, so changing it later needs no data change.
export const CHECK_PASS_SCORE = 2

// Which optional parts this lesson has. Small flags, so we do not need the whole lesson file.
export type LessonParts = {
  hasExercise: boolean
  hasBugCheck: boolean
}

// One yes/no per pip. Worked out every time from the saved facts; never saved itself.
export type Mastery = {
  understands: boolean // Level 1: the lesson task was answered right
  builds: boolean // Level 2: the exercise was solved
  debugs: boolean // Level 3: the check was passed and the bug check was right
}

export function getMastery(entry: LessonProgress | undefined, parts: LessonParts): Mastery {
  const understands = entry?.taskPassed === true

  // A lesson without an exercise cannot ask for one, so Level 2 follows Level 1.
  const builds = parts.hasExercise ? entry?.exerciseSolved === true : understands

  const checkPassed = (entry?.checkBestScore ?? 0) >= CHECK_PASS_SCORE
  const bugCheckMet = parts.hasBugCheck ? entry?.bugCheckPassed === true : true
  const debugs = checkPassed && bugCheckMet

  return { understands, builds, debugs }
}

export function isFinished(mastery: Mastery): boolean {
  return mastery.understands && mastery.builds && mastery.debugs
}

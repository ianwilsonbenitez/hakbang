import type { LessonError } from './lesson'

// One line for the learner: where the problem is, then what it is.
// A problem with no path (the whole file) shows the message only.
export function formatLessonError(error: LessonError, message: string): string {
  return error.path === '' ? message : `${error.path}: ${message}`
}

// A broken file can have many problems. Show the first few and count the rest.
export function limitErrors<T>(errors: T[], max: number): { shown: T[]; hiddenCount: number } {
  return {
    shown: errors.slice(0, max),
    hiddenCount: Math.max(errors.length - max, 0),
  }
}

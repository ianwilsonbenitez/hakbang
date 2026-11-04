export const PROGRESS_STORAGE_KEY = 'hakbang-progress'

// Bump only for breaking changes (renamed or removed fields). New optional fields get defaults in parseProgress.
export const PROGRESS_SCHEMA_VERSION = 1

// Only the facts we saw happen. "Done" and mastery levels are worked out from these later.
// Every field is optional: a lesson only gets a field once the learner did that thing.
// Readers compare with `=== true`, so a missing field simply means "not yet".
export type LessonProgress = {
  taskPassed?: boolean
  exerciseSolved?: boolean
  exerciseHintsUsed?: number // whole number 0 to 3
  checkBestScore?: number // whole number 0 to 3; the best one, so a bad retake never takes a level away
  bugCheckPassed?: boolean
}

export type Progress = {
  schemaVersion: number
  lessons: Record<string, LessonProgress>
}

// Only the two methods we use, so tests can pass a tiny fake instead of real localStorage.
type ProgressStorage = Pick<Storage, 'getItem' | 'setItem'>

// A new object every time, so two callers never share (and accidentally change) the same one.
export function emptyProgress(): Progress {
  return { schemaVersion: PROGRESS_SCHEMA_VERSION, lessons: {} }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isWholeNumberFromZeroToThree(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0 && value <= 3
}

// Copies each known field only if its value is valid. Returns null when nothing valid was found,
// so an entry full of junk is dropped instead of kept as an empty object.
function parseLessonEntry(entry: unknown): LessonProgress | null {
  if (!isPlainObject(entry)) return null

  const lesson: LessonProgress = {}
  if (typeof entry.taskPassed === 'boolean') lesson.taskPassed = entry.taskPassed
  if (typeof entry.exerciseSolved === 'boolean') lesson.exerciseSolved = entry.exerciseSolved
  if (isWholeNumberFromZeroToThree(entry.exerciseHintsUsed)) {
    lesson.exerciseHintsUsed = entry.exerciseHintsUsed
  }
  if (isWholeNumberFromZeroToThree(entry.checkBestScore)) {
    lesson.checkBestScore = entry.checkBestScore
  }
  if (typeof entry.bugCheckPassed === 'boolean') lesson.bugCheckPassed = entry.bugCheckPassed

  return Object.keys(lesson).length > 0 ? lesson : null
}

// Checks data we do not trust (storage today, an imported file later).
// Bad parts are dropped, good parts are kept; it never throws.
export function parseProgress(raw: unknown): Progress {
  if (!isPlainObject(raw) || raw.schemaVersion !== PROGRESS_SCHEMA_VERSION) {
    return emptyProgress()
  }
  if (!isPlainObject(raw.lessons)) {
    return emptyProgress()
  }

  const progress = emptyProgress()
  for (const [lessonId, entry] of Object.entries(raw.lessons)) {
    const lesson = parseLessonEntry(entry)
    if (lesson !== null) progress.lessons[lessonId] = lesson
  }
  return progress
}

export function loadProgress(storage: ProgressStorage): Progress {
  try {
    const text = storage.getItem(PROGRESS_STORAGE_KEY)
    if (text === null) return emptyProgress()
    return parseProgress(JSON.parse(text))
  } catch {
    // Blocked storage or broken JSON: start empty. Nothing is written here, so saved data is never wiped by a load.
    return emptyProgress()
  }
}

export function saveProgress(storage: ProgressStorage, progress: Progress): void {
  try {
    storage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Not saving is fine; the app still works until the page closes.
  }
}

// Returns a new Progress and leaves the old one untouched. Safe to call twice.
export function markTaskPassed(progress: Progress, lessonId: string): Progress {
  return {
    ...progress,
    lessons: {
      ...progress.lessons,
      [lessonId]: { ...progress.lessons[lessonId], taskPassed: true },
    },
  }
}

export function isTaskPassed(progress: Progress, lessonId: string): boolean {
  return progress.lessons[lessonId]?.taskPassed === true
}

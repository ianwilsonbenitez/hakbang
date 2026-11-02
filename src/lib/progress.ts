export const PROGRESS_STORAGE_KEY = 'hakbang-progress'

// Bump only for breaking changes (renamed or removed fields). New optional fields get defaults in parseProgress.
export const PROGRESS_SCHEMA_VERSION = 1

// Only the facts we saw happen. "Done" and mastery levels are worked out from these later.
export type LessonProgress = {
  taskPassed: boolean
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
    if (isPlainObject(entry) && typeof entry.taskPassed === 'boolean') {
      progress.lessons[lessonId] = { taskPassed: entry.taskPassed }
    }
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

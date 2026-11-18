import { PROGRESS_SCHEMA_VERSION, parseProgress, type Progress } from './progress'

// The file name always starts with "hakbang-progress-", so .gitignore keeps backups out of the public repo.
// Example: new Date(2026, 10, 18) gives "hakbang-progress-2026-11-18.json".
export function backupFileName(date: Date): string {
  // getMonth() starts at 0, so we add 1. padStart makes month and day two digits (05, not 5).
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `hakbang-progress-${year}-${month}-${day}.json`
}

export function backupText(progress: Progress): string {
  return JSON.stringify(progress, null, 2)
}

export type BackupResult = { ok: true; progress: Progress } | { ok: false }

// Reads the text of a file the learner picked. parseProgress alone would turn a wrong file into
// empty progress, and then an import could wipe good data. So we first check the file really
// looks like a Hakbang backup, and say "not ok" if it does not.
export function parseBackupText(text: string): BackupResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false }
  }

  const looksLikeBackup =
    typeof raw === 'object' &&
    raw !== null &&
    !Array.isArray(raw) &&
    (raw as Record<string, unknown>).schemaVersion === PROGRESS_SCHEMA_VERSION &&
    typeof (raw as Record<string, unknown>).lessons === 'object' &&
    (raw as Record<string, unknown>).lessons !== null &&
    !Array.isArray((raw as Record<string, unknown>).lessons)

  if (!looksLikeBackup) return { ok: false }
  return { ok: true, progress: parseProgress(raw) }
}

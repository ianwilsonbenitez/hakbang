import { describe, expect, it } from 'vitest'
import { backupFileName, backupText, parseBackupText } from './backup'
import { emptyProgress, markBugCheckPassed, markCheckScore, markExerciseSolved, markTaskPassed } from './progress'

describe('backupFileName', () => {
  it('puts the date in the name', () => {
    // Months start at 0 in JavaScript, so 10 means November.
    expect(backupFileName(new Date(2026, 10, 18))).toBe('hakbang-progress-2026-11-18.json')
  })

  it('pads a single-digit month and day with a zero', () => {
    expect(backupFileName(new Date(2026, 0, 5))).toBe('hakbang-progress-2026-01-05.json')
  })

  it('starts with the prefix that .gitignore skips', () => {
    expect(backupFileName(new Date(2027, 11, 31))).toMatch(/^hakbang-progress-/)
  })
})

describe('parseBackupText', () => {
  it('round-trips: export then import gives the same progress', () => {
    let progress = emptyProgress()
    progress = markTaskPassed(progress, 'lesson-a')
    progress = markExerciseSolved(progress, 'lesson-a', 1)
    progress = markCheckScore(progress, 'lesson-a', 3)
    progress = markBugCheckPassed(progress, 'lesson-a')

    const result = parseBackupText(backupText(progress))

    expect(result).toEqual({ ok: true, progress })
  })

  it('accepts a backup with no lessons yet', () => {
    expect(parseBackupText(backupText(emptyProgress()))).toEqual({
      ok: true,
      progress: emptyProgress(),
    })
  })

  it('rejects text that is not JSON', () => {
    expect(parseBackupText('hello')).toEqual({ ok: false })
  })

  it('rejects an empty file', () => {
    expect(parseBackupText('')).toEqual({ ok: false })
  })

  it('rejects JSON that is not a Hakbang backup', () => {
    expect(parseBackupText('[]')).toEqual({ ok: false })
    expect(parseBackupText('null')).toEqual({ ok: false })
    expect(parseBackupText('{"name":"not a backup"}')).toEqual({ ok: false })
  })

  it('rejects an unknown schema version', () => {
    expect(parseBackupText('{"schemaVersion":99,"lessons":{}}')).toEqual({ ok: false })
  })

  it('rejects a backup whose lessons is not an object', () => {
    expect(parseBackupText('{"schemaVersion":1,"lessons":[]}')).toEqual({ ok: false })
    expect(parseBackupText('{"schemaVersion":1}')).toEqual({ ok: false })
  })

  it('keeps the good lessons and drops the bad entries', () => {
    const text = '{"schemaVersion":1,"lessons":{"a":{"taskPassed":true},"b":"junk"}}'
    expect(parseBackupText(text)).toEqual({
      ok: true,
      progress: { schemaVersion: 1, lessons: { a: { taskPassed: true } } },
    })
  })
})

import { describe, expect, it } from 'vitest'
import {
  PROGRESS_STORAGE_KEY,
  emptyProgress,
  isTaskPassed,
  loadProgress,
  markTaskPassed,
  parseProgress,
  saveProgress,
} from './progress'

function makeFakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  }
}

const blockedStorage = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

describe('emptyProgress', () => {
  it('gives a new object every time', () => {
    expect(emptyProgress()).not.toBe(emptyProgress())
  })
})

describe('parseProgress', () => {
  it('accepts good data', () => {
    const raw = { schemaVersion: 1, lessons: { 'lesson-a': { taskPassed: true } } }
    expect(parseProgress(raw)).toEqual(raw)
  })

  it('gives empty progress for data that is not an object', () => {
    for (const raw of [null, [], 42, 'text', undefined]) {
      expect(parseProgress(raw)).toEqual(emptyProgress())
    }
  })

  it('gives empty progress for a missing, wrong or future version', () => {
    expect(parseProgress({ lessons: {} })).toEqual(emptyProgress())
    expect(parseProgress({ schemaVersion: 0, lessons: {} })).toEqual(emptyProgress())
    expect(
      parseProgress({ schemaVersion: 2, lessons: { 'lesson-a': { taskPassed: true } } }),
    ).toEqual(emptyProgress())
  })

  it('gives empty progress when lessons is not an object', () => {
    expect(parseProgress({ schemaVersion: 1, lessons: [] })).toEqual(emptyProgress())
    expect(parseProgress({ schemaVersion: 1, lessons: 'x' })).toEqual(emptyProgress())
  })

  it('drops a broken lesson entry and keeps the good ones', () => {
    const raw = {
      schemaVersion: 1,
      lessons: {
        'lesson-a': { taskPassed: true },
        'lesson-b': { taskPassed: 'yes' },
        'lesson-c': null,
        'lesson-d': { taskPassed: false },
      },
    }
    expect(parseProgress(raw).lessons).toEqual({
      'lesson-a': { taskPassed: true },
      'lesson-d': { taskPassed: false },
    })
  })

  it('still loads old data that has only taskPassed', () => {
    const raw = { schemaVersion: 1, lessons: { 'lesson-a': { taskPassed: true } } }
    expect(parseProgress(raw).lessons['lesson-a']).toEqual({ taskPassed: true })
  })

  it('keeps all the new facts when they are valid', () => {
    const entry = {
      taskPassed: true,
      exerciseSolved: true,
      exerciseHintsUsed: 2,
      checkBestScore: 3,
      bugCheckPassed: false,
    }
    const raw = { schemaVersion: 1, lessons: { 'lesson-a': entry } }
    expect(parseProgress(raw).lessons['lesson-a']).toEqual(entry)
  })

  it('keeps an entry that has only one new fact', () => {
    const raw = { schemaVersion: 1, lessons: { 'lesson-a': { exerciseSolved: true } } }
    expect(parseProgress(raw).lessons['lesson-a']).toEqual({ exerciseSolved: true })
  })

  it('drops a bad checkBestScore but keeps the good fields next to it', () => {
    for (const bad of [5, -1, 1.5, '2', null, NaN]) {
      const raw = {
        schemaVersion: 1,
        lessons: { 'lesson-a': { taskPassed: true, checkBestScore: bad } },
      }
      expect(parseProgress(raw).lessons['lesson-a']).toEqual({ taskPassed: true })
    }
  })

  it('drops a bad exerciseHintsUsed but keeps the good fields next to it', () => {
    for (const bad of [4, -1, 0.5, '1', undefined]) {
      const raw = {
        schemaVersion: 1,
        lessons: { 'lesson-a': { exerciseSolved: true, exerciseHintsUsed: bad } },
      }
      expect(parseProgress(raw).lessons['lesson-a']).toEqual({ exerciseSolved: true })
    }
  })

  it('drops an entry whose only fields are bad', () => {
    const raw = {
      schemaVersion: 1,
      lessons: { 'lesson-a': { checkBestScore: 9, bugCheckPassed: 'yes' }, 'lesson-b': {} },
    }
    expect(parseProgress(raw).lessons).toEqual({})
  })

  it('drops entries that are not objects', () => {
    const raw = { schemaVersion: 1, lessons: { a: 'x', b: 5, c: [], d: null } }
    expect(parseProgress(raw).lessons).toEqual({})
  })

  it('ignores unknown extra fields', () => {
    const raw = {
      schemaVersion: 1,
      extra: 'hello',
      lessons: { 'lesson-a': { taskPassed: true, mood: 'happy' } },
    }
    expect(parseProgress(raw)).toEqual({
      schemaVersion: 1,
      lessons: { 'lesson-a': { taskPassed: true } },
    })
  })
})

describe('markTaskPassed and isTaskPassed', () => {
  it('marks a lesson as passed', () => {
    const progress = markTaskPassed(emptyProgress(), 'lesson-a')
    expect(isTaskPassed(progress, 'lesson-a')).toBe(true)
    expect(isTaskPassed(progress, 'lesson-b')).toBe(false)
  })

  it('does not change the progress it was given', () => {
    const before = emptyProgress()
    markTaskPassed(before, 'lesson-a')
    expect(before).toEqual(emptyProgress())
  })

  it('keeps other lessons untouched', () => {
    const first = markTaskPassed(emptyProgress(), 'lesson-a')
    const second = markTaskPassed(first, 'lesson-b')
    expect(isTaskPassed(second, 'lesson-a')).toBe(true)
    expect(isTaskPassed(second, 'lesson-b')).toBe(true)
  })

  it('gives the same result when called twice', () => {
    const once = markTaskPassed(emptyProgress(), 'lesson-a')
    expect(markTaskPassed(once, 'lesson-a')).toEqual(once)
  })

  it('keeps the other facts of the same lesson', () => {
    const before = { schemaVersion: 1, lessons: { 'lesson-a': { checkBestScore: 2 } } }
    expect(markTaskPassed(before, 'lesson-a').lessons['lesson-a']).toEqual({
      checkBestScore: 2,
      taskPassed: true,
    })
  })
})

describe('loadProgress and saveProgress', () => {
  it('is empty when nothing is saved', () => {
    expect(loadProgress(makeFakeStorage())).toEqual(emptyProgress())
  })

  it('returns what was saved, under the hakbang-progress key', () => {
    const storage = makeFakeStorage()
    const progress = markTaskPassed(emptyProgress(), 'lesson-a')
    saveProgress(storage, progress)
    expect(PROGRESS_STORAGE_KEY).toBe('hakbang-progress')
    expect(storage.data[PROGRESS_STORAGE_KEY]).toBeDefined()
    expect(loadProgress(storage)).toEqual(progress)
  })

  it('is empty when the saved text is not valid JSON', () => {
    const storage = makeFakeStorage({ [PROGRESS_STORAGE_KEY]: '{oops' })
    expect(loadProgress(storage)).toEqual(emptyProgress())
  })

  it('does not write anything while loading', () => {
    const storage = makeFakeStorage({ [PROGRESS_STORAGE_KEY]: '{"schemaVersion":2}' })
    loadProgress(storage)
    expect(storage.data[PROGRESS_STORAGE_KEY]).toBe('{"schemaVersion":2}')
  })

  it('does not crash when storage is blocked', () => {
    expect(loadProgress(blockedStorage)).toEqual(emptyProgress())
    expect(() => saveProgress(blockedStorage, emptyProgress())).not.toThrow()
  })
})

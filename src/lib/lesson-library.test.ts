import { describe, expect, it } from 'vitest'
import unit01 from '../../content/lessons/unit-01-how-web-apps-work.json'
import { listBundledLessonFiles, loadLessonLibrary } from './lesson-library'

describe('loadLessonLibrary', () => {
  it('returns nothing when there are no files', () => {
    expect(loadLessonLibrary({})).toEqual({})
  })

  it('keys a lesson by its file name, without the folder and without .json', () => {
    const library = loadLessonLibrary({ '../../content/lessons/unit-01-a.json': unit01 })
    expect(Object.keys(library)).toEqual(['unit-01-a'])
    expect(library['unit-01-a'].ok).toBe(true)
  })

  it('keeps a broken file as a rejected result and does not crash', () => {
    const library = loadLessonLibrary({
      '../../content/lessons/good.json': unit01,
      '../../content/lessons/broken.json': { schemaVersion: 1 },
      '../../content/lessons/not-a-lesson.json': null,
    })
    expect(library.good.ok).toBe(true)
    expect(library.broken.ok).toBe(false)
    expect(library['not-a-lesson']).toEqual({
      ok: false,
      errors: [{ path: '', code: 'not-an-object' }],
    })
  })

  it('keeps two files that share the same id inside', () => {
    const library = loadLessonLibrary({
      '../../content/lessons/first.json': unit01,
      '../../content/lessons/second.json': unit01,
    })
    expect(Object.keys(library).sort()).toEqual(['first', 'second'])
  })
})

describe('the real lesson files', () => {
  const library = loadLessonLibrary(listBundledLessonFiles())

  it('finds Unit 1 and reads its data, not a module wrapper', () => {
    expect(library['unit-01-how-web-apps-work']?.ok).toBe(true)
  })

  it('every lesson file is valid', () => {
    for (const [name, result] of Object.entries(library)) {
      expect(result.ok, `${name} was rejected`).toBe(true)
    }
  })

  // Progress is saved by lesson id, so the id must match the file name and never change.
  it('every lesson id is the same as its file name', () => {
    for (const [name, result] of Object.entries(library)) {
      if (result.ok) {
        expect(result.lesson.id).toBe(name)
      }
    }
  })
})

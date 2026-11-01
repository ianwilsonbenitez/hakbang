import { describe, expect, it } from 'vitest'
import unit01 from '../../content/lessons/unit-01-how-web-apps-work.json'
import { validateLesson, type LessonError } from './lesson'

// A fresh copy each time, so one test never changes the lesson used by another.
// `any` is on purpose: tests need to break the lesson in ways the types would forbid.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeLesson(): Record<string, any> {
  return structuredClone(unit01)
}

function errorsFor(data: unknown): LessonError[] {
  const result = validateLesson(data)
  if (result.ok) {
    throw new Error('Expected the lesson to be rejected')
  }
  return result.errors
}

describe('validateLesson: good files', () => {
  it('accepts the real Unit 1 lesson', () => {
    const result = validateLesson(makeLesson())
    expect(result.ok).toBe(true)
  })

  it('accepts a lesson without the optional parts', () => {
    const lesson = makeLesson()
    delete lesson.exercise
    delete lesson.bugCheck
    delete lesson.glossary
    delete lesson.tracer
    expect(validateLesson(lesson).ok).toBe(true)
  })
})

describe('validateLesson: broken files', () => {
  it('rejects things that are not a lesson object', () => {
    for (const bad of [null, 'text', 42, [], undefined]) {
      expect(errorsFor(bad)).toEqual([{ path: '', code: 'not-an-object' }])
    }
  })

  it('rejects an unsupported schemaVersion', () => {
    const lesson = makeLesson()
    lesson.schemaVersion = 2
    expect(errorsFor(lesson)).toContainEqual({
      path: 'schemaVersion',
      code: 'unsupported-version',
    })
  })

  it('rejects a missing required part', () => {
    const lesson = makeLesson()
    delete lesson.task
    expect(errorsFor(lesson)).toContainEqual({ path: 'task', code: 'missing' })
  })

  it('rejects text with no Taglish', () => {
    const lesson = makeLesson()
    delete lesson.title.tl
    expect(errorsFor(lesson)).toContainEqual({ path: 'title.tl', code: 'missing-tl' })
  })

  it('rejects text with no English', () => {
    const lesson = makeLesson()
    delete lesson.explain[1].en
    expect(errorsFor(lesson)).toContainEqual({ path: 'explain[1].en', code: 'missing-en' })
  })

  it('rejects empty text', () => {
    const lesson = makeLesson()
    lesson.task.why.en = '   '
    expect(errorsFor(lesson)).toContainEqual({ path: 'task.why.en', code: 'empty-text' })
  })

  it('rejects the wrong number of explain paragraphs', () => {
    const lesson = makeLesson()
    lesson.explain = []
    expect(errorsFor(lesson)).toContainEqual({ path: 'explain', code: 'wrong-count' })
    lesson.explain = Array(5).fill(unit01.explain[0])
    expect(errorsFor(lesson)).toContainEqual({ path: 'explain', code: 'wrong-count' })
  })

  it('rejects options outside 2 to 4', () => {
    const lesson = makeLesson()
    lesson.task.options = lesson.task.options.slice(0, 1)
    expect(errorsFor(lesson)).toContainEqual({ path: 'task.options', code: 'wrong-count' })
  })

  it('rejects an answer that matches no option', () => {
    const lesson = makeLesson()
    lesson.check[2].answer = 'z'
    expect(errorsFor(lesson)).toContainEqual({
      path: 'check[2].answer',
      code: 'answer-not-in-options',
    })
  })

  it('rejects a check that is not exactly 3 questions', () => {
    const lesson = makeLesson()
    lesson.check.pop()
    expect(errorsFor(lesson)).toContainEqual({ path: 'check', code: 'wrong-count' })
  })

  it('rejects hints that are not exactly 3', () => {
    const lesson = makeLesson()
    lesson.exercise.hints.pop()
    expect(errorsFor(lesson)).toContainEqual({ path: 'exercise.hints', code: 'wrong-count' })
  })

  it('rejects an exercise with no accepted answers', () => {
    const lesson = makeLesson()
    lesson.exercise.acceptedAnswers = []
    expect(errorsFor(lesson)).toContainEqual({
      path: 'exercise.acceptedAnswers',
      code: 'wrong-count',
    })
  })

  it('rejects a bugLine outside the code', () => {
    const lesson = makeLesson()
    lesson.bugCheck.bugLine = 99
    expect(errorsFor(lesson)).toContainEqual({
      path: 'bugCheck.bugLine',
      code: 'line-out-of-range',
    })
    lesson.bugCheck.bugLine = 0
    expect(errorsFor(lesson)).toContainEqual({
      path: 'bugCheck.bugLine',
      code: 'line-out-of-range',
    })
  })

  it('rejects code that is 15 lines or longer', () => {
    const lesson = makeLesson()
    lesson.tracer.code = Array(15).fill('x').join('\n')
    expect(errorsFor(lesson)).toContainEqual({ path: 'tracer.code', code: 'code-too-long' })
  })

  it('rejects tracer lines outside the code', () => {
    const lesson = makeLesson()
    lesson.tracer.steps[0].line = 50
    lesson.tracer.steps[1].skippedLines = [50]
    const errors = errorsFor(lesson)
    expect(errors).toContainEqual({ path: 'tracer.steps[0].line', code: 'line-out-of-range' })
    expect(errors).toContainEqual({
      path: 'tracer.steps[1].skippedLines[0]',
      code: 'line-out-of-range',
    })
  })

  it('rejects tracer variable values that are not text', () => {
    const lesson = makeLesson()
    lesson.tracer.steps[0].vars.hoursAhead = 6
    expect(errorsFor(lesson)).toContainEqual({
      path: 'tracer.steps[0].vars.hoursAhead',
      code: 'wrong-type',
    })
  })

  it('reports every problem at once, not only the first', () => {
    const lesson = makeLesson()
    delete lesson.title.tl
    lesson.check[0].answer = 'z'
    lesson.bugCheck.bugLine = 99
    expect(errorsFor(lesson)).toHaveLength(3)
  })
})

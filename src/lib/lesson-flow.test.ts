import { describe, expect, it } from 'vitest'
import { getLessonSteps, isCorrectAnswer, nextStep, previousStep } from './lesson-flow'

const allParts = { hasTracer: true, hasExercise: true, hasBugCheck: true }
const noParts = { hasTracer: false, hasExercise: false, hasBugCheck: false }

describe('getLessonSteps', () => {
  it('gives all seven steps in order for a lesson with every part', () => {
    expect(getLessonSteps(allParts)).toEqual([
      'picture',
      'explain',
      'task',
      'trace',
      'build',
      'check',
      'debug',
    ])
  })

  it('gives only the four basic steps when there are no optional parts', () => {
    expect(getLessonSteps(noParts)).toEqual(['picture', 'explain', 'task', 'check'])
  })

  it('leaves out only the steps the lesson does not have', () => {
    expect(getLessonSteps({ ...noParts, hasTracer: true })).toEqual([
      'picture',
      'explain',
      'task',
      'trace',
      'check',
    ])
    expect(getLessonSteps({ ...noParts, hasExercise: true })).toEqual([
      'picture',
      'explain',
      'task',
      'build',
      'check',
    ])
    expect(getLessonSteps({ ...noParts, hasBugCheck: true })).toEqual([
      'picture',
      'explain',
      'task',
      'check',
      'debug',
    ])
  })
})

describe('nextStep', () => {
  const steps = getLessonSteps(noParts)

  it('goes forward one step at a time', () => {
    expect(nextStep(steps, 'picture')).toBe('explain')
    expect(nextStep(steps, 'task')).toBe('check')
  })

  it('stays on the last step of a short list', () => {
    expect(nextStep(steps, 'check')).toBe('check')
  })
})

describe('previousStep', () => {
  const steps = getLessonSteps(allParts)

  it('goes back one step at a time', () => {
    expect(previousStep(steps, 'debug')).toBe('check')
    expect(previousStep(steps, 'explain')).toBe('picture')
  })

  it('stays on the first step when going back', () => {
    expect(previousStep(steps, 'picture')).toBe('picture')
  })
})

describe('isCorrectAnswer', () => {
  const choice = { answer: 'b' }

  it('is true only for the right option', () => {
    expect(isCorrectAnswer(choice, 'b')).toBe(true)
    expect(isCorrectAnswer(choice, 'a')).toBe(false)
  })

  it('is false when nothing is selected', () => {
    expect(isCorrectAnswer(choice, null)).toBe(false)
  })
})

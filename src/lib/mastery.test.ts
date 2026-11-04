import { describe, expect, it } from 'vitest'
import { CHECK_PASS_SCORE, getMastery, isFinished } from './mastery'

const fullLesson = { hasExercise: true, hasBugCheck: true }
const plainLesson = { hasExercise: false, hasBugCheck: false }

describe('getMastery', () => {
  it('gives no pips when nothing is saved', () => {
    const none = { understands: false, builds: false, debugs: false }
    expect(getMastery(undefined, fullLesson)).toEqual(none)
    expect(getMastery(undefined, plainLesson)).toEqual(none)
    expect(getMastery({}, fullLesson)).toEqual(none)
  })

  it('gives Level 1 when only the task is passed', () => {
    expect(getMastery({ taskPassed: true }, fullLesson)).toEqual({
      understands: true,
      builds: false,
      debugs: false,
    })
  })

  it('gives Level 2 when the exercise is solved', () => {
    const entry = { taskPassed: true, exerciseSolved: true }
    expect(getMastery(entry, fullLesson)).toEqual({
      understands: true,
      builds: true,
      debugs: false,
    })
  })

  it('does not give Level 2 when the exercise is not solved, even if hints were used', () => {
    const entry = { taskPassed: true, exerciseSolved: false, exerciseHintsUsed: 3 }
    expect(getMastery(entry, fullLesson).builds).toBe(false)
  })

  it('gives Level 3 when the check score reaches the pass mark and the bug check is right', () => {
    const entry = { checkBestScore: CHECK_PASS_SCORE, bugCheckPassed: true }
    expect(getMastery(entry, fullLesson).debugs).toBe(true)
  })

  it('does not give Level 3 when the check score is below the pass mark', () => {
    const entry = { checkBestScore: CHECK_PASS_SCORE - 1, bugCheckPassed: true }
    expect(getMastery(entry, fullLesson).debugs).toBe(false)
  })

  it('does not give Level 3 when the bug check is wrong or missing', () => {
    expect(getMastery({ checkBestScore: 3, bugCheckPassed: false }, fullLesson).debugs).toBe(false)
    expect(getMastery({ checkBestScore: 3 }, fullLesson).debugs).toBe(false)
  })

  it('treats a lesson without an exercise as met once the task is passed', () => {
    expect(getMastery({ taskPassed: true }, { hasExercise: false, hasBugCheck: true }).builds).toBe(
      true,
    )
  })

  it('treats a lesson without a bug check as met, so the check score alone is enough', () => {
    const lesson = { hasExercise: true, hasBugCheck: false }
    expect(getMastery({ checkBestScore: 2 }, lesson).debugs).toBe(true)
  })
})

describe('isFinished', () => {
  it('is true only when all three pips are on', () => {
    const entry = {
      taskPassed: true,
      exerciseSolved: true,
      checkBestScore: 3,
      bugCheckPassed: true,
    }
    expect(isFinished(getMastery(entry, fullLesson))).toBe(true)
  })

  it('is false when one pip is missing', () => {
    const entry = { taskPassed: true, exerciseSolved: true, checkBestScore: 1, bugCheckPassed: true }
    expect(isFinished(getMastery(entry, fullLesson))).toBe(false)
  })

  it('is false for a lesson with no saved data', () => {
    expect(isFinished(getMastery(undefined, plainLesson))).toBe(false)
  })
})

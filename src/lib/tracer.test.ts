import { describe, expect, it } from 'vitest'
import { getVarRows, isLastStep, isLineSkipped, nextStepIndex, previousStepIndex } from './tracer'

describe('nextStepIndex', () => {
  it('moves forward one step', () => {
    expect(nextStepIndex(0, 3)).toBe(1)
    expect(nextStepIndex(1, 3)).toBe(2)
  })

  it('stops at the last step', () => {
    expect(nextStepIndex(2, 3)).toBe(2)
  })
})

describe('previousStepIndex', () => {
  it('moves back one step', () => {
    expect(previousStepIndex(2)).toBe(1)
    expect(previousStepIndex(1)).toBe(0)
  })

  it('stops at the first step', () => {
    expect(previousStepIndex(0)).toBe(0)
  })
})

describe('isLastStep', () => {
  it('is false before the last step', () => {
    expect(isLastStep(0, 3)).toBe(false)
    expect(isLastStep(1, 3)).toBe(false)
  })

  it('is true on the last step', () => {
    expect(isLastStep(2, 3)).toBe(true)
  })
})

describe('isLineSkipped', () => {
  it('is true for a line in skippedLines', () => {
    expect(isLineSkipped({ skippedLines: [3, 4] }, 3)).toBe(true)
  })

  it('is false for a line not in skippedLines', () => {
    expect(isLineSkipped({ skippedLines: [3] }, 2)).toBe(false)
  })

  it('is false when the step has no skippedLines', () => {
    expect(isLineSkipped({}, 3)).toBe(false)
  })
})

describe('getVarRows', () => {
  it('gives one row for each variable, in order', () => {
    expect(getVarRows({ hoursAhead: '6', result: 'true' })).toEqual([
      { name: 'hoursAhead', value: '6' },
      { name: 'result', value: 'true' },
    ])
  })

  it('gives no rows when nothing is remembered yet', () => {
    expect(getVarRows({})).toEqual([])
  })
})

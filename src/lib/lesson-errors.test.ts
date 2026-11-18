import { describe, expect, it } from 'vitest'
import { formatLessonError, limitErrors } from './lesson-errors'

describe('formatLessonError', () => {
  it('puts the path before the message', () => {
    expect(
      formatLessonError({ path: 'check[1].answer', code: 'answer-not-in-options' }, 'bad answer'),
    ).toBe('check[1].answer: bad answer')
  })

  it('shows only the message when the problem is the whole file', () => {
    expect(formatLessonError({ path: '', code: 'not-an-object' }, 'not a lesson')).toBe('not a lesson')
  })
})

describe('limitErrors', () => {
  it('keeps all errors when there are few', () => {
    expect(limitErrors([1, 2, 3], 5)).toEqual({ shown: [1, 2, 3], hiddenCount: 0 })
  })

  it('keeps all errors when there are exactly the maximum', () => {
    expect(limitErrors([1, 2, 3, 4, 5], 5)).toEqual({ shown: [1, 2, 3, 4, 5], hiddenCount: 0 })
  })

  it('shows the first ones and counts the rest', () => {
    expect(limitErrors([1, 2, 3, 4, 5, 6, 7], 5)).toEqual({ shown: [1, 2, 3, 4, 5], hiddenCount: 2 })
  })

  it('handles an empty list', () => {
    expect(limitErrors([], 5)).toEqual({ shown: [], hiddenCount: 0 })
  })

  it('does not change the list it was given', () => {
    const errors = [1, 2, 3, 4, 5, 6]
    limitErrors(errors, 2)
    expect(errors).toEqual([1, 2, 3, 4, 5, 6])
  })
})

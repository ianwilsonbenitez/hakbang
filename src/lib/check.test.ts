import { describe, expect, it } from 'vitest'
import { scoreCheck } from './check'

const questions = [{ answer: 'a' }, { answer: 'b' }, { answer: 'c' }]

describe('scoreCheck', () => {
  it('counts all right', () => {
    expect(scoreCheck(questions, ['a', 'b', 'c'])).toEqual({ right: 3, wrong: 0, total: 3 })
  })

  it('counts right and wrong separately', () => {
    expect(scoreCheck(questions, ['a', 'x', 'c'])).toEqual({ right: 2, wrong: 1, total: 3 })
  })

  it('counts all wrong', () => {
    expect(scoreCheck(questions, ['b', 'c', 'a'])).toEqual({ right: 0, wrong: 3, total: 3 })
  })

  it('counts an unanswered question as wrong', () => {
    expect(scoreCheck(questions, ['a', null, 'c'])).toEqual({ right: 2, wrong: 1, total: 3 })
  })

  it('counts missing answers as wrong when the answers list is too short', () => {
    expect(scoreCheck(questions, ['a'])).toEqual({ right: 1, wrong: 2, total: 3 })
  })
})

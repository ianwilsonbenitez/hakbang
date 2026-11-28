import { describe, expect, it } from 'vitest'
import {
  MAX_HINTS,
  answerToShow,
  canUnlockMoreHints,
  isAcceptedAnswer,
  normalizeAnswer,
  splitAtBlank,
  unlockNextHint,
  visibleHints,
} from './exercise'

const hints = [
  { en: 'one', tl: 'isa' },
  { en: 'two', tl: 'dalawa' },
  { en: 'three', tl: 'tatlo' },
]

describe('normalizeAnswer', () => {
  it('trims the ends and squeezes repeated spaces', () => {
    expect(normalizeAnswer('  result.verified   ===  true ')).toBe('result.verified === true')
  })
})

describe('isAcceptedAnswer', () => {
  const accepted = ['result.verified === true', 'result.verified == true']

  it('accepts a listed answer', () => {
    expect(isAcceptedAnswer(accepted, 'result.verified === true')).toBe(true)
  })

  it('accepts another listed answer', () => {
    expect(isAcceptedAnswer(accepted, 'result.verified == true')).toBe(true)
  })

  it('accepts extra spaces around and inside', () => {
    expect(isAcceptedAnswer(accepted, '  result.verified  ===   true  ')).toBe(true)
  })

  it('rejects a wrong answer', () => {
    expect(isAcceptedAnswer(accepted, 'result.verified = true')).toBe(false)
  })

  it('rejects an empty answer', () => {
    expect(isAcceptedAnswer(accepted, '   ')).toBe(false)
  })
})

describe('unlockNextHint', () => {
  it('unlocks hints in order 0 -> 1 -> 2 -> 3', () => {
    expect(unlockNextHint(0)).toBe(1)
    expect(unlockNextHint(1)).toBe(2)
    expect(unlockNextHint(2)).toBe(3)
  })

  it('stops at the last hint', () => {
    expect(unlockNextHint(MAX_HINTS)).toBe(MAX_HINTS)
  })
})

describe('visibleHints', () => {
  it('shows nothing before any hint is unlocked', () => {
    expect(visibleHints(hints, 0)).toEqual([])
  })

  it('shows hint 1 first, then 1 and 2, then all three', () => {
    expect(visibleHints(hints, 1)).toEqual([hints[0]])
    expect(visibleHints(hints, 2)).toEqual([hints[0], hints[1]])
    expect(visibleHints(hints, 3)).toEqual(hints)
  })
})

describe('canUnlockMoreHints', () => {
  it('is true until all three are used', () => {
    expect(canUnlockMoreHints(0)).toBe(true)
    expect(canUnlockMoreHints(2)).toBe(true)
    expect(canUnlockMoreHints(3)).toBe(false)
  })
})

describe('splitAtBlank', () => {
  it('cuts the code into the part before and after the blank', () => {
    expect(splitAtBlank('if (____) {')).toEqual({ before: 'if (', after: ') {' })
  })

  it('works when the blank is at the very start', () => {
    expect(splitAtBlank('____ + 1')).toEqual({ before: '', after: ' + 1' })
  })

  it('keeps new lines on both sides', () => {
    expect(splitAtBlank('a\n  return ____;\n}')).toEqual({
      before: 'a\n  return ',
      after: ';\n}',
    })
  })

  it('returns null when there is no blank', () => {
    expect(splitAtBlank('return true;')).toBeNull()
  })
})

describe('answerToShow', () => {
  const answers = ['result.verified === true', 'result.verified == true']

  it('shows the learner\'s own answer, cleaned, right after solving', () => {
    expect(answerToShow(true, '  result.verified  ==  true ', answers)).toBe(
      'result.verified == true',
    )
  })

  it('shows the first accepted answer when the app was reopened', () => {
    expect(answerToShow(false, '', answers)).toBe('result.verified === true')
  })
})

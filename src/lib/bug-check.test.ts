import { describe, expect, it } from 'vitest'
import { addWrongLine, getCodeLines, isBugLine } from './bug-check'

describe('addWrongLine', () => {
  it('adds a new wrong line to the list', () => {
    expect(addWrongLine([], 3)).toEqual([3])
    expect(addWrongLine([3], 1)).toEqual([3, 1])
  })

  it('does not add the same wrong line twice', () => {
    expect(addWrongLine([3, 1], 3)).toEqual([3, 1])
  })

  it('does not change the list that was passed in', () => {
    const before = [3]
    addWrongLine(before, 1)
    expect(before).toEqual([3])
  })
})

describe('getCodeLines', () => {
  it('gives one entry for each line of code', () => {
    const code = 'function a() {\n  return 1\n}'
    expect(getCodeLines(code)).toEqual(['function a() {', '  return 1', '}'])
  })

  it('gives one entry for code with a single line', () => {
    expect(getCodeLines('let x = 1')).toEqual(['let x = 1'])
  })
})

describe('isBugLine', () => {
  it('is true when the tapped line is the bug line', () => {
    expect(isBugLine(2, 2)).toBe(true)
  })

  it('is false when another line is tapped', () => {
    expect(isBugLine(2, 1)).toBe(false)
    expect(isBugLine(2, 3)).toBe(false)
  })
})

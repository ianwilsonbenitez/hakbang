import { describe, expect, it } from 'vitest'
import { shuffle } from './shuffle'

describe('shuffle', () => {
  it('keeps the same items, only the order can change', () => {
    const result = shuffle(['a', 'b', 'c', 'd'], Math.random)
    expect([...result].sort()).toEqual(['a', 'b', 'c', 'd'])
  })

  it('does not change the list that was passed in', () => {
    const before = ['a', 'b', 'c']
    shuffle(before, Math.random)
    expect(before).toEqual(['a', 'b', 'c'])
  })

  it('gives a known order when random always returns 0', () => {
    // i=2: swap with index 0 -> c b a; i=1: swap with index 0 -> b c a
    expect(shuffle(['a', 'b', 'c'], () => 0)).toEqual(['b', 'c', 'a'])
  })

  it('keeps the order when random always picks the last position', () => {
    expect(shuffle(['a', 'b', 'c'], () => 0.999)).toEqual(['a', 'b', 'c'])
  })

  it('returns an empty list and a one-item list as they are', () => {
    expect(shuffle([], Math.random)).toEqual([])
    expect(shuffle(['a'], Math.random)).toEqual(['a'])
  })
})

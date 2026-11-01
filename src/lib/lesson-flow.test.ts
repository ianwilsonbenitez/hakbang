import { describe, expect, it } from 'vitest'
import { isCorrectAnswer, nextStep, previousStep } from './lesson-flow'

describe('lesson steps', () => {
  it('goes forward Picture → Explain → Try it', () => {
    expect(nextStep('picture')).toBe('explain')
    expect(nextStep('explain')).toBe('try')
  })

  it('stays on the last step when going forward', () => {
    expect(nextStep('try')).toBe('try')
  })

  it('goes back one step at a time', () => {
    expect(previousStep('try')).toBe('explain')
    expect(previousStep('explain')).toBe('picture')
  })

  it('stays on the first step when going back', () => {
    expect(previousStep('picture')).toBe('picture')
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

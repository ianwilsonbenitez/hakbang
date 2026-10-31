import { describe, expect, it } from 'vitest'
import { strings } from './strings'

describe('strings', () => {
  it('has the same keys in English and Taglish', () => {
    expect(Object.keys(strings.tl).sort()).toEqual(Object.keys(strings.en).sort())
  })

  it('has no empty text in either language', () => {
    for (const language of ['en', 'tl'] as const) {
      for (const [key, value] of Object.entries(strings[language])) {
        expect(value.trim(), `${language}.${key}`).not.toBe('')
      }
    }
  })
})

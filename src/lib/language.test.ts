import { describe, expect, it } from 'vitest'
import {
  LANGUAGE_STORAGE_KEY,
  htmlLangFor,
  loadLanguage,
  parseLanguage,
  pick,
  saveLanguage,
  toggleLanguage,
} from './language'

function makeFakeStorage(initial: Record<string, string> = {}) {
  const data = { ...initial }
  return {
    data,
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value
    },
  }
}

const blockedStorage = {
  getItem: () => {
    throw new Error('blocked')
  },
  setItem: () => {
    throw new Error('blocked')
  },
}

describe('parseLanguage', () => {
  it('accepts tl', () => {
    expect(parseLanguage('tl')).toBe('tl')
  })

  it('falls back to English for missing or unknown values', () => {
    expect(parseLanguage(null)).toBe('en')
    expect(parseLanguage('en')).toBe('en')
    expect(parseLanguage('fr')).toBe('en')
  })
})

describe('toggleLanguage', () => {
  it('switches between English and Taglish', () => {
    expect(toggleLanguage('en')).toBe('tl')
    expect(toggleLanguage('tl')).toBe('en')
  })
})

describe('pick', () => {
  const text = { en: 'Hello', tl: 'Kumusta' }

  it('returns the text in the chosen language', () => {
    expect(pick(text, 'en')).toBe('Hello')
    expect(pick(text, 'tl')).toBe('Kumusta')
  })
})

describe('htmlLangFor', () => {
  it('gives a valid html lang code for each language', () => {
    expect(htmlLangFor('en')).toBe('en')
    expect(htmlLangFor('tl')).toBe('fil')
  })
})

describe('loadLanguage and saveLanguage', () => {
  it('defaults to English when nothing is saved', () => {
    expect(loadLanguage(makeFakeStorage())).toBe('en')
  })

  it('returns what was saved', () => {
    const storage = makeFakeStorage()
    saveLanguage(storage, 'tl')
    expect(storage.data[LANGUAGE_STORAGE_KEY]).toBe('tl')
    expect(loadLanguage(storage)).toBe('tl')
  })

  it('does not crash when storage is blocked', () => {
    expect(loadLanguage(blockedStorage)).toBe('en')
    expect(() => saveLanguage(blockedStorage, 'tl')).not.toThrow()
  })
})

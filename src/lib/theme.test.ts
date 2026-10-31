import { describe, expect, it } from 'vitest'
import {
  THEME_STORAGE_KEY,
  loadTheme,
  parseTheme,
  saveTheme,
  toggleTheme,
} from './theme'

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

describe('parseTheme', () => {
  it('accepts light', () => {
    expect(parseTheme('light')).toBe('light')
  })

  it('falls back to dark for missing or unknown values', () => {
    expect(parseTheme(null)).toBe('dark')
    expect(parseTheme('dark')).toBe('dark')
    expect(parseTheme('purple')).toBe('dark')
  })
})

describe('toggleTheme', () => {
  it('switches between dark and light', () => {
    expect(toggleTheme('dark')).toBe('light')
    expect(toggleTheme('light')).toBe('dark')
  })
})

describe('loadTheme and saveTheme', () => {
  it('defaults to dark when nothing is saved', () => {
    expect(loadTheme(makeFakeStorage())).toBe('dark')
  })

  it('returns what was saved', () => {
    const storage = makeFakeStorage()
    saveTheme(storage, 'light')
    expect(storage.data[THEME_STORAGE_KEY]).toBe('light')
    expect(loadTheme(storage)).toBe('light')
  })

  it('does not crash when storage is blocked', () => {
    expect(loadTheme(blockedStorage)).toBe('dark')
    expect(() => saveTheme(blockedStorage, 'light')).not.toThrow()
  })
})

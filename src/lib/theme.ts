export type Theme = 'dark' | 'light'

export const THEME_STORAGE_KEY = 'hakbang-theme'

// Only the two methods we use, so tests can pass a tiny fake instead of real localStorage.
type ThemeStorage = Pick<Storage, 'getItem' | 'setItem'>

// Anything that is not exactly "light" becomes dark, so a broken saved value cannot break the app.
export function parseTheme(value: string | null): Theme {
  return value === 'light' ? 'light' : 'dark'
}

export function toggleTheme(theme: Theme): Theme {
  return theme === 'dark' ? 'light' : 'dark'
}

export function loadTheme(storage: ThemeStorage): Theme {
  try {
    return parseTheme(storage.getItem(THEME_STORAGE_KEY))
  } catch {
    // Browsers can block storage (private mode); fall back to the default.
    return 'dark'
  }
}

export function saveTheme(storage: ThemeStorage, theme: Theme): void {
  try {
    storage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Not saving is fine; the theme still works until the page closes.
  }
}

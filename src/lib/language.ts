export type Language = 'en' | 'tl'

// The shape every learner-facing text has in lesson files: { "en": "...", "tl": "..." }
export type LocalizedText = Record<Language, string>

export const LANGUAGE_STORAGE_KEY = 'hakbang-language'

// Only the two methods we use, so tests can pass a tiny fake instead of real localStorage.
type LanguageStorage = Pick<Storage, 'getItem' | 'setItem'>

// Anything that is not exactly "tl" becomes English, so a broken saved value cannot break the app.
export function parseLanguage(value: string | null): Language {
  return value === 'tl' ? 'tl' : 'en'
}

export function toggleLanguage(language: Language): Language {
  return language === 'en' ? 'tl' : 'en'
}

export function pick(text: LocalizedText, language: Language): string {
  return text[language]
}

// Taglish has no official language code; "fil" (Filipino) is the closest one for screen readers.
export function htmlLangFor(language: Language): string {
  return language === 'tl' ? 'fil' : 'en'
}

export function loadLanguage(storage: LanguageStorage): Language {
  try {
    return parseLanguage(storage.getItem(LANGUAGE_STORAGE_KEY))
  } catch {
    // Browsers can block storage (private mode); fall back to the default.
    return 'en'
  }
}

export function saveLanguage(storage: LanguageStorage, language: Language): void {
  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, language)
  } catch {
    // Not saving is fine; the language still works until the page closes.
  }
}

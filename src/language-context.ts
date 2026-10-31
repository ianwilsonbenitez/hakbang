import { createContext, useContext } from 'react'
import type { Strings } from './i18n/strings'
import type { Language } from './lib/language'

export type LanguageContextValue = {
  language: Language
  t: Strings
  switchLanguage: () => void
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

// Any screen calls this to get the current language and its texts: const { t } = useLanguage()
export function useLanguage(): LanguageContextValue {
  const value = useContext(LanguageContext)
  if (value === null) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return value
}

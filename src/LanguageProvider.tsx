import { useLayoutEffect, useState, type ReactNode } from 'react'
import { strings } from './i18n/strings'
import { LanguageContext } from './language-context'
import {
  htmlLangFor,
  loadLanguage,
  saveLanguage,
  toggleLanguage,
} from './lib/language'

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState(() => loadLanguage(localStorage))

  // Runs before the browser paints, so a saved Taglish choice does not flash English first.
  useLayoutEffect(() => {
    document.documentElement.lang = htmlLangFor(language)
    saveLanguage(localStorage, language)
  }, [language])

  const value = {
    language,
    t: strings[language],
    switchLanguage: () => setLanguage(toggleLanguage(language)),
  }

  return <LanguageContext value={value}>{children}</LanguageContext>
}

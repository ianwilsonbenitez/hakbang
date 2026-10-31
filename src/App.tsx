import { useLayoutEffect, useState } from 'react'
import { useLanguage } from './language-context'
import { loadTheme, saveTheme, toggleTheme } from './lib/theme'

const buttonClass =
  'min-h-11 rounded-md border border-border-strong bg-surface px-4 font-semibold text-accent'

function App() {
  const { t, switchLanguage } = useLanguage()
  const [theme, setTheme] = useState(() => loadTheme(localStorage))

  // Runs before the browser paints, so a saved light theme does not flash dark first.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    saveTheme(localStorage, theme)
  }, [theme])

  const themeName = theme === 'dark' ? t.themeDark : t.themeLight

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">{t.appName}</h1>
      <p className="mt-2 text-text-muted">
        {t.themeLabel}: {themeName}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setTheme(toggleTheme(theme))}
          className={buttonClass}
        >
          {t.switchTheme}
        </button>
        <button type="button" onClick={switchLanguage} className={buttonClass}>
          {t.switchLanguage}
        </button>
      </div>
    </main>
  )
}

export default App

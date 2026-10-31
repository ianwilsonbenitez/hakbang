import { useLayoutEffect, useState } from 'react'
import { loadTheme, saveTheme, toggleTheme } from './lib/theme'

function App() {
  const [theme, setTheme] = useState(() => loadTheme(localStorage))

  // Runs before the browser paints, so a saved light theme does not flash dark first.
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    saveTheme(localStorage, theme)
  }, [theme])

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">Hakbang</h1>
      <p className="mt-2 text-text-muted">Theme: {theme}</p>
      {/* TEMPORARY text: moves into the language files in Task 3 */}
      <button
        type="button"
        onClick={() => setTheme(toggleTheme(theme))}
        className="mt-4 min-h-11 rounded-md border border-border-strong bg-surface px-4 font-semibold text-accent"
      >
        Switch theme
      </button>
    </main>
  )
}

export default App

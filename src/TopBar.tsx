import { useLanguage } from './language-context'

type TopBarProps = {
  themeName: string
  onSwitchTheme: () => void
}

const switchClass =
  'min-h-11 rounded-md border border-border-strong bg-surface px-3 text-sm font-semibold text-accent'

// App name on the left, the two switches on the right, as in the approved design.
export function TopBar({ themeName, onSwitchTheme }: TopBarProps) {
  const { t, switchLanguage } = useLanguage()
  return (
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">{t.appName}</h1>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={switchLanguage} className={switchClass}>
          {t.switchLanguage}
        </button>
        {/* The visible text names the action; the label also says which theme is on now. */}
        <button
          type="button"
          onClick={onSwitchTheme}
          aria-label={`${t.switchTheme} (${t.themeLabel}: ${themeName})`}
          className={switchClass}
        >
          {t.switchTheme}
        </button>
      </div>
    </header>
  )
}

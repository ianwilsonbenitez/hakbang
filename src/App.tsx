import { useLayoutEffect, useState } from 'react'
import { useLanguage } from './language-context'
import { BackupPanel } from './BackupPanel'
import { LessonInvalid } from './LessonInvalid'
import { LessonScreen } from './LessonScreen'
import { listBundledLessonFiles, loadLessonLibrary } from './lib/lesson-library'
import { getLessonParts } from './lib/skill-map'
import { SkillMapScreen } from './SkillMapScreen'
import {
  isTaskPassed,
  loadProgress,
  markBugCheckExplained,
  markBugCheckPassed,
  markCheckScore,
  markExerciseSolved,
  markTaskPassed,
  saveProgress,
  type Progress,
} from './lib/progress'
import { loadTheme, saveTheme, toggleTheme } from './lib/theme'

// Every file in content/lessons/, checked once when the app loads.
const library = loadLessonLibrary(listBundledLessonFiles())

// The optional parts of each valid lesson, so the map can work out the pips.
const partsByLessonId = Object.fromEntries(
  Object.entries(library).flatMap(([lessonId, result]) =>
    result.ok ? [[lessonId, getLessonParts(result.lesson)]] : [],
  ),
)

type View = { name: 'map' } | { name: 'lesson'; lessonId: string }

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

  const [progress, setProgress] = useState(() => loadProgress(localStorage))
  const [view, setView] = useState<View>({ name: 'map' })

  // Saves only here, when the learner does something. Never on load, so a load can never overwrite saved data.
  function handleTaskPassed(lessonId: string) {
    const updated = markTaskPassed(progress, lessonId)
    setProgress(updated)
    saveProgress(localStorage, updated)
  }

  function handleExerciseSolved(lessonId: string, hintsUsed: number) {
    const updated = markExerciseSolved(progress, lessonId, hintsUsed)
    setProgress(updated)
    saveProgress(localStorage, updated)
  }

  function handleCheckFinished(lessonId: string, rightCount: number) {
    const updated = markCheckScore(progress, lessonId, rightCount)
    setProgress(updated)
    saveProgress(localStorage, updated)
  }

  function handleBugCheckPassed(lessonId: string, wrongTaps: number) {
    const updated = markBugCheckPassed(progress, lessonId, wrongTaps)
    setProgress(updated)
    saveProgress(localStorage, updated)
  }

  function handleBugCheckExplained(lessonId: string) {
    const updated = markBugCheckExplained(progress, lessonId)
    setProgress(updated)
    saveProgress(localStorage, updated)
  }

  // The learner confirmed in the panel, so this runs in a click: replace and save, like the other handlers.
  function handleImport(imported: Progress) {
    setProgress(imported)
    saveProgress(localStorage, imported)
  }

  // A plain function and not a component, so typed answers in the lesson are not lost on each re-render.
  function renderLesson(lessonId: string) {
    const result = library[lessonId]
    if (result === undefined) {
      return (
        <p role="alert" className="font-semibold text-review">
          {t.lessonNotFound}
        </p>
      )
    }
    if (!result.ok) {
      return <LessonInvalid errors={result.errors} />
    }
    const lesson = result.lesson
    return (
      <LessonScreen
        lesson={lesson}
        taskPassed={isTaskPassed(progress, lesson.id)}
        onTaskPassed={() => handleTaskPassed(lesson.id)}
        exerciseSolved={progress.lessons[lesson.id]?.exerciseSolved === true}
        onExerciseSolved={(hintsUsed) => handleExerciseSolved(lesson.id, hintsUsed)}
        checkBestScore={progress.lessons[lesson.id]?.checkBestScore}
        checkAttempts={progress.lessons[lesson.id]?.checkAttempts}
        onCheckFinished={(rightCount) => handleCheckFinished(lesson.id, rightCount)}
        bugCheckPassed={progress.lessons[lesson.id]?.bugCheckPassed === true}
        onBugCheckPassed={(wrongTaps) => handleBugCheckPassed(lesson.id, wrongTaps)}
        bugCheckExplained={progress.lessons[lesson.id]?.bugCheckExplained === true}
        onBugCheckExplained={() => handleBugCheckExplained(lesson.id)}
        onClose={() => setView({ name: 'map' })}
      />
    )
  }

  const themeName =theme === 'dark' ? t.themeDark : t.themeLight

  return (
    <main className="mx-auto max-w-5xl p-6">
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
      <div className="mt-8">
        {view.name === 'map' ? (
          <>
            <SkillMapScreen
              progress={progress}
              partsByLessonId={partsByLessonId}
              onOpenLesson={(lessonId) => setView({ name: 'lesson', lessonId })}
            />
            <BackupPanel progress={progress} onImport={handleImport} />
          </>
        ) : (
          <>
            <button type="button" onClick={() => setView({ name: 'map' })} className={buttonClass}>
              {t.backToMap}
            </button>
            <div className="mt-6">
              {renderLesson(view.lessonId)}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default App

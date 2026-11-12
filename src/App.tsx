import { useLayoutEffect, useState } from 'react'
import { useLanguage } from './language-context'
import unit01 from '../content/lessons/unit-01-how-web-apps-work.json'
import { LessonScreen } from './LessonScreen'
import { validateLesson } from './lib/lesson'
import { getLessonParts } from './lib/skill-map'
import { SkillMapScreen } from './SkillMapScreen'
import {
  isTaskPassed,
  loadProgress,
  markBugCheckPassed,
  markCheckScore,
  markExerciseSolved,
  markTaskPassed,
  saveProgress,
} from './lib/progress'
import { loadTheme, saveTheme, toggleTheme } from './lib/theme'

// Checked once when the app loads. Later, lessons will come from imported files too.
const lessonResult = validateLesson(unit01)

// The optional parts of each known lesson, so the map can work out the pips.
const partsByLessonId = lessonResult.ok
  ? { [lessonResult.lesson.id]: getLessonParts(lessonResult.lesson) }
  : {}

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

  function handleBugCheckPassed(lessonId: string) {
    const updated = markBugCheckPassed(progress, lessonId)
    setProgress(updated)
    saveProgress(localStorage, updated)
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
          <SkillMapScreen
            progress={progress}
            partsByLessonId={partsByLessonId}
            onOpenLesson={(lessonId) => setView({ name: 'lesson', lessonId })}
          />
        ) : (
          <>
            <button type="button" onClick={() => setView({ name: 'map' })} className={buttonClass}>
              {t.backToMap}
            </button>
            <div className="mt-6">
              {lessonResult.ok && lessonResult.lesson.id === view.lessonId ? (
                <LessonScreen
                  lesson={lessonResult.lesson}
                  taskPassed={isTaskPassed(progress, lessonResult.lesson.id)}
                  onTaskPassed={() => handleTaskPassed(lessonResult.lesson.id)}
                  exerciseSolved={
                    progress.lessons[lessonResult.lesson.id]?.exerciseSolved === true
                  }
                  onExerciseSolved={(hintsUsed) =>
                    handleExerciseSolved(lessonResult.lesson.id, hintsUsed)
                  }
                  checkBestScore={progress.lessons[lessonResult.lesson.id]?.checkBestScore}
                  onCheckFinished={(rightCount) =>
                    handleCheckFinished(lessonResult.lesson.id, rightCount)
                  }
                  bugCheckPassed={
                    progress.lessons[lessonResult.lesson.id]?.bugCheckPassed === true
                  }
                  onBugCheckPassed={() => handleBugCheckPassed(lessonResult.lesson.id)}
                />
              ) : (
                <p role="alert" className="text-review">
                  {t.lessonInvalid}
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default App

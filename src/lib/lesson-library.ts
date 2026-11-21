import { validateLesson, type LessonResult } from './lesson'

// Vite reads every lesson file in content/lessons/ when the app is built.
// A new lesson from Gemini is picked up automatically. `import: 'default'` gives
// the lesson data itself, not a module wrapper around it.
const bundledLessonFiles = import.meta.glob('../../content/lessons/*.json', {
  import: 'default',
  eager: true,
}) as Record<string, unknown>

// Every lesson file, checked once. The key is the file name without ".json",
// which must be the same as the lesson's id. File names are always unique,
// so two files can never hide each other, even when one of them is broken.
export type LessonLibrary = Record<string, LessonResult>

function fileKey(path: string): string {
  const name = path.split('/').pop() ?? path
  return name.replace(/\.json$/, '')
}

export function loadLessonLibrary(files: Record<string, unknown>): LessonLibrary {
  return Object.fromEntries(
    Object.entries(files).map(([path, data]) => [fileKey(path), validateLesson(data)]),
  )
}

export function listBundledLessonFiles(): Record<string, unknown> {
  return bundledLessonFiles
}

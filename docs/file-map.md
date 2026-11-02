# File map: what each main file does

Ian's cheat sheet. Goal (Milestone 1): explain each main file without AI.
Update this file whenever a file is added or its job changes.

Two kinds of code files:
- **`src/lib/*.ts`** = logic. Plain TypeScript, no screen. Has a `*.test.ts` next to it.
- **`src/*.tsx`** = screens and parts of screens. They show things and call the logic.

## How it fits together

```
index.html → main.tsx → LanguageProvider → App → LessonScreen → DiagramView
                                            │
                                            ├─ lib/theme     (dark / light, saved)
                                            ├─ lib/progress  (what the learner passed, saved)
                                            └─ lib/lesson    (checks the lesson JSON file)
```

## App files (`src/`)

| File | What it does |
| --- | --- |
| `main.tsx` | Starts the app. Puts `App` inside `LanguageProvider` and draws it into the page. |
| `App.tsx` | The top component. Holds the theme and the saved progress. Checks the lesson file with `validateLesson`, then shows `LessonScreen` (or an error message). Saves progress only when the learner passes the task. |
| `LessonScreen.tsx` | The lesson screen: steps Picture, Explain, Try it. Shows the "Task done" mark. Tells `App` when the task answer is right (`onTaskPassed`). |
| `DiagramView.tsx` | Shows the lesson's SVG picture inline, so it follows the light / dark theme. Shows the alt text if the picture is missing or unsafe. |
| `LanguageProvider.tsx` | Holds the current language (English / Taglish), saves it, and shares it with every component. |
| `language-context.ts` | The shared "box" for the language, plus `useLanguage()` to read it from any component. |
| `index.css` | Colours and fonts (the `--hk-*` variables for dark and light) and the Tailwind setup. |
| `i18n/en.ts` | Every visible English text of the app. It defines the list of keys. |
| `i18n/tl.ts` | The same keys in Taglish. TypeScript complains if a key is missing. |
| `i18n/strings.ts` | Puts `en` and `tl` together so the app can pick one by language. |

## Logic files (`src/lib/`)

| File | What it does |
| --- | --- |
| `lesson.ts` | `validateLesson`: checks a lesson JSON file. Returns the lesson, or a list of errors with a path and a code. |
| `lesson-flow.ts` | The step order (Picture → Explain → Try it) and `isCorrectAnswer`. |
| `progress.ts` | Saved progress: `parseProgress` (checks untrusted data), `loadProgress`, `saveProgress`, `markTaskPassed` (makes a new object, never edits the old one), `isTaskPassed`. |
| `theme.ts` | Dark / light: parse, toggle, load and save. |
| `language.ts` | English / Taglish: parse, toggle, load and save. `pick` chooses the right text from `{en, tl}`. |
| `diagrams.ts` | `findDiagram` finds the SVG text by file name. `isSafeSvg` rejects scripts and event handlers. |
| `*.test.ts` | Vitest tests for the file with the same name. Run with `npm test`. |

## Content (not ours to edit: Gemini writes these)

| File | What it is |
| --- | --- |
| `content/lessons/unit-01-how-web-apps-work.json` | The lesson. Format is in `docs/lesson-schema.md`. |
| `docs/diagrams/unit-01-how-web-apps-work.svg` | The lesson's picture. Uses `currentColor` so it follows the theme. |

## What is saved in the browser (localStorage)

| Key | Value | Written by |
| --- | --- | --- |
| `hakbang-theme` | `dark` or `light` | `lib/theme.ts` |
| `hakbang-language` | `en` or `tl` | `lib/language.ts` |
| `hakbang-progress` | JSON: `schemaVersion` and a `lessons` map with `taskPassed` per lesson | `lib/progress.ts` |

## Config and project files

| File | What it does |
| --- | --- |
| `package.json` | Project name, scripts (`dev`, `build`, `test`, `lint`) and the list of libraries. |
| `vite.config.ts` | Vite (dev server and build) with the React and Tailwind plugins, and the Vitest settings. |
| `tsconfig*.json` | TypeScript rules (strict mode). |
| `eslint.config.js` | Code style rules checked by `npm run lint`. |
| `index.html` | The single page the app is drawn into. |
| `.gitignore` | Files Git must not track (`node_modules`, `dist`, progress backups). |
| `CLAUDE.md`, `GEMINI.md` | Rules for the two AIs. |
| `docs/design-tokens.md`, `docs/lesson-schema.md` | Look and feel, and the lesson file format. |
| `docs/later-ideas.md` | Ideas that are not in v1. |

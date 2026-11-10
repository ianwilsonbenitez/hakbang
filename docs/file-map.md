# File map: what each main file does

Ian's cheat sheet. Goal (Milestone 1): explain each main file without AI.
Update this file whenever a file is added or its job changes.

Two kinds of code files:
- **`src/lib/*.ts`** = logic. Plain TypeScript, no screen. Has a `*.test.ts` next to it.
- **`src/*.tsx`** = screens and parts of screens. They show things and call the logic.

## How it fits together

```
index.html → main.tsx → LanguageProvider → App ─┬─ SkillMapScreen   (the map)
                                                └─ LessonScreen     (one lesson)
                                                     ├─ DiagramView   (the picture)
                                                     ├─ ExercisePanel (blank + 3 hints)
                                                     └─ CheckPanel    (3 questions, no hints)

App also uses these logic files:
  lib/theme     (dark / light, saved)
  lib/progress  (what the learner passed, saved)
  lib/lesson    (checks the lesson JSON file)
  lib/skill-map + lib/mastery (node status and the 3 pips, worked out from progress)
```

## App files (`src/`)

| File | What it does |
| --- | --- |
| `main.tsx` | Starts the app. Puts `App` inside `LanguageProvider` and draws it into the page. |
| `App.tsx` | The top component. Holds the theme, the saved progress and which screen is open (map or lesson). Checks the lesson file with `validateLesson`. Saves progress only in a click handler: task passed, exercise solved, check finished. Never on load. |
| `SkillMapScreen.tsx` | The skill map: 4 columns of nodes. Each node shows its status (word and border colour) and 3 mastery pips. Tells `App` which lesson to open (`onOpenLesson`). |
| `LessonScreen.tsx` | The lesson screen: steps Picture, Explain, Try it. The "Try it" step holds the task question, `ExercisePanel` and `CheckPanel`. Shows the "Task done" mark and passes events up to `App`. |
| `ExercisePanel.tsx` | The guided exercise: code with a blank, a text box, and 3 hints that unlock in order. Reports the hints used when the answer is right. |
| `CheckPanel.tsx` | The 3-question check, one question at a time, no hints. Shows the score and the "why" at the end, and allows a retry. Reports the number of right answers when the learner finishes. |
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
| `progress.ts` | Saved progress: `parseProgress` (checks untrusted data), `loadProgress`, `saveProgress`, and the `mark...` functions (`markTaskPassed`, `markExerciseSolved`, `markCheckScore`). Each makes a new object and never edits the old one. `markExerciseSolved` keeps the fewest hints; `markCheckScore` keeps the best score. |
| `exercise.ts` | The exercise rules: `isAcceptedAnswer` (trims and squeezes spaces), and the hint rules (`unlockNextHint`, `visibleHints`, `canUnlockMoreHints`). Hints go 0 → 1 → 2 → 3 and stop. |
| `check.ts` | `scoreCheck`: counts right and wrong answers. A question with no answer counts as wrong. |
| `mastery.ts` | `getMastery`: works out the 3 pips (Understands, Builds, Debugs) from saved facts. `isFinished` is true when all 3 are on. The pass mark is `CHECK_PASS_SCORE`. |
| `skill-map.ts` | The skill nodes and columns, `getNodeStatus` (locked, not started, in progress, finished) and `getLessonParts`. |
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
| `hakbang-progress` | JSON: `schemaVersion` and a `lessons` map. Each lesson can have `taskPassed`, `exerciseSolved`, `exerciseHintsUsed`, `checkBestScore` and (later) `bugCheckPassed`. | `lib/progress.ts` |

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

## Terms I met

One line each, in plain words. Add a new line whenever a new word shows up.

**React**

| Term | Meaning |
| --- | --- |
| component | A function that returns a piece of screen, like `LessonScreen`. |
| props | Inputs a parent gives to a component, like `taskPassed` and `onTaskPassed`. |
| state | A value React remembers between redraws (`useState`). Changing it redraws the screen. |
| callback | A function passed down as a prop so a child can tell its parent "something happened". |
| lifting state up | Keeping the state in the parent (`App`) so it survives when a child disappears. |
| mount / unmount | A component appears on screen / is removed. `TryStep` is unmounted when you leave that step, so its own state resets. |
| effect (`useEffect`, `useLayoutEffect`) | Code that runs after the screen is drawn, and again when the values in its `[ ]` change. Not for "save when the user did something"; use a click handler for that. |
| context / provider | A shared box any component can read, like the current language. |

**Data and safety**

| Term | Meaning |
| --- | --- |
| immutable update | Do not edit the old object; make a new one with the change (`{ ...old, new }`). React sees "new object" and redraws. |
| parse / validate | Check data you do not trust and keep only the good parts. Never throw. |
| `schemaVersion` | A number in saved data. If it does not match, the app starts empty and does not overwrite what is saved. |
| idempotent | Doing it twice gives the same result as doing it once (`markTaskPassed`). |
| spread (`...`) | Copies everything from an old object so you can add one change on a new copy. |
| pip | One of the 3 small dots on a skill node. Lit means that level is reached. |
| best score | `markCheckScore` keeps the highest score, so a bad retake never takes progress away. |
| localStorage | The browser's small saved box for this site. See it in DevTools, Application tab. |
| defense in depth | More than one safety check, so one mistake does not break everything (`isSafeSvg` plus our own repo). |
| `currentColor` | An SVG colour that copies the page's text colour, so the picture follows light and dark. |

**Tools and workflow**

| Term | Meaning |
| --- | --- |
| Vitest test | A small program that checks one function gives the right answer. `npm test`. |
| lint | A style and mistake checker. `npm run lint`. |
| build | Turns the app into the final files, and checks TypeScript types. `npm run build`. |
| type (TypeScript) | A label saying what shape a value has, so mistakes show before the app runs. |
| commit / push | Save a snapshot with a message / upload it to GitHub. |
| i18n | "Internationalization": every visible text lives in `en.ts` and `tl.ts`, not in the screens. |

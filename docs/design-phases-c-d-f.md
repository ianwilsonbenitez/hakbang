# Detailed design: Phases C, D and F (items 8–15, 19–20)

Written by Claude Fable 5.2 on Nov 17, 2026, from the real code in `src/`.
Companion to `docs/improvement-plan.md`. The plan says **what** and **in which order**. This file says **exactly how**, so a later session does not have to redesign anything.

For the AI that builds these: `CLAUDE.md` still applies (plan first, wait for Ian's "go", Ian runs every command, tests for every logic function, all text through `en.ts` / `tl.ts`). One item per session. Where this file says **"Ian writes"**, write the failing test first and let Ian write the function body.

Lines marked **DECISION** are choices made here that differ from, or add to, the plan. Ian can overrule any of them.

## Rules that hold for every item

1. **The learner is never left stuck.** Every screen has a way to see the full correct explanation. What changes is what gets saved and what counts for a pip.
2. **Save facts, work out the rest.** New saved fields are facts ("explained: yes"). Levels are still worked out in `getMastery`.
3. **Old saved progress keeps loading.** Every new field is optional. `PROGRESS_SCHEMA_VERSION` stays `1`. `parseLessonEntry` copies a new field only when its value is valid.
4. **Save only in click handlers**, never in an effect and never on load (same as today).
5. **Random things come in from outside.** Any function that shuffles takes `random: () => number` as a parameter, so a test can pass a fake.
6. **Typed text is never saved** (guesses, explanations). It lives in component state only. This keeps personal writing out of exports.

---

## Phase C. Honest pips

### Item 8. Record attempts

New optional fields in `LessonProgress` (`src/lib/progress.ts`):

| Field | Type | Rule |
| --- | --- | --- |
| `bugCheckWrongTaps` | whole number, 0 or more | the **fewest** is kept (like `exerciseHintsUsed`) |
| `checkAttempts` | whole number, 1 or more | goes up by one each time the check is finished |

Logic changes:

- New helper `isWholeNumberAtLeast(value, min)` in `progress.ts`. Use it in `parseLessonEntry` for both fields. A bad value is dropped; the rest of the entry is kept.
- `markBugCheckPassed(progress, lessonId, wrongTaps)` gets a third parameter. Keeps `Math.min(before, wrongTaps)` when a value was already saved.
- `markCheckScore` also sets `checkAttempts: (before?.checkAttempts ?? 0) + 1`.
- New pure function in `src/lib/bug-check.ts`: `addWrongLine(wrongLines: number[], lineNumber: number): number[]`. Returns a new list; a line already in the list is not added twice. The count of wrong taps is `wrongLines.length`. **DECISION:** tapping the same wrong line twice counts once.

Screen changes:

- `BugCheckPanel` keeps `wrongLines` in state. Wrong lines stay marked amber, so the learner sees what was already tried. On the right tap it calls `onPassed(wrongLines.length)`.
- Quiet lines of text, not badges: "Found after 2 wrong taps" / "Found on the first tap", and in the check header "Attempt 3".

Tests (`progress.test.ts`, `bug-check.test.ts`):

- `markBugCheckPassed` saves the count; a later, larger count does not replace a smaller one; a smaller one does.
- `markCheckScore` gives `checkAttempts` 1, then 2; the best score rule is unchanged.
- `parseProgress` keeps valid new fields; drops `-1`, `1.5`, `"2"`; an old entry without the fields loads unchanged.
- `addWrongLine` adds, does not duplicate, does not change the list passed in.

Known limit, accepted: after a page reload the learner can find the bug with 0 wrong taps because they remember it. That is fine. Wrong taps are shown, but the pip depends on the explanation (item 9), not on taps.

### Item 9. Explain-back in the bug check

New optional field: `bugCheckExplained?: boolean`. Only ever set to `true`. New function `markBugCheckExplained(progress, lessonId)`, shaped like `markTaskPassed`.

The panel moves through four states. Keep this as one state value, not several booleans:

```
searching ──right tap──▶ explaining ──"Compare"──▶ comparing ──"Mine says the same"──▶ done
                              │                        │
                              │                        └─"Not quite yet"──▶ explaining (box cleared)
                              └─"I can't explain it yet, show me"──▶ comparing (no text of mine)
```

- **searching**: today's screen. `why` is NOT shown on the right tap any more. Only "You found it."
- **explaining**: the bug line stays highlighted. A `<textarea>` with the label "In your own words: why is this a bug?" and a "Compare with the model answer" button. The button unlocks when `isExplanationReady(text)` is true.
- **comparing**: two boxes, stacked on a phone, side by side on desktop. "Your explanation" (what was typed) and "Model answer" (`bugCheck.why`). Two buttons: "Mine says the same" and "Not quite yet".
  - "Mine says the same" calls `onExplained()` (saves `bugCheckExplained: true`) and goes to **done**.
  - "Not quite yet" saves nothing, shows one kind line ("That is normal. Read the model answer once more, then say it your way."), clears the box and returns to **explaining**.
  - Arriving by "show me": only the model answer is shown, and the only button is "Now let me try". Nothing is saved. This is the never-stuck door.
- **done**: bug line marked, model answer shown, "Explained" label.

Starting state when the panel opens, from saved facts:

| `bugCheckPassed` | `bugCheckExplained` | Starts in |
| --- | --- | --- |
| not true | any | searching |
| true | not true | explaining (bug line already marked) |
| true | true | done |

New pure function in `bug-check.ts`: `isExplanationReady(text: string): boolean`. True when the trimmed text has at least `MIN_EXPLANATION_LENGTH = 15` characters. **Ian writes** this one (3 lines: trim, measure, compare).

**DECISION:** self-grading, no AI. Research on self-explanation shows the gain comes from producing the explanation and then comparing it with a good one, even when nobody grades it. AI feedback stays item 30.

New i18n keys (both files): `bugCheckExplainLabel`, `bugCheckCompare`, `bugCheckShowMe`, `bugCheckYours`, `bugCheckModel`, `bugCheckSame`, `bugCheckNotYet`, `bugCheckNotYetNote`, `bugCheckTryExplain`, `bugCheckExplained`, `bugCheckWrongTapsLabel`, `bugCheckFirstTap`.

Tests: `markBugCheckExplained` sets the field, keeps other fields, is safe to call twice; `parseProgress` keeps a boolean and drops a non-boolean; `isExplanationReady` for empty, spaces only, 14 characters, 15 characters, long text with spaces around.

### Item 10. New Level 3 rule

In `getMastery` (`src/lib/mastery.ts`), one line changes:

```ts
const bugCheckMet = parts.hasBugCheck
  ? entry?.bugCheckPassed === true && entry?.bugCheckExplained === true
  : true
```

Tests to add in `mastery.test.ts`: check passed + bug found + not explained → `debugs` false; all three → true; lesson without a bug check is unchanged.

**Effect on Ian's saved progress:** Unit 1's third pip will switch off until he does the explain-back once. That is the point of the change, and nothing is deleted. Build items 9 and 10 in the **same session or back to back**, so the app is never in a state where Level 3 cannot be reached.

### Item 11. Shuffle options on a check retry

New file `src/lib/shuffle.ts`:

```ts
export function shuffle<T>(items: T[], random: () => number): T[]
```

Fisher–Yates on a copy; the list passed in is not changed. **DECISION:** generic `shuffle` and not `shuffleOptions`, because item 20 needs to shuffle lines with the same function.

In `CheckPanel`: new state `shownQuestions`, starting as `questions` (file order on the first attempt). `retry()` sets it to the questions with each `options` list shuffled, calling `shuffle(options, Math.random)` **inside the click handler**, never during render. Answers are stored by option `id`, so `scoreCheck` needs no change.

Tests: same items before and after (sort both and compare); input not changed; with a fake `random` that always returns `0` the result is a known order; an empty list and a one-item list come back as they are.

### Item 12. Tracer "Think first" needs a typed guess

No schema change. In `TracerPanel`: a text input under the question, label "Your guess". "Show answer" unlocks when `hasGuess(text)` is true. After the reveal, show "Your guess: …" directly above the answer, so the learner compares the two.

New pure function in `src/lib/tracer.ts`: `hasGuess(text: string): boolean`, true when the trimmed text is not empty. A short guess like "No" is a real guess, so there is no minimum length. **Ian writes** this one.

Never stuck: any typed guess unlocks the answer, right or wrong. New i18n keys: `tracerGuessLabel`, `tracerYourGuess`.

Later, with Ian's approval of a schema change: `predict.options` + `predict.answer` shaped like `task`, so the guess is a tap and can be marked.

### Item 13. Score colour

New function in `mastery.ts`: `isCheckPassed(score: number): boolean`, which is `score >= CHECK_PASS_SCORE`. Use it inside `getMastery` too, so the rule lives in one place. **Ian writes** this one (it is the first candidate in item 17).

In `CheckPanel`, the score line uses `text-success` when passed and `text-review` when not, plus words so colour is not the only signal: "Passed" or "Not yet. You need 2 of 3." New i18n keys: `checkPassed`, `checkNotYet`.

Tests: 0 and 1 → false; 2 and 3 → true.

### Build order inside Phase C

13 → 12 → 8 → 11 → 9 + 10. Small and safe first; the Level 3 rule last, together with the screen that lets the learner meet it.

---

## Phase D. One thing per screen

### Item 14. Lesson steps

**DECISION:** up to eight steps, not six. The plan put the quiz and the bug check together in "Check", which is still two things on one screen.

| Step id | Label (en) | Shown when | What it holds |
| --- | --- | --- | --- |
| `picture` | Picture | always | diagram |
| `explain` | Explain | always | paragraphs + glossary |
| `task` | Task | always | the one small task |
| `trace` | Trace | lesson has `tracer` | `TracerPanel` |
| `arrange` | Arrange | lesson has `arrange` (item 20) | `ArrangePanel` |
| `build` | Build | lesson has `exercise` | `ExercisePanel` |
| `check` | Check | always | `CheckPanel` |
| `debug` | Debug | lesson has `bugCheck` | `BugCheckPanel` |

Unit 1 today gets seven steps. Add `arrange` to the type only when item 20 is built.

Changes in `src/lib/lesson-flow.ts`:

```ts
export type LessonStep = 'picture' | 'explain' | 'task' | 'trace' | 'build' | 'check' | 'debug'

export type LessonStepParts = { hasTracer: boolean; hasExercise: boolean; hasBugCheck: boolean }

export function getLessonSteps(parts: LessonStepParts): LessonStep[]
export function nextStep(steps: LessonStep[], step: LessonStep): LessonStep
export function previousStep(steps: LessonStep[], step: LessonStep): LessonStep
```

- `LESSON_STEPS` is removed. `nextStep` and `previousStep` take the list, because it now differs per lesson.
- `getLessonParts` in `skill-map.ts` already reads the lesson for the pips. Extend it with `hasTracer` instead of writing a second reader.

Changes in `LessonScreen.tsx`:

- `TryStep` is renamed `TaskStep`. Each interactive panel sits in its own wrapper: `<div className={step === 'trace' ? '' : 'hidden'}>`. All of them stay mounted (**hidden, not removed**), so typed answers, opened hints and the tracer position survive a step change. `PictureStep` and `ExplainStep` hold no state and can stay conditional.
- Moving between steps is always free. No step is locked behind another one.
- On the last step, the "Next" button becomes "Back to the map" and calls a new `onClose` prop.

Tests (`lesson-flow.test.ts`): a lesson with every part gives all seven in order; with no optional part gives `picture, explain, task, check`; `nextStep` stops at the last step of a short list; `previousStep` stops at the first.

### Item 15. Step dots

New component `StepDots.tsx`, replacing the row of three buttons.

- One 44px button per step, the dot drawn inside it. Current step: indigo ring. `aria-current="step"`, and `aria-label` "Step 2 of 7: Explain".
- Next to the dots, visible text: "2 of 7 · Explain". On a phone only this text names the step; the dots carry no labels.
- A step whose fact is saved shows a small check shape inside the dot (shape plus mint, not colour alone).

New pure function in `lesson-flow.ts`:

```ts
export function isStepDone(step: LessonStep, entry: LessonProgress | undefined): boolean
```

`task` → `taskPassed`; `build` → `exerciseSolved`; `check` → `isCheckPassed(checkBestScore ?? 0)`; `debug` → `bugCheckExplained`; `picture`, `explain`, `trace` → always false (nothing is saved for them). Tests: one case per step.

New i18n keys: `stepTask`, `stepTrace`, `stepBuild`, `stepCheck`, `stepDebug`, `stepOf`, `backToMapFromLesson`. `stepTry` is removed.

---

## Phase F. Schema changes (Ian approves each, then tell Gemini)

Both changes are **additions**. Every lesson file that is valid today stays valid, so `schemaVersion` stays `1`.

### Item 19. Tracer scenarios

A tracer may have **either** today's shape (`predict` + `steps`) **or** a `scenarios` list. Never both.

```json
"tracer": {
  "code": "function checkWarranty(days) {\n  if (days <= 30) {\n    return \"valid\";\n  }\n  return \"expired\";\n}",
  "scenarios": [
    {
      "label": "days = 18",
      "predict": { "question": { "en": "...", "tl": "..." }, "answer": { "en": "...", "tl": "..." } },
      "steps": [ { "line": 2, "vars": { "days": "18" }, "condition": "18 <= 30 → true", "note": { "en": "...", "tl": "..." } } ]
    },
    {
      "label": "days = 45",
      "predict": { "question": { "en": "...", "tl": "..." }, "answer": { "en": "...", "tl": "..." } },
      "steps": [ { "line": 2, "vars": { "days": "45" }, "condition": "45 <= 30 → false", "skippedLines": [3], "note": { "en": "...", "tl": "..." } } ]
    }
  ]
}
```

Rules for `docs/lesson-schema.md`:

- `scenarios`: 2 or 3 entries. (One input is today's shape.)
- `label`: a short plain string, the same in both languages, like `condition`. It names the input: `"days = 45"`.
- Each scenario has its own `predict` and `steps`, with the same rules as today.
- Scenarios should take **different paths** through the code (one where the `if` is true, one where it is false). That is the whole point.

Validator (`lesson.ts`): new error code `conflicting-fields` when `scenarios` is present together with `predict` or `steps`. Reuse `checkTracerStep` and the predict check for each scenario; paths look like `tracer.scenarios[1].steps[0].line`.

App: one new function in `tracer.ts` hides the two shapes from the screen:

```ts
export type TracerScenario = { label?: string; predict: ...; steps: TracerStep[] }
export function getTracerScenarios(tracer: NonNullable<Lesson['tracer']>): TracerScenario[]
```

Old shape → a list with one scenario and no label. `TracerPanel` always works from this list. With two or more scenarios it shows a row of buttons ("Input 1 · days = 18", "Input 2 · days = 45"). Choosing another input resets the step to 0 and asks that scenario's own "Think first" question again.

Tests: old shape → one scenario; new shape → same count, same order; validator accepts each shape alone, rejects both together, rejects a list of one, rejects a bad step inside the second scenario with the right path.

### Item 20. Parsons exercise (`arrange`)

The learner sees the lines of a short function in a mixed-up order and taps them into the right order. No typing.

```json
"arrange": {
  "prompt": { "en": "Tap the lines in the order that makes the function work.", "tl": "..." },
  "lines": [
    "function isAdult(age) {",
    "  if (age >= 18) {",
    "    return true;",
    "  }",
    "  return false;",
    "}"
  ],
  "why": { "en": "The check must come before the return it protects.", "tl": "..." }
}
```

Rules for `docs/lesson-schema.md`:

- `arrange` is optional.
- `lines`: 3 to 8 strings, written in the **correct** order, with their indentation. The app does the mixing.
- No empty lines. Two lines may have the same text (for example two `}`); the app compares text, so swapping twins is still right.
- `why` is shown after the order is right, and also behind "Show me the order" (never stuck).
- **DECISION:** no "distractor" lines (extra wrong lines to leave out) in the first version. Add later if wanted.

Validator: `lines` count outside 3–8 → `wrong-count`; a line that is not a string → `wrong-type`; an empty line → `empty-text`.

Logic, new file `src/lib/arrange.ts`:

```ts
export function mixLines(lines: string[], random: () => number): string[]
export function isOrderCorrect(lines: string[], picked: string[]): boolean
export function firstWrongIndex(lines: string[], picked: string[]): number | null
```

- `mixLines` uses `shuffle` from item 11. If the result equals the correct order, it moves the first line to the end, so the learner never gets a solved puzzle.
- `isOrderCorrect` compares text position by position, and the lengths must match.
- `firstWrongIndex` gives the first position that differs, for the feedback "Line 3 is not in the right place yet".

Screen `ArrangePanel.tsx`: two lists. "Lines to use" (the pool) and "Your order". Tapping a pool line moves it to the end of "Your order"; tapping a line in "Your order" sends it back. No drag and drop: taps work on a phone and with a keyboard. "Check order" unlocks when the pool is empty. The mixed order is made once, in the `useState` starting function, so it does not change while the learner works.

Progress: new optional `arrangeSolved?: boolean` and `markArrangeSolved`. Mastery: `LessonParts` gets `hasArrange`, and Level 2 becomes "every Build part this lesson has is solved":

```ts
const exerciseMet = parts.hasExercise ? entry?.exerciseSolved === true : true
const arrangeMet = parts.hasArrange ? entry?.arrangeSolved === true : true
const builds = parts.hasExercise || parts.hasArrange ? exerciseMet && arrangeMet : understands
```

Tests: `mixLines` keeps the same lines and never returns the correct order (also with a fake `random` that would); `isOrderCorrect` for right order, wrong order, swapped twins, too few lines; `firstWrongIndex`; mastery with and without each part; validator cases above.

---

## Risks and how each is handled

| Risk | Handling |
| --- | --- |
| Level 3 pip switches off for saved progress after item 10 | Expected and honest. Build 9 and 10 together. The panel opens straight on the explain box, so it takes one minute to earn back. |
| An old backup file is imported after new fields exist | Works: missing fields mean "not yet". Covered by the `parseProgress` tests in item 8. |
| A new backup is opened by an older copy of the app | The old `parseLessonEntry` ignores fields it does not know. Nothing breaks; the extra facts are dropped on that device. |
| `Math.random` during render makes the screen jump | Shuffle only in click handlers or in a `useState` starting function. |
| Gemini writes `scenarios` before the app supports it | The validator rejects the file with a clear message (plan item 2). Tell Gemini only after the item is built and committed. |
| Seven dots are tight at phone width | Dots are small inside 44px buttons; allow the row to wrap. Check in item 3's phone test again after item 15. |
| Self-graded explain-back can be clicked through | Accepted for v1. It still makes the learner write and compare. Item 30 (AI feedback) and the "confirmed on a different day" rule make it stricter later. |

## "Ian writes" list (item 17), in the order the items come up

| Function | File | Item | New idea for Ian |
| --- | --- | --- | --- |
| `backupFileName(date)` | `progress.ts` or `backup.ts` | 1 | building a string from parts |
| `isCheckPassed(score)` | `mastery.ts` | 13 | `>=` gives true or false |
| `hasGuess(text)` | `tracer.ts` | 12 | `.trim()` and `!==` |
| `addWrongLine(list, line)` | `bug-check.ts` | 8 | `.includes()` and making a new list with `[...list, line]` |
| `isExplanationReady(text)` | `bug-check.ts` | 9 | `.length` |
| `isOrderCorrect(lines, picked)` | `arrange.ts` | 20 | `.every()` over a list |

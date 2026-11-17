# Brief for Gemini: lesson work after the Nov 2026 review

Written by Claude Fable 5.2 on Nov 17, 2026. Approved order of work is in `docs/improvement-plan.md` (Phases H and E are yours).
`GEMINI.md` and `docs/lesson-schema.md` still apply in full. This file only adds the list of work and the quality bar.

## Roles

- **Author** (the stronger model, high effort): writes or changes one lesson file and its diagram.
- **Reviewer** (the other model): reads the finished lesson as a beginner would and reports problems. The reviewer changes nothing.
- Ian passes work between the two and commits. Claude's `lesson-checker` gives a third check on the code facts.

## Quality bar for every lesson

1. **Answerable from the screen.** Every question (task, exercise, check, bug check, tracer predict) must be answerable from the diagram and the `explain` paragraphs. The glossary is extra help, never the only place an idea appears.
2. **Symbols before use.** Ian still looks up `!`, `&&`, `===`, `? :`. Any symbol used in an exercise, tracer or bug check gets one sentence and one tiny example in `explain` first. At most **one new symbol per lesson**.
3. **Prompts do not give the answer away.** A bug check `prompt` only says what the code should do. The reason goes in `why`.
4. **`why` is a model answer.** The app will show `bugCheck.why` next to the learner's own explanation. Write it as 1–2 full sentences a learner could have said: what the line does, and what it should do.
5. **Predict questions need a short typed guess.** Ask for something that can be answered in a few words ("What does it return when hoursAhead is 6?").
6. **Options are shuffled on a retry.** Never write "both of the above" or refer to an option by its position or letter.
7. **Tracer inputs show a path.** Choose an input where a line is skipped, and say so in the note.
8. **Do not use `tracer.scenarios` or `arrange` yet.** They are planned (see `docs/design-phases-c-d-f.md`) but the app rejects them until Ian says they are built.
9. Privacy as always: no real names, no patient data, nothing copied from the lab system or Silip.

## Task 1. Fix Unit 1 (plan items 25 and 26)

File: `content/lessons/unit-01-how-web-apps-work.json`

- **Item 26.** The bug check `prompt` contains the answer ("=== checks, a single = overwrites"). Move that idea into `why`. The prompt should only say what the function is supposed to do and ask for the line.
- **Item 25.** The explanation is about browser, server and database, but the exercise asks the learner to type `result.verified === true`. `if`, `===` and the dot (`result.verified`) appear only in the glossary. Choose one and tell Ian which:
  - (a) add one `explain` paragraph that shows `if`, `===` and the dot with one small example each (stay within 4 paragraphs), or
  - (b) change the exercise so the blank needs only what the explanation teaches, and leave the code ideas for Unit 0.

## Task 2. Unit 0 as two short lessons (plan item 27)

**Wait for Ian's go.** The app's checker does not accept `"unit": 0` yet (Claude's item 28).

- Lesson A: values and variables (a name that holds a value; text, number, true/false).
- Lesson B: a function and `return` (input goes in, one value comes out).
- Each: its own diagram, a tracer of 3–5 lines, and a bug check. No exercise that needs typing a full line.

## Task 3. "Hakbang teaches Hakbang" (plan item 16)

Six lessons, each built on one real function from this app. You may **read** `src/lib/` to copy the function exactly; you still never edit it. This is our own code, so there is no privacy problem.

**Wait for Ian's go.** The app shows only Unit 1 today; Claude must first make it load more lessons.

Write them in this order, one lesson per session:

| # | Function | File | The one idea | Suggested bug for the bug check |
| --- | --- | --- | --- | --- |
| 1 | `isBugLine` | `src/lib/bug-check.ts` | `===` gives true or false | `=` instead of `===` |
| 2 | `parseLanguage` | `src/lib/language.ts` | `? :` picks one of two values | the two values swapped |
| 3 | `unlockNextHint` | `src/lib/exercise.ts` | `Math.min` as a ceiling | `Math.max` instead of `Math.min` |
| 4 | `markCheckScore` | `src/lib/progress.ts` | `Math.max` keeps the best | `Math.min` instead of `Math.max` |
| 5 | `isAcceptedAnswer` | `src/lib/exercise.ts` | `.some()` asks "is there at least one?" | `.every()` instead of `.some()` |
| 6 | `getNodeStatus` | `src/lib/skill-map.ts` | the order of `if` checks matters | two checks in the wrong order |

For each lesson:

- If the real function is longer than 14 lines or uses several new ideas, show a **shortened look-alike** that keeps the one idea, and say in `explain` that the real one lives in the file named above.
- Diagram: the function as a box, with one example value going in and one coming out.
- Tracer: one input where a line is skipped or a ceiling is hit.
- Check: three questions, each with a **different** input from the tracer, so it tests the idea and not memory.
- Ask Ian for the `unit` number and file name before writing.

## What to hand back to Ian after each task

1. The file(s) you changed.
2. Anything in the schema that stopped you from writing a good lesson.
3. A suggested commit message. Remind Ian to commit before he switches to Claude.

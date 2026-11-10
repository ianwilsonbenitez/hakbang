# Ideas for later (not in v1)

Ideas Ian suggested. Do not build any of these in Milestone 1. Revisit after v1 ships.

## Login for other learners
- Why: other Filipino career shifters could use or test Hakbang with their own account.
- Needs: a server and a database, so it belongs after v1 (see "Not in v1" in CLAUDE.md).
- Note: testers do not need a login to try v1. Progress is saved in their own browser, and Export / Import moves it between devices.

## Stronger SVG safety with DOMPurify
- Why: diagrams are inserted into the page as raw HTML (`DiagramView`). Today this is safe because every SVG is a file in our own repo, checked by `isSafeSvg` (a small blocklist).
- When it is needed: only when learners can upload lessons or SVG files made by other people.
- Idea: add DOMPurify (a well-known library that cleans SVG with an allowlist) and run it on every SVG before it is shown. `isSafeSvg` stays in one place, so it is easy to replace.
- Cost: needs Ian's approval (new library), about 20 KB more in the bundle, and a DOM test tool such as jsdom, because Vitest has no browser DOM here.

## Unit 0: first coding words for absolute beginners
- Why: Ian finds basic words (const, boolean, type, export, import) hard at first. A short beginner unit before Unit 1 would help him and other career shifters.
- Outline from Gemini (Nov 7, 2026): plain beginner meanings, everyday comparisons first, a new example each time an idea comes back, easy and hard tasks mixed inside the normal lesson format (no schema change).
- Review notes from Claude:
  - Split into two lessons: values (const, string, boolean), then function and return.
  - Add type, export and import, since they appear in real files like `mastery.ts`.
  - Hard task tests one idea only (for example reassigning a const, or two return lines, not both).
- Needs: the lesson validator rejects `"unit": 0` today (`checkPositiveInteger` in `src/lib/lesson.ts`). Either allow 0 (small change plus a test) or use another unit number.
- Not part of Milestone 1. Revisit after Task 8 or after M1.

## Exercise answers: accept missing spaces
- Why: `isAcceptedAnswer` (`src/lib/exercise.ts`) only trims and squeezes repeated spaces. A valid answer written without spaces, like `result.verified===true`, is rejected because the lesson lists `result.verified === true`. A learner who types correct JavaScript could be marked wrong.
- Capital letters stay strict on purpose: `Result.Verified` is a different name in JavaScript.
- Ideas: (a) ignore all spaces when comparing, or (b) keep the current rule and let Gemini list the no-space form in `acceptedAnswers`. Option (a) is a small code change plus a test; option (b) touches `docs/lesson-schema.md`, so Ian approves and both AIs are told.
- Watch out: ignoring all spaces could accept wrong answers in other lessons, for example `a b` and `ab`. Decide per exercise type.
- Not part of Milestone 1. Found Nov 9, 2026 while discussing `normalizeAnswer`.

## Automate Google tools (for example NotebookLM)
- Why: after each unit, upload the lesson file and command log without doing it by hand.
- Open questions: does the tool have a public way to automate it, and does it fit the no-autopilot rule? Research first, then decide.

## Install-tools lessons (Windows)
- Why: Ian wants to see how the usual developer tools are installed (Node.js, VS Code, Git, GitHub account), so a beginner has an idea of the setup.
- Smallest first version (hakbang-architect, Nov 10, 2026): one normal lesson with the current format. Diagram = the four tools and what each is for. Task and check = concept questions. Leave `exercise` and `bugCheck` out (they are optional). No schema change.
- Later, if step-by-step screenshots are wanted: a new optional `steps` block in `docs/lesson-schema.md`. Ian approves, and both AIs are told.
- Watch out: the validator rejects `"unit": 0` today, so pick a unit number or allow 0 first. Use official download pages only.
- Milestone 2, not Milestone 1.

## Recap questions on earlier topics (spaced review)
- Why: Ian learns best by repetition with new examples. The approved design already has a "Review now" card.
- Smallest first version: a Review screen that re-asks the `check` questions of lessons already passed, starting with the oldest. Needs one new optional saved field (a date such as `checkLastSeen`) with a default in `parseProgress`. No lesson schema change, no `schemaVersion` bump.
- Richer version: a per-unit `recap` list written by Gemini. That adds an optional field to the lesson schema (Ian approves, both AIs told).
- Wait for the Review screen. Milestone 2.

## Learning roadmap and the 8 fundamentals (Nov 10, 2026)
Source: a BreakPoint reel (one creator's opinion, so compare with the monthly job research). The 8: programming basics, DSA, how the web works, databases and SQL, Git, debugging, testing, security basics.
- Covered: how the web works (Unit 1), conditions and one logic bug check.
- Order agreed by hakbang-architect and Fable: finish Milestone 1 first (Tasks A and B, bug check screen, tracer, Export / Import, phone-width check). Then Milestone 2: Unit 0, then Security 1 (secrets and `.env`, "never trust what arrives", using `parseProgress` and `validateLesson` as examples), then Testing, Git, reading error messages, lists and loops. Later: login and permissions, private data, SQL, simple data structures.
- Method upgrades, in order: predict before step (free with the tracer), explain-it-back, reading real error messages, then spaced review.
- Real examples already in Ian's own work: the `git add` typo error (debugging), `npm test` (testing), `.gitignore` (secrets).
- Privacy: use look-alike examples only. Never copy code or records from the lab system.

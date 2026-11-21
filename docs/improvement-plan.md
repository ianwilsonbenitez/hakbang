# Hakbang improvement plan (Nov 15, 2026)

Written by Claude Fable 5.2 after reading all of `src/`, Unit 1, and the docs.
**Status: approved by Ian on Nov 17, 2026 ("go na yan").** Schema changes and new libraries still need Ian's OK first, one at a time.

**Detailed designs for items 8–15 and 19–20 are in `docs/design-phases-c-d-f.md`. Read that file before building any of those items.**

For the AI that continues this work: follow `CLAUDE.md` as usual (plan first, no autopilot, tests for logic, one small step per session). Each numbered item below is sized for one or two study sessions.

## The goal behind every item

Ian said two things: reading code makes him sleepy, and he wants both real learning and a good portfolio piece. So every change must do at least one of these:

- make the learner **do** something before reading (predict, choose, arrange, explain), or
- make a mastery pip **mean** something, or
- make the repo look like junior-developer work to a recruiter.

The lesson method to aim for is **PRIMM**, a known way to teach beginners to read code:

| Step | Meaning | Where it lives in Hakbang |
| --- | --- | --- |
| Predict | Guess what the code does before running | Tracer "Think first" |
| Run | Watch it run | Tracer Step button |
| Investigate | Explain why it did that | Explain-back (new, Phase C) |
| Modify | Change one thing and see the difference | Tracer with several inputs (new, Phase F) |
| Make | Write a small piece yourself | Exercise, later Parsons (Phase F) |

## Phase A. Close Milestone 1

1. **(done)** **Export / Import** with a round-trip test (already next on the roadmap). Reuse `parseProgress` for the imported file, so bad files are handled the same way as bad storage.
2. **(done)** **Show why a lesson was rejected.** `validateLesson` already returns `errors` with a `path` and a `code`, but `App.tsx` shows only `t.lessonInvalid`. Add one text per `LessonErrorCode` to `en.ts` / `tl.ts` and list `path: message` under the alert.
3. **(done)** **Phone-width check** in English and Taglish.

## Phase B. Portfolio basics (small, high value)

4. **README.md.** It is still the Vite template. Replace with: what Hakbang is, a screenshot, how to run it, how lessons are validated, how two AIs share the repo, and what Ian learned. Ian writes the "what I learned" part himself.
5. **(done)** **LICENSE file.** Ian chooses (MIT is the usual choice for "others can use it").
6. **(done)** **Deploy on Vercel** and put the live link at the top of the README.
7. **(done)** **GitHub Actions**: one small file, `.github/workflows/ci.yml`, that runs `npm test` and `npm run build` on every push. It does not replace Ian running them himself; it shows recruiters a green check and teaches what CI is.

## Phase C. Make the pips honest

Today a learner can reach Level 3 by guessing: the bug check allows unlimited free taps on 6 lines, and the check shows the right answers and allows an instant retry.

Rule to keep: **the learner is never left stuck.** A full, correct explanation always appears. What changes is what gets recorded and what counts.

8. **(done)** **Record attempts.** New optional fields in `LessonProgress` (no `schemaVersion` bump; defaults in `parseProgress`):
   - `bugCheckWrongTaps` (whole number, the fewest is kept, like hints)
   - `checkAttempts` (whole number, goes up by one per finish)
   Show them quietly ("Found after 2 wrong taps"). Tests for each new `mark…` function.
9. **Explain-back in the bug check** (this is in the approved design, screen 4). After the right line is tapped: a text box "In your own words, why is this a bug?" Then show the model answer (`bugCheck.why`) next to what the learner wrote, with two buttons: "Mine says the same" / "Not quite yet". Save only the yes/no as `bugCheckExplained`. The typed text is not saved in the first version.
10. **New Level 3 rule** in `getMastery`: check passed **and** bug found **and** `bugCheckExplained === true` (when the lesson has a bug check). Update `mastery.test.ts`.
11. **(done)** **Shuffle the options on a check retry**, so a retry is not "tap the same position". A pure function `shuffleOptions(options, random)` with the random source passed in, so the test can control it.
12. **Tracer "Think first" needs a commitment.** No schema change: the learner must type a short guess before "Show answer" unlocks. Later (schema change, needs approval): `predict.options` + `predict.answer`, shaped like a `task`, so the guess is a tap.
13. **Score colour**: "Your score" is green even at 0 of 3. Use amber below `CHECK_PASS_SCORE`.

Later, with the Review screen: Level 3 is "confirmed" only when the check is passed again on a different day. That needs a saved date, as already noted in `later-ideas.md`.

## Phase D. One thing per screen

14. "Try it" stacks five panels (task, tracer, exercise, check, bug check). Split the lesson into steps: **Picture → Explain → Task → Trace → Build → Check**. Add `getLessonSteps(lesson)` in `lesson-flow.ts` that leaves out steps a lesson does not have; test it. Keep the "hidden, not removed" pattern so typed answers survive.
15. Show small step dots and "2 of 6", so a 10-minute lesson feels short.

## Phase E. Hakbang teaches Hakbang

This answers the Milestone 1 line "Ian can explain, without AI, what each main file does", and it is the portfolio story: *the app's lessons trace the app's own code.*

16. **Lessons from our own functions** (Gemini writes them, in the normal format; these are our own code, so no privacy issue):

    | Function | File | Idea it teaches |
    | --- | --- | --- |
    | `unlockNextHint` | `exercise.ts` | `Math.min` as a ceiling |
    | `isBugLine` | `bug-check.ts` | `===` returns true or false |
    | `parseLanguage` | `language.ts` | `? :` picks one of two values |
    | `markCheckScore` | `progress.ts` | `Math.max`, keeping the best |
    | `getNodeStatus` | `skill-map.ts` | order of `if` checks matters |
    | `isAcceptedAnswer` | `exercise.ts` | `.some()` over a list |

    Each one gets a tracer and a bug check (for example `Math.max` swapped for `Math.min`).

    **Needed first (Claude):** `App.tsx` imports only `unit-01`. Before these lessons can be seen, the app must load every file in `content/lessons/`, validate each one, and give each a node on the map. Plan this as its own item before item 16. The full brief for Gemini is in `docs/gemini-brief.md`.
17. **Ian writes 3 to 5 lines per session.** Claude writes a failing test first; Ian writes the function body; `npm test` turns green. First candidates: `isCheckPassed(score)` in `mastery.ts`, `countFinishedNodes(...)`, `backupFileName(date)` for Export.
18. Replace reading `docs/file-map.md` with a one-minute explain-back in chat at the start of a session: one file, three sentences, in Ian's words.

## Phase F. Richer practice (schema changes, Ian approves, tell Gemini)

19. **Tracer scenarios.** `tracer.scenarios[]`, each with its own `predict` and `steps` (for example `hoursAhead = 6`, then `12`). The learner sees the same code take a different path. Old lessons with a single `steps` list keep working.
20. **Parsons exercise**: the lines of a short function are shown shuffled and the learner taps them into the right order. No typing, works well on a phone, and research on beginners finds it teaches almost as well as writing code in less time. New optional `arrange` block.

## Phase G. Match the approved design

21. Top bar with the language and theme switches at the top right (today they are large buttons under the title, with a "Theme: Dark" line).
22. Skill map: dot-grid background, the selected-skill panel with its 3 steps and a "Continue lesson" button, and pip labels that can be read on a phone (`title` does not show on touch).
23. A node with no lesson says "Coming soon", not "Locked". Nothing unlocks it, so "Locked" is misleading.
24. Exercise panel: when already solved, show the accepted answer inside the code instead of an empty box.

## Phase H. Content notes for Gemini (Ian passes these on)

25. **Unit 1 jumps.** The explanation is about browser, server and database, but the exercise asks the learner to type `result.verified === true`. `if`, `===` and the dot are only in the glossary. Either move the code parts to Unit 0, or add them to the explanation with one example each.
26. The bug check prompt gives the answer away ("=== checks, a single = overwrites"). Move that sentence to `why`.
27. Unit 0 as two short lessons (values, then function and return), as already agreed.
28. Validator additions on Claude's side: allow `unit: 0`; reject two options with the same `id`; reject an exercise whose `code` has no `____`.

## Phase I. Later

29. **Offline and installable (PWA).** Self-host the two fonts, add a manifest and a service worker. Probably needs one library (`vite-plugin-pwa`), so ask Ian first.
30. **AI feedback on explanations.** A paid AI API is outside v1. The free Gemini API is planned for Phase 4. Until then the model answer plus the self-check in item 9 does the job, and Ian can paste an explanation into chat for a second opinion.

## Suggested order

A (1–3) → B (4–7) → C (8–13) → D (14–15) → E (16–18, start item 17 right away, alongside everything else) → H in parallel through Gemini → G → F → I.

## Study habits that keep it from being sleepy

- 20 to 25 minute blocks, then stand up. Stop while it is still interesting.
- Never start by reading code. Start with a question: "what will this return for 6?" Then look.
- Say the answer out loud or type it before revealing anything.
- One new symbol per session, written on a card (`!`, `&&`, `===`), used the same day.
- End each session by writing three lines of what was learned, without looking.

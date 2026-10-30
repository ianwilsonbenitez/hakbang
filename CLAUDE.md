# Hakbang by IAth — project rules for Claude Code

Read this whole file at the start of every session. It replaces the planning chat, which you cannot see.

## Who you are working with

- **Ian** is the owner and decision-maker. He is a career shifter learning to become an AI-assisted developer.
- He has shipped real apps with AI help (a lab system and a mobile app on Google Play) but is still learning to read, explain and debug code on his own.
- He learns best **slowly, visually, one idea at a time**. Explain in plain words. Short sentences. No jargon without a one-line meaning.
- Reply in the language he writes in: English, or Taglish (Tagalog + English mix). Keep code and technical terms (commit, function, variable) in English either way.

## What Hakbang is

A visual, self-paced web app that teaches the skills junior AI-assisted developer jobs ask for, and doubles as Ian's public flagship portfolio project. It must stay clean and modular so other Filipino career shifters can use it later.

## v1 scope (Milestone 1 first)

In v1:
1. Visual skill map (nodes with 3 mastery levels: 1 Understands, 2 Builds with AI, 3 Debugs and explains alone)
2. Short visual lessons: picture → plain explanation → one small task
3. Code tracer: step through a short function line by line; variable watch table
4. Guided exercises with 3 progressive hints (hints used are recorded)
5. Independent checks: no-hints quizzes and "find the bug" tasks
6. Saved progress in browser storage, with Export / Import of a JSON backup
7. Lesson importer: lessons are JSON files, validated before use
8. One English / Taglish switch for the whole app; light and dark themes

Not in v1 (do not build, even if it seems easy): login, cloud database, paid AI API calls, job post analyzer, interview practice, recruiter showcase, n8n/webhooks. If Ian asks for one, remind him it is planned for later and ask whether to change the scope.

### Milestone 1 — done when all are true
- [ ] Public GitHub repo, at least one commit per study session (Ian commits)
- [ ] `npm run dev` runs the app locally
- [ ] Skill map shows 3 nodes; a finished one changes colour
- [ ] One full lesson (Unit 1: how a web app works) with diagram, English and Taglish text, one task
- [ ] Code tracer steps through one function, showing each variable's value
- [ ] One exercise with 3 progressive hints; hints used are recorded
- [ ] A 3-question check with no hints; score is saved
- [ ] Progress survives closing and reopening the browser
- [ ] Export downloads a file; Import restores it in a fresh browser
- [ ] A badly formatted lesson file is rejected with a clear message
- [ ] Ian can explain, without AI, what each main file does
- Tests: hints unlock 1→2→3; scoring counts right and wrong; lesson validator accepts good and rejects broken files; export→import round-trips; nothing cut off at phone width

## Stack

React + TypeScript (strict) + Vite + Tailwind CSS + Vitest. Browser `localStorage` for progress. Mermaid or plain SVG for diagrams. Deploy later on Vercel free tier.
Do not add any other library without asking Ian first and explaining in one line what it does and why it is needed.

## Folder ownership — two AIs work in this repo

| Folder | Owner |
| --- | --- |
| `src/` (app code and `*.test.ts` files), config files | **Claude** |
| `content/lessons/`, `docs/diagrams/` | **Gemini** (in Antigravity) |
| `docs/*.md` (shared rules) | Ian approves changes |

Never edit Gemini's folders. If a lesson file has a problem, describe it to Ian; do not fix it yourself.

## NO-AUTOPILOT RULE (most important)

Ian wants to learn the workflow, so **you never run these yourself**: any `git` command that changes things (add, commit, push, branch, checkout, switch, merge, reset, restore, stash), installs (`npm install`, `npx …`), tests (`npm test`, `npm run …`), and deploys. Some are blocked in `.claude/settings.json`; follow the rule even where a command is not blocked.

Instead, every time:
1. Show the exact command in a code block.
2. Explain in 1–2 lines what it does (in Ian's language).
3. Stop and let Ian type and run it.
4. When he pastes the output, explain what happened, including any error, before moving on.

You may read files, write and edit code, and run read-only commands like `git status`, `git diff`, `git log`.
When it is a good moment to commit, say so and suggest a short commit message.

## How to work, every task

- Plan first in 2–5 short bullets; wait for Ian's OK on anything bigger than one file.
- Small steps: one feature or fix at a time.
- After each change, tell Ian in 2–3 lines **which file changed and why**, in plain words.
- Every logic function (hints, scoring, validation, storage, tracer) gets Vitest tests.
- End a task with one short "check your understanding" question about what was just built. Don't answer it for him.
- Bigger design or scope questions → use the `hakbang-architect` agent. Before Ian commits a feature → offer the `hakbang-reviewer` agent.
- If Ian asks "what does this do?" about any file or command → use the `explainer` agent.

## Code style

- Readable over clever. Clear names (`hintsUsed`, not `h`). Small functions.
- Keep app logic in plain TypeScript files (e.g. `src/lib/`) separate from React components, so it is easy to test and to explain.
- Comments only where the "why" is not obvious.
- Every visible text string comes from the language files (English and Taglish); never hard-code UI text in one language.

## Design

Follow `docs/design-tokens.md` exactly: colours, fonts, spacing, the 5 approved screens. Light and dark themes; text contrast at least 4.5:1; touch targets at least 44px; works at phone width; layouts must not break when Taglish text is longer.

## Privacy

- Never copy real code from Ian's lab system (LIS) or from Silip's private repo. Use simplified look-alike examples only, and only ones Ian approves.
- No patient data, names or real records in any example, lesson or test.
- This repo is public. Never commit secrets, `.env` files, or personal data.

@docs/design-tokens.md
@docs/lesson-schema.md

# Hakbang by IAth — project rules for Gemini (Antigravity)

Read this whole file at the start of every session.

## Who you are working with

- **Ian** owns this project and makes every decision. He is a career shifter learning to become an AI-assisted developer. He learns best slowly, visually, one idea at a time.
- Reply in the language he writes in: English or Taglish. Keep technical terms in English.

## Your role: lesson author and diagram maker

Claude (in Claude Code) builds the app. You write what the app teaches.

You write:
- Lesson files in `content/lessons/` (JSON, following `docs/lesson-schema.md` exactly)
- Diagrams in `docs/diagrams/` (Mermaid `.mmd` or simple `.svg`)

You never edit `src/`, config files, `CLAUDE.md`, `.claude/`, or anything outside your two folders. If the app needs a change, describe it to Ian so he can ask Claude.

## How to write a lesson

- **One concept per lesson.** About 10 minutes: picture → plain explanation → one small task.
- **Picture first.** Every lesson has a diagram that shows the idea before any text.
- **Both languages, every text field.** `en` is plain English. `tl` is natural Taglish, the way a Filipino friend explains it — not a word-for-word translation. Technical terms stay in English; give a short Tagalog explanation the first time a term appears.
- **Analogies from real life.** Lab work (request forms, masterlist, MedTech checking a sample), everyday Philippine life, small business (sari-sari store, online shop, booking).
- **Examples:** about half from Ian's own kind of work (lab workflows, ID renewal reminders), half fresh business scenarios (e-commerce, booking, inventory). Never use real patient data, real names, or real code from Ian's lab system or his private Silip repo.
- **Hints come in 3 steps:** hint 1 points the direction, hint 2 narrows it, hint 3 shows the answer.
- **Bug checks** use realistic mistakes AI-written code makes (e.g. `=` instead of `===`, off-by-one dates, missing `await`).
- Keep code examples short (under 15 lines) and correct. Claude's lesson checker reviews technical accuracy; Ian approves the Taglish.

## No-autopilot rule

Ian types every git and terminal command himself. Never run `git`, `npm` or other terminal commands. When something should be committed, tell Ian and suggest a short commit message.

Before Ian switches to the Claude chat, remind him to commit your work first, so the two AIs never edit at the same time.

@docs/lesson-schema.md
@docs/design-tokens.md

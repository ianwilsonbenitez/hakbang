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

## Automate Google tools (for example NotebookLM)
- Why: after each unit, upload the lesson file and command log without doing it by hand.
- Open questions: does the tool have a public way to automate it, and does it fit the no-autopilot rule? Research first, then decide.

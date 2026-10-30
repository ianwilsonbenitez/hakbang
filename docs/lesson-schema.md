# Lesson file format (v1, approved by Ian on Oct 30, 2026)

Shared contract between Gemini (writes lessons) and Claude (builds the importer that checks them).
Change it only with Ian's approval, then tell both AIs.

One lesson = one JSON file in `content/lessons/`, named like `unit-01-how-web-apps-work.json`.

Every piece of text the learner reads is an object with **both** languages:

```json
{ "en": "Plain English", "tl": "Natural na Taglish" }
```

The importer rejects a lesson if any such field is missing `en` or `tl`.

## Shape

```json
{
  "schemaVersion": 1,
  "id": "unit-01-how-web-apps-work",
  "unit": 1,
  "title": { "en": "How a web app works", "tl": "Paano gumagana ang web app" },
  "minutes": 10,
  "diagram": {
    "file": "docs/diagrams/unit-01-how-web-apps-work.svg",
    "alt": { "en": "Browser sends a request to the server, which saves to the database and replies.", "tl": "..." }
  },
  "explain": [
    { "en": "First short paragraph.", "tl": "..." }
  ],
  "glossary": [
    { "term": "request", "en": "A message the browser sends to the server.", "tl": "..." }
  ],
  "task": {
    "question": { "en": "An Encoder tries to release a result. Which part says no?", "tl": "..." },
    "options": [
      { "id": "a", "text": { "en": "The browser", "tl": "Ang browser" } },
      { "id": "b", "text": { "en": "The server", "tl": "Ang server" } },
      { "id": "c", "text": { "en": "The database", "tl": "Ang database" } }
    ],
    "answer": "b",
    "why": { "en": "The rule lives on the server.", "tl": "..." }
  },
  "exercise": {
    "prompt": { "en": "Fill in the blank so ...", "tl": "..." },
    "code": "function canRelease(result) {\n  if (____) {\n    return true;\n  }\n  return false;\n}",
    "acceptedAnswers": ["result.verified === true", "result.verified == true"],
    "hints": [
      { "en": "Hint 1: direction", "tl": "..." },
      { "en": "Hint 2: narrower", "tl": "..." },
      { "en": "Hint 3: the answer", "tl": "..." }
    ]
  },
  "bugCheck": {
    "prompt": { "en": "Tap the line with the bug.", "tl": "..." },
    "code": "function canRelease(result) {\n  if (result.verified = true) {\n    return true;\n  }\n  return false;\n}",
    "bugLine": 2,
    "why": { "en": "= assigns a value; === compares.", "tl": "..." }
  },
  "check": [
    {
      "question": { "en": "Question 1 (no hints)", "tl": "..." },
      "options": [
        { "id": "a", "text": { "en": "...", "tl": "..." } },
        { "id": "b", "text": { "en": "...", "tl": "..." } }
      ],
      "answer": "a",
      "why": { "en": "...", "tl": "..." }
    }
  ],
  "tracer": {
    "code": "function checkWarranty(days) {\n  if (days <= 30) {\n    return \"valid\";\n  }\n  return \"expired\";\n}",
    "predict": {
      "question": { "en": "Before stepping: days is 18. Will line 3 run?", "tl": "..." },
      "answer": { "en": "Yes, because 18 <= 30 is true.", "tl": "..." }
    },
    "steps": [
      {
        "line": 2,
        "vars": { "days": "18" },
        "condition": "18 <= 30 → true",
        "note": { "en": "The computer checks the condition.", "tl": "..." }
      },
      {
        "line": 3,
        "vars": { "days": "18" },
        "skippedLines": [5],
        "note": { "en": "The condition was true, so it returns \"valid\".", "tl": "..." }
      }
    ]
  }
}
```

## Rules

- `explain`: 1–4 short paragraphs. `hints`: exactly 3. `options`: 2–4.
- `task` and `check` are required. `exercise`, `bugCheck`, `glossary` and `tracer` are optional per lesson.
- `check`: exactly 3 questions, each shaped like `task`. The app shows them with no hints.
- `answer` (in `task` and in every `check` question) must match one option `id`.
- `bugLine` counts from 1 and must be inside the code (not more than its number of lines).
- `exercise.acceptedAnswers`: 1 or more strings. The app trims the learner's answer and squeezes repeated spaces before comparing, so list only real alternatives, not spacing variants.
- Code strings use `\n` for new lines, under 15 lines.

## Diagram

- One `.svg` file in `docs/diagrams/`, written by hand (no library needed). `diagram.file` points to it.
- Use no fixed colours that clash with the themes: prefer `currentColor` for lines and text, so the diagram works in light and dark.
- `diagram.alt` is shown to screen readers and when the image fails to load.

## Tracer

The tracer does not run the code. Gemini writes every step by hand, so the numbers are always right and the app needs no interpreter.

- `tracer.code`: under 15 lines, line numbers count from 1.
- `tracer.predict`: the "predict first" question shown before the first step, with its answer.
- `tracer.steps`: in order. Each step has:
  - `line`: the line the ▶ points to (inside the code).
  - `vars`: every variable the computer remembers at that step, name → value as text (`"18"`, `"true"`).
  - `note`: bilingual plain explanation of this step.
  - `condition` (optional): the worked-out condition, e.g. `"18 <= 30 → true"`. Plain text, same in both languages.
  - `skippedLines` (optional): lines the computer skipped, shown faded.

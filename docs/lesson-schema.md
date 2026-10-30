# Lesson file format (draft v1)

Shared contract between Gemini (writes lessons) and Claude (builds the importer that checks them).
**Draft:** the `hakbang-architect` agent confirms or adjusts this in Milestone 1. Change it only with Ian's approval, then tell both AIs.

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
    "file": "docs/diagrams/unit-01-how-web-apps-work.mmd",
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
    "answer": "result.verified === true",
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
  }
}
```

## Rules

- `explain`: 1–4 short paragraphs. `hints`: exactly 3. `options`: 2–4.
- `exercise`, `bugCheck` and `glossary` are optional per lesson; `task` is required.
- Code strings use `\n` for new lines, under 15 lines.
- Code tracer examples (step-by-step variable values) will get their own section once the tracer is built.

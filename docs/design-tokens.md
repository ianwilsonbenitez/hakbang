# Design tokens — Concept A "Visual Learning Studio" (approved Oct 30, 2026)

Calm, readable developer-tool look. Not childish, not a generic dashboard. No gradient washes, no decorative charts, no emoji icons.

## Colours

| Token | Dark (default) | Light (ivory paper) | Used for |
| --- | --- | --- | --- |
| `bg` | `#0F1115` | `#F6F3EC` | Page background |
| `surface` | `#12151B` | `#FFFDF7` | Panels, code area |
| `surface-raised` | `#151826` | `#FFFFFF` | Selected / focus panel |
| `border` | `#232733` | `#E2DDD1` | Panel borders (1px) |
| `border-strong` | `#2A2F3A` | `#D6D0C2` | Buttons, inputs |
| `text` | `#E8EAF0` | `#1C1E23` | Main text |
| `text-muted` | `#B7BCC7` | `#474B54` | Secondary text |
| `text-subtle` | `#9BA1AD` | `#5B5F68` | Labels, captions |
| `accent` (indigo) | `#8B97FF` | `#3540A8` | Navigation, current step, primary buttons, progress |
| `success` (mint) | `#5ED1A3` | `#2F7D5B` | Mastery pips, passed checks, "true" |
| `review` (amber) | `#F2B866` | `#8A4B14` | Review cards, no-hints checks, warnings |

Text must meet 4.5:1 contrast on its background. Colours that must be told apart also differ in lightness.

## Type

- UI and lesson text: **Inter** (400, 500, 600, 700). Body 15–18px, line-height 1.55–1.65.
- Code, tracer, small labels: **JetBrains Mono** (400, 600). Code 15px, line-height 1.9.
- Small caps labels: mono, 11–12px, letter-spacing 0.04–0.06em, uppercase.

## Shape and spacing

- Radius: 8px (small), 10px (buttons, inputs), 12px (cards), 16px (panels).
- Spacing steps: 4, 8, 12, 16, 20, 24, 28, 32px.
- Touch targets at least 44px tall.
- Skill map panel: dot-grid background (1px dots every 20px).
- Desktop: sidebar + content. Phone: sidebar stacks above content; panels stack.

## The 5 approved screens

1. **Skill map** — sidebar (Skill map, Lessons, Review, Progress & backup; "Review now" card; weekly hours box, no streaks). Nodes in 4 columns (Foundations, JavaScript, Debugging, React); each node shows 3 mastery pips. Right panel: selected skill, its 3 steps, "Continue lesson" and "Open in code tracer".
2. **Code tracer** — code on the left with line numbers, ▶ on the current line, inline notes (`days = 18`, `false, skipped`), skipped lines faded; Reset / Previous / Step; step dots. Right: "VARIABLE WATCH — What the computer remembers" (Taglish: "Ang tanda ng computer"), the condition worked out (`18 <= 30 → true`), plain explanation, and a "predict first" question before stepping.
3. **Lesson (focus mode)** — no sidebar. Top bar: close, unit name, steps Picture · Explain · Try it, language and theme switches. Diagram first, then plain explanation, then one small task.
4. **Exercise** — left (indigo): guided exercise with a blank to fill and 3 hints unlocking in order, "Hints used: x of 3". Right (amber): "Bug check · no hints", tap the buggy line, explain why in a text box.
5. **Progress & backup** — skills by level, hours per week vs 3–4h target (recovery weeks are normal), backup: last backup date, Export, Import with a preview and a warning before replacing newer progress.

Language switch (English / Taglish) and theme switch sit top right on every screen.

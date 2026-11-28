import type { LocalizedText } from './language'

// The lesson file always has exactly 3 hints (see docs/lesson-schema.md).
export const MAX_HINTS = 3

// Trims the ends and squeezes repeated spaces, so "result.verified   ===  true " still matches.
export function normalizeAnswer(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

export function isAcceptedAnswer(acceptedAnswers: string[], answer: string): boolean {
  const cleaned = normalizeAnswer(answer)
  return acceptedAnswers.some((accepted) => normalizeAnswer(accepted) === cleaned)
}

// Hints unlock in order: 0 -> 1 -> 2 -> 3, and stop at 3.
export function unlockNextHint(hintsUsed: number): number {
  return Math.min(hintsUsed + 1, MAX_HINTS)
}

// Only the hints already unlocked. Hint 2 can never show before hint 1.
export function visibleHints(hints: LocalizedText[], hintsUsed: number): LocalizedText[] {
  return hints.slice(0, hintsUsed)
}

export function canUnlockMoreHints(hintsUsed: number): boolean {
  return hintsUsed < MAX_HINTS
}

// The blank the learner fills in. Lesson code marks it with four underscores.
export const BLANK = '____'

export type SplitCode = { before: string; after: string }

// Cuts the code at the first blank, so the app can put the answer in its place.
// Returns null when the code has no blank.
export function splitAtBlank(code: string): SplitCode | null {
  const blankStart = code.indexOf(BLANK)
  if (blankStart === -1) return null
  return {
    before: code.slice(0, blankStart),
    after: code.slice(blankStart + BLANK.length),
  }
}

// What goes in the blank once the exercise is solved: the learner's own answer
// if they just typed it, otherwise the lesson's first accepted answer
// (for example after closing and reopening the app).
export function answerToShow(
  justSolved: boolean,
  typedAnswer: string,
  acceptedAnswers: string[],
): string {
  return justSolved ? normalizeAnswer(typedAnswer) : acceptedAnswers[0]
}

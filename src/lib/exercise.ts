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

import type { TracerStep } from './lesson'

// Step numbers here start at 0, like a list. The screen shows them as "step 1, 2, 3".

// Moves forward one step and stops at the last one.
export function nextStepIndex(current: number, totalSteps: number): number {
  return Math.min(current + 1, totalSteps - 1)
}

// Moves back one step and stops at the first one.
export function previousStepIndex(current: number): number {
  return Math.max(current - 1, 0)
}

export function isLastStep(current: number, totalSteps: number): boolean {
  return current >= totalSteps - 1
}

// Line numbers count from 1, like the lesson file says.
export function isLineSkipped(step: Pick<TracerStep, 'skippedLines'>, lineNumber: number): boolean {
  return step.skippedLines?.includes(lineNumber) === true
}

// The variable watch table: one row for each variable the computer remembers at this step.
export function getVarRows(vars: Record<string, string>): { name: string; value: string }[] {
  return Object.entries(vars).map(([name, value]) => ({ name, value }))
}

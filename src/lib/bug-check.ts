// Splits the lesson's code into lines, so the screen can show one tappable row per line.
export function getCodeLines(code: string): string[] {
  return code.split('\n')
}

// Adds a wrong line to the list of lines already tried. Returns a new list.
// Tapping the same wrong line again does not count twice.
export function addWrongLine(wrongLines: number[], lineNumber: number): number[] {
  return wrongLines.includes(lineNumber) ? wrongLines : [...wrongLines, lineNumber]
}

// Short enough to be easy, long enough that one word or a few letters do not count as an explanation.
export const MIN_EXPLANATION_LENGTH = 15

// The learner must write something real before the model answer is shown next to it.
export function isExplanationReady(text: string): boolean {
  return text.trim().length >= MIN_EXPLANATION_LENGTH
}

// Lines count from 1, like the lesson file says. Only the exact bug line is right.
export function isBugLine(bugLine: number, tappedLine: number): boolean {
  return tappedLine === bugLine
}

// Splits the lesson's code into lines, so the screen can show one tappable row per line.
export function getCodeLines(code: string): string[] {
  return code.split('\n')
}

// Lines count from 1, like the lesson file says. Only the exact bug line is right.
export function isBugLine(bugLine: number, tappedLine: number): boolean {
  return tappedLine === bugLine
}

// Vite reads every SVG in docs/diagrams/ as plain text when the app is built.
// New diagrams from Gemini are picked up automatically; no code change needed.
const bundledDiagrams = import.meta.glob('../../docs/diagrams/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// "docs/diagrams/unit-01.svg" and "../../docs/diagrams/unit-01.svg" both end with "unit-01.svg".
function fileName(path: string): string {
  return path.split('/').pop() ?? path
}

// Returns the SVG text for a lesson's diagram.file, or null when no such file was bundled.
export function findDiagram(
  file: string,
  diagrams: Record<string, string> = bundledDiagrams,
): string | null {
  const wanted = fileName(file)
  const match = Object.keys(diagrams).find((path) => fileName(path) === wanted)
  return match === undefined ? null : diagrams[match]
}

// Diagrams are inserted into the page as raw HTML, so they must never contain scripts.
// This is a simple check for our own files. Uploaded SVGs from other people (later) need a stricter one.
const UNSAFE_SVG_PATTERNS: RegExp[] = [
  /<script/i,
  /<foreignObject/i,
  /\son[a-z]+\s*=/i, // onload=, onclick=, ...
  /javascript:/i,
]

export function isSafeSvg(svg: string): boolean {
  return !UNSAFE_SVG_PATTERNS.some((pattern) => pattern.test(svg))
}

export function listBundledDiagrams(): Record<string, string> {
  return bundledDiagrams
}

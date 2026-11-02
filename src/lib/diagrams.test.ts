import { describe, expect, it } from 'vitest'
import unit01 from '../../content/lessons/unit-01-how-web-apps-work.json'
import { findDiagram, isSafeSvg, listBundledDiagrams } from './diagrams'

const fakeDiagrams = {
  '../../docs/diagrams/a.svg': '<svg>a</svg>',
  '../../docs/diagrams/b.svg': '<svg>b</svg>',
}

describe('findDiagram', () => {
  it('finds a diagram by the path written in the lesson file', () => {
    expect(findDiagram('docs/diagrams/b.svg', fakeDiagrams)).toBe('<svg>b</svg>')
  })

  it('returns null when the file was not bundled', () => {
    expect(findDiagram('docs/diagrams/missing.svg', fakeDiagrams)).toBeNull()
  })

  it('finds the real diagram of Unit 1', () => {
    expect(findDiagram(unit01.diagram.file)).toContain('<svg')
  })
})

describe('isSafeSvg', () => {
  it('accepts a plain drawing', () => {
    expect(isSafeSvg('<svg><rect width="10" /><text>Hi</text></svg>')).toBe(true)
  })

  it.each([
    ['a script tag', '<svg><script>alert(1)</script></svg>'],
    ['an onload attribute', '<svg onload="alert(1)"></svg>'],
    ['an onclick attribute', '<svg><rect onclick = "x()" /></svg>'],
    ['a javascript: link', '<svg><a href="javascript:alert(1)"></a></svg>'],
    ['a foreignObject', '<svg><foreignObject></foreignObject></svg>'],
  ])('rejects %s', (_name, svg) => {
    expect(isSafeSvg(svg)).toBe(false)
  })

  it('every diagram in docs/diagrams/ is safe', () => {
    for (const svg of Object.values(listBundledDiagrams())) {
      expect(isSafeSvg(svg)).toBe(true)
    }
  })
})

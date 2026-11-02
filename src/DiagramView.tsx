import { findDiagram, isSafeSvg } from './lib/diagrams'

// Shows the lesson's SVG inline (not as <img>) so its currentColor follows the light / dark theme.
export function DiagramView({ file, alt }: { file: string; alt: string }) {
  const svg = findDiagram(file)

  // Missing or unsafe file: the alt text still explains the picture.
  if (svg === null || !isSafeSvg(svg)) {
    return <p className="text-text-muted">{alt}</p>
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className="mx-auto w-full max-w-md [&>svg]:h-auto [&>svg]:w-full"
      // Safe here: the SVG is a file from our own repo, checked by isSafeSvg above.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

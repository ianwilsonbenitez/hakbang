// Fisher-Yates: walk from the end, swap each item with a random one at or before it.
// Works on a copy, so the list that was passed in does not change.
// `random` gives a number from 0 up to (not including) 1; pass Math.random in the app.
export function shuffle<T>(items: T[], random: () => number): T[] {
  const result = [...items]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

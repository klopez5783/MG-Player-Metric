// Categories rated on their own and left out of the overall rating, which
// averages only the player-card skills. Matched by name since ids can change
// when the catalog is re-seeded. V16 uses the same names in SQL.
export const FOOTBALL_IQ = 'Football IQ'
export const PSYCHOLOGICAL = 'Psychological / Learning'

const separateRatings = [FOOTBALL_IQ, PSYCHOLOGICAL]

export function countsTowardOverall(categoryName: string): boolean {
  return !separateRatings.includes(categoryName)
}

// One category's rating from a saved evaluation; null if it wasn't rated.
export function ratingOf(attributes: { name: string; rating: number | null }[], categoryName: string): number | null {
  return attributes.find((a) => a.name === categoryName)?.rating ?? null
}

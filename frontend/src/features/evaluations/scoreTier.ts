// Score -> status color. Color is a secondary cue here; the numeric score is
// always shown alongside it, so nothing depends on color alone. Text shades
// are the -400 step so they stay legible on the dark canvas/surface colors.
export function scoreTier(score: number): { bar: string; text: string } {
  if (score >= 75) return { bar: 'bg-green-500', text: 'text-green-400' }
  if (score >= 50) return { bar: 'bg-amber-500', text: 'text-amber-400' }
  return { bar: 'bg-accent', text: 'text-red-400' }
}

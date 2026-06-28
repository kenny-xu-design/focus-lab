export function calculateAccuracy(correct: number, errors: number, missed = 0): number {
  const total = correct + errors + missed
  if (total === 0) return 0
  return Math.round((correct / total) * 100)
}

export function average(values: number[]): number {
  if (values.length === 0) return 0
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

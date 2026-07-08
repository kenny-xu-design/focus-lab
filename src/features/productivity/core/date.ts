export function getLocalDateKey(date: Date | number = Date.now()): string {
  const value = typeof date === 'number' ? new Date(date) : date
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(
    value.getDate(),
  ).padStart(2, '0')}`
}

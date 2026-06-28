type DatedRecord = {
  date: string
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(safeSeconds / 60)
  const rest = safeSeconds % 60
  if (minutes === 0) return `${rest} 秒`
  return `${minutes} 分 ${rest.toString().padStart(2, '0')} 秒`
}

export function dateKey(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`
}

export function getTodayCount(records: DatedRecord[]): number {
  const today = dateKey(new Date())
  return records.filter((record) => dateKey(record.date) === today).length
}

export function getRecentSevenDays(records: DatedRecord[]): { day: string; count: number }[] {
  return Array.from({ length: 7 }, (_, offset) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - offset))
    const key = dateKey(date)
    return {
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      count: records.filter((record) => dateKey(record.date) === key).length,
    }
  })
}

export function getStreakDays(records: DatedRecord[]): number {
  const activeDays = new Set(records.map((record) => dateKey(record.date)))
  let streak = 0
  const cursor = new Date()

  while (activeDays.has(dateKey(cursor))) {
    streak += 1
    cursor.setDate(cursor.getDate() - 1)
  }

  return streak
}

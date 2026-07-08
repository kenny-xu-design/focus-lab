import type { ProductivityData } from '../storage/productivityStorage'
import type { ProductivitySettings } from '../types/settingsTypes'

export type DailyRolloverSummary = {
  changed: boolean
  previousDate: string
  currentDate: string
  activatedCount: number
  deferredCount: number
  archivedCount: number
  keptActiveCount: number
  unchangedCount: number
}

export type DailyRolloverOptions = {
  now?: number
}

export function runDailyRollover(
  data: ProductivityData,
  todayDateKey: string,
  settings: ProductivitySettings,
  options: DailyRolloverOptions = {},
): DailyRolloverSummary {
  const summary: DailyRolloverSummary = {
    changed: false,
    previousDate: data.lastActiveDate,
    currentDate: todayDateKey,
    activatedCount: 0,
    deferredCount: 0,
    archivedCount: 0,
    keptActiveCount: 0,
    unchangedCount: 0,
  }

  if (data.lastActiveDate === todayDateKey) return summary

  const now = options.now ?? Date.now()
  data.tasks = data.tasks.map((task) => {
    if (task.deletedAt !== undefined) {
      summary.unchangedCount += 1
      return task
    }

    if (task.status === 'planned_tomorrow') {
      summary.changed = true
      summary.activatedCount += 1
      return {
        ...task,
        status: 'today_active',
        plannedForDate: todayDateKey,
        updatedAt: now,
        source: task.source === 'manual' ? task.source : 'rollover',
      }
    }

    if (task.status !== 'today_active' && task.status !== 'in_progress') {
      summary.unchangedCount += 1
      return task
    }

    if (settings.rolloverPolicy === 'keep_active') {
      summary.changed = true
      summary.keptActiveCount += 1
      return {
        ...task,
        status: 'today_active',
        plannedForDate: todayDateKey,
        updatedAt: now,
        rolloverCount: (task.rolloverCount ?? 0) + 1,
      }
    }

    if (settings.rolloverPolicy === 'archive_unfinished') {
      summary.changed = true
      summary.archivedCount += 1
      return { ...task, status: 'archived', updatedAt: now }
    }

    summary.changed = true
    summary.deferredCount += 1
    return { ...task, status: 'deferred', updatedAt: now }
  })

  data.lastActiveDate = todayDateKey
  summary.changed = true
  return summary
}

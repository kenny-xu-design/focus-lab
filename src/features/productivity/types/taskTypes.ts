export type TaskStatus =
  | 'inbox'
  | 'planned_tomorrow'
  | 'today_active'
  | 'in_progress'
  | 'done'
  | 'deferred'
  | 'archived'

export type TaskSource = 'manual' | 'rollover' | 'imported'

export type Task = {
  id: string
  title: string
  note?: string
  status: TaskStatus
  plannedForDate?: string
  createdAt: number
  updatedAt: number
  completedAt?: number
  startedAt?: number
  order: number
  estimatedPomodoros: number
  completedPomodoros: number
  totalFocusMs: number
  source: TaskSource
  rolloverCount?: number
  syncVersion?: number
  deviceId?: string
  updatedByDevice?: string
  deletedAt?: number
}

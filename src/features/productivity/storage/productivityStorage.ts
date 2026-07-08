import type { PomodoroSession, DistractionEvent } from '../types/pomodoroTypes'
import type { ProductivitySettings } from '../types/settingsTypes'
import { defaultProductivitySettings } from '../types/settingsTypes'
import type { Task } from '../types/taskTypes'
import { getLocalDateKey } from '../core/date'

export type ProductivityData = {
  schemaVersion: 1
  lastActiveDate: string
  tasks: Task[]
  sessions: PomodoroSession[]
  distractionEvents: DistractionEvent[]
  settings: ProductivitySettings
}

export type ProductivityStorageAdapter = {
  load: () => Promise<ProductivityData>
  save: (data: ProductivityData) => Promise<void>
  exportJson?: () => Promise<string>
  importJson?: (json: string) => Promise<ProductivityData>
}

export function createDefaultProductivityData(now = Date.now()): ProductivityData {
  return {
    schemaVersion: 1,
    lastActiveDate: getLocalDateKey(now),
    tasks: [],
    sessions: [],
    distractionEvents: [],
    settings: defaultProductivitySettings,
  }
}

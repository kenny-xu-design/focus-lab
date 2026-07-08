import type { ProductivityData } from '../storage/productivityStorage'
import { defaultProductivitySettings } from '../types/settingsTypes'
import type { Task } from '../types/taskTypes'

const sampleNow = 1767168000000

function createSampleTask(overrides: Partial<Task>): Task {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    title: overrides.title ?? 'Sample task',
    status: overrides.status ?? 'inbox',
    createdAt: sampleNow,
    updatedAt: sampleNow,
    order: overrides.order ?? 0,
    estimatedPomodoros: overrides.estimatedPomodoros ?? 1,
    completedPomodoros: overrides.completedPomodoros ?? 0,
    totalFocusMs: overrides.totalFocusMs ?? 0,
    source: overrides.source ?? 'manual',
    ...overrides,
  }
}

export function createDailyRolloverFixture(): ProductivityData {
  return {
    schemaVersion: 1,
    lastActiveDate: '2026-07-07',
    settings: defaultProductivitySettings,
    sessions: [],
    distractionEvents: [],
    tasks: [
      createSampleTask({
        id: 'task-planned',
        title: 'Plan tomorrow focus block',
        status: 'planned_tomorrow',
        order: 1,
      }),
      createSampleTask({
        id: 'task-active',
        title: 'Unfinished active task',
        status: 'today_active',
        plannedForDate: '2026-07-07',
        order: 2,
      }),
      createSampleTask({
        id: 'task-inbox',
        title: 'Inbox idea',
        status: 'inbox',
        order: 3,
      }),
    ],
  }
}

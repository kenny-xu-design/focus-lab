export type RolloverPolicy = 'defer_unfinished' | 'keep_active' | 'archive_unfinished'

export type ProductivitySettings = {
  focusDurationMs: number
  breakDurationMs: number
  longBreakDurationMs: number
  sessionsBeforeLongBreak: number
  soundEnabled: boolean
  notificationEnabled: boolean
  alwaysOnTop: boolean
  autoStartBreak: boolean
  autoStartNextFocus: boolean
  rolloverPolicy: RolloverPolicy
  capsuleModeOnStart: boolean
  globalShortcut?: string
  syncVersion?: number
  deviceId?: string
  updatedByDevice?: string
}

export const defaultProductivitySettings: ProductivitySettings = {
  focusDurationMs: 25 * 60 * 1000,
  breakDurationMs: 5 * 60 * 1000,
  longBreakDurationMs: 15 * 60 * 1000,
  sessionsBeforeLongBreak: 4,
  soundEnabled: true,
  notificationEnabled: true,
  alwaysOnTop: false,
  autoStartBreak: false,
  autoStartNextFocus: false,
  rolloverPolicy: 'defer_unfinished',
  capsuleModeOnStart: true,
  globalShortcut: undefined,
}

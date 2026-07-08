export type PomodoroPhase = 'focus' | 'break' | 'long_break'

export type PomodoroStatus = 'idle' | 'running' | 'paused' | 'completed' | 'cancelled'

export type DistractionEvent = {
  id: string
  sessionId: string
  taskId: string
  elapsedMs: number
  phase: PomodoroPhase
  createdAt: number
  note?: string
  tag?: string
  syncVersion?: number
  deviceId?: string
  updatedByDevice?: string
  deletedAt?: number
}

export type PomodoroSession = {
  id: string
  taskId: string
  taskTitleSnapshot: string
  phase: PomodoroPhase
  status: PomodoroStatus
  focusDurationMs: number
  breakDurationMs: number
  longBreakDurationMs?: number
  phaseStartAt?: number
  phaseEndAt?: number
  pausedAt?: number
  remainingMsOnPause?: number
  startedAt: number
  completedAt?: number
  distractionEvents: DistractionEvent[]
  syncVersion?: number
  deviceId?: string
  updatedByDevice?: string
  deletedAt?: number
}

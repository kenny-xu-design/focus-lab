import type { PomodoroSession } from '../types/pomodoroTypes'
import type { ProductivitySettings } from '../types/settingsTypes'
import type { Task } from '../types/taskTypes'

export function createFocusSession(
  task: Task,
  settings: ProductivitySettings,
  id: string,
  now = Date.now(),
): PomodoroSession {
  return {
    id,
    taskId: task.id,
    taskTitleSnapshot: task.title,
    phase: 'focus',
    status: 'running',
    focusDurationMs: settings.focusDurationMs,
    breakDurationMs: settings.breakDurationMs,
    longBreakDurationMs: settings.longBreakDurationMs,
    phaseStartAt: now,
    phaseEndAt: now + settings.focusDurationMs,
    startedAt: now,
    distractionEvents: [],
  }
}

export function getSessionPhaseDurationMs(session: PomodoroSession): number {
  if (session.phase === 'break') return session.breakDurationMs
  if (session.phase === 'long_break') return session.longBreakDurationMs ?? session.breakDurationMs
  return session.focusDurationMs
}

export function getSessionRemainingMs(session: PomodoroSession, now = Date.now()): number {
  if (session.status === 'paused') return Math.max(0, session.remainingMsOnPause ?? 0)
  if (session.status !== 'running' || session.phaseEndAt === undefined) {
    return Math.max(0, session.remainingMsOnPause ?? getSessionPhaseDurationMs(session))
  }

  return Math.max(0, session.phaseEndAt - now)
}

export function isSessionPhaseComplete(session: PomodoroSession, now = Date.now()): boolean {
  return session.status === 'running' && getSessionRemainingMs(session, now) === 0
}

export function startBreakPhase(
  session: PomodoroSession,
  settings: ProductivitySettings,
  completedFocusCount: number,
  now = Date.now(),
): PomodoroSession {
  const shouldUseLongBreak =
    settings.sessionsBeforeLongBreak > 0 && completedFocusCount % settings.sessionsBeforeLongBreak === 0
  const nextPhase = shouldUseLongBreak ? 'long_break' : 'break'
  const durationMs = shouldUseLongBreak ? settings.longBreakDurationMs : settings.breakDurationMs
  const shouldAutoStart = settings.autoStartBreak

  return {
    ...session,
    phase: nextPhase,
    status: shouldAutoStart ? 'running' : 'paused',
    breakDurationMs: settings.breakDurationMs,
    longBreakDurationMs: settings.longBreakDurationMs,
    phaseStartAt: now,
    phaseEndAt: shouldAutoStart ? now + durationMs : undefined,
    pausedAt: shouldAutoStart ? undefined : now,
    remainingMsOnPause: shouldAutoStart ? undefined : durationMs,
  }
}

export function pauseSession(session: PomodoroSession, now = Date.now()): PomodoroSession {
  if (session.status !== 'running') return session

  return {
    ...session,
    status: 'paused',
    pausedAt: now,
    remainingMsOnPause: getSessionRemainingMs(session, now),
  }
}

export function resumeSession(session: PomodoroSession, now = Date.now()): PomodoroSession {
  if (session.status !== 'paused') return session

  const remainingMs = getSessionRemainingMs(session, now)
  return {
    ...session,
    status: 'running',
    pausedAt: undefined,
    remainingMsOnPause: undefined,
    phaseStartAt: now,
    phaseEndAt: now + remainingMs,
  }
}

export function completeSession(session: PomodoroSession, now = Date.now()): PomodoroSession {
  if (session.status === 'completed') return session

  return {
    ...session,
    status: 'completed',
    phaseEndAt: now,
    completedAt: now,
    remainingMsOnPause: 0,
  }
}

export function cancelSession(session: PomodoroSession, now = Date.now()): PomodoroSession {
  if (session.status === 'completed' || session.status === 'cancelled') return session

  return {
    ...session,
    status: 'cancelled',
    phaseEndAt: now,
    completedAt: now,
    remainingMsOnPause: getSessionRemainingMs(session, now),
  }
}

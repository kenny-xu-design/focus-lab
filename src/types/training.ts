export type TrainingCategory =
  | 'memory'
  | 'focusTimer'
  | 'startup'
  | 'antiDistraction'
  | 'breathing'
  | 'planning'

export type GameCategory =
  | 'visualSearch'
  | 'conflictControl'
  | 'inhibition'
  | 'reactionControl'

export type Difficulty = 'easy' | 'medium' | 'hard'

export type TrainingToolType =
  | 'numberPathMemory'
  | 'pomodoro'
  | 'startup'
  | 'distraction'
  | 'breathing'
  | 'implementationPlan'

export type GameType =
  | 'symbolHunter'
  | 'colorConflict'
  | 'focusArrow'
  | 'impulseBrake'

export type TrainingMethod = {
  id: string
  name: string
  category: TrainingCategory
  duration: string
  difficulty: Difficulty
  goal: string
  scene: string
  description: string
  targetUsers: string[]
  steps: string[]
  advancedTips: string[]
  notices: string[]
  toolType: TrainingToolType
}

export type AttentionGame = {
  id: string
  name: string
  category: GameCategory
  duration: string
  difficulty: Difficulty
  goal: string
  description: string
  metrics: string[]
  gameType: GameType
}

export type TrainingRecord = {
  participantId?: string
  installationId?: string
  id: string
  type: 'training'
  methodId: string
  methodName: string
  date: string
  durationSeconds: number
  errors?: number
  mindWanderingCount?: number
  distractionCount?: number
  distractionTypes?: Record<string, number>
  taskName?: string
  result?: string
  note?: string
  extra?: Record<string, unknown>
}

export type GameRecord = {
  participantId?: string
  installationId?: string
  id: string
  type: 'game'
  gameId: string
  gameName: string
  date: string
  durationSeconds: number
  correctCount?: number
  errorCount?: number
  missedCount?: number
  accuracy?: number
  averageReactionTime?: number
  maxStreak?: number
  extra?: Record<string, unknown>
}

export type ImplementationPlan = {
  id: string
  situation: string
  action: string
  createdAt: string
}

export type NumberLayoutSnapshot = {
  id: string
  methodId: string
  methodName: string
  mode: 'search' | 'grouped' | 'fullPath'
  label: string
  numbers: number[]
  createdAt: string
}

export type LocalParticipant = {
  id: string
  nickname: string
  createdAt: string
}

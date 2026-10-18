import type { GameRecord, ImplementationPlan, LocalParticipant, NumberLayoutSnapshot, TrainingRecord } from '../types/training'

export type TrainingArchive = {
  records: TrainingRecord[]
  gameRecords: GameRecord[]
  plans: ImplementationPlan[]
  layoutSnapshots: NumberLayoutSnapshot[]
  participant: LocalParticipant
  installationId: string
}

export function newLocalParticipant(): LocalParticipant {
  return { id: crypto.randomUUID(), nickname: '我的练习档案', createdAt: new Date().toISOString() }
}

export function migrateTrainingArchive(persisted: unknown): TrainingArchive {
  const state = (persisted && typeof persisted === 'object' ? persisted : {}) as Partial<TrainingArchive>
  return {
    records: Array.isArray(state.records) ? state.records : [],
    gameRecords: Array.isArray(state.gameRecords) ? state.gameRecords : [],
    plans: Array.isArray(state.plans) ? state.plans : [],
    layoutSnapshots: Array.isArray(state.layoutSnapshots) ? state.layoutSnapshots : [],
    participant: state.participant ?? newLocalParticipant(),
    installationId: state.installationId ?? crypto.randomUUID(),
  }
}

export function trainingBackup(state: TrainingArchive) {
  return { schemaVersion: 1, exportedAt: new Date().toISOString(), storageVersion: 3,
    data: { participant: state.participant, installationId: state.installationId, records: state.records,
      gameRecords: state.gameRecords, plans: state.plans, layoutSnapshots: state.layoutSnapshots } }
}

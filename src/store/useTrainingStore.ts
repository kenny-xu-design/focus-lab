import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameRecord, ImplementationPlan, NumberLayoutSnapshot, TrainingRecord } from '../types/training'
import { migrateTrainingArchive, newLocalParticipant, type TrainingArchive } from '../utils/trainingPersistence'

type TrainingStore = TrainingArchive & {
  records: TrainingRecord[]
  gameRecords: GameRecord[]
  plans: ImplementationPlan[]
  layoutSnapshots: NumberLayoutSnapshot[]
  addRecord: (record: TrainingRecord) => void
  addGameRecord: (record: GameRecord) => void
  addPlan: (plan: ImplementationPlan) => void
  addLayoutSnapshot: (snapshot: NumberLayoutSnapshot) => void
  deleteLayoutSnapshot: (id: string) => void
  deletePlan: (id: string) => void
  clearRecords: () => void
  setNickname: (nickname: string) => void
}

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set) => ({
      records: [],
      gameRecords: [],
      plans: [],
      layoutSnapshots: [],
      participant: newLocalParticipant(),
      installationId: crypto.randomUUID(),
      setNickname: (nickname) => set((state) => ({ participant: { ...state.participant, nickname: nickname.trim().slice(0, 40) || '我的练习档案' } })),
      addRecord: (record) => set((state) => ({ records: [{ ...record, participantId: state.participant.id, installationId: state.installationId }, ...state.records] })),
      addGameRecord: (record) => set((state) => ({ gameRecords: [{ ...record, participantId: state.participant.id, installationId: state.installationId }, ...state.gameRecords] })),
      addPlan: (plan) => set((state) => ({ plans: [plan, ...state.plans] })),
      addLayoutSnapshot: (snapshot) =>
        set((state) => ({ layoutSnapshots: [snapshot, ...state.layoutSnapshots].slice(0, 30) })),
      deleteLayoutSnapshot: (id) =>
        set((state) => ({ layoutSnapshots: state.layoutSnapshots.filter((snapshot) => snapshot.id !== id) })),
      deletePlan: (id) => set((state) => ({ plans: state.plans.filter((plan) => plan.id !== id) })),
      clearRecords: () => set({ records: [], gameRecords: [] }),
    }),
    {
      name: 'focus-lab-training-records',
      version: 3,
      migrate: migrateTrainingArchive,
    },
  ),
)

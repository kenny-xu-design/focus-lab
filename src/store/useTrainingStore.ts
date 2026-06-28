import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameRecord, ImplementationPlan, NumberLayoutSnapshot, TrainingRecord } from '../types/training'

type TrainingStore = {
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
}

export const useTrainingStore = create<TrainingStore>()(
  persist(
    (set) => ({
      records: [],
      gameRecords: [],
      plans: [],
      layoutSnapshots: [],
      addRecord: (record) => set((state) => ({ records: [record, ...state.records] })),
      addGameRecord: (record) => set((state) => ({ gameRecords: [record, ...state.gameRecords] })),
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
      version: 2,
      migrate: (persisted) => {
        const state = persisted as Partial<TrainingStore>
        return {
          records: state.records ?? [],
          gameRecords: state.gameRecords ?? [],
          plans: state.plans ?? [],
          layoutSnapshots: state.layoutSnapshots ?? [],
        } as TrainingStore
      },
    },
  ),
)

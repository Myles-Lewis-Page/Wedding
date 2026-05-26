import { create } from 'zustand'

interface Venue {
  id: string
  name: string
  address: string
  isSelected: boolean
}

interface Settings {
  brideName: string
  groomName: string
  weddingDate: string
}

interface AppStore {
  settings: Settings | null
  selectedVenue: Venue | null
  setSettings: (s: Settings) => void
  setSelectedVenue: (v: Venue | null) => void
}

export const useAppStore = create<AppStore>((set) => ({
  settings: null,
  selectedVenue: null,
  setSettings: (settings) => set({ settings }),
  setSelectedVenue: (selectedVenue) => set({ selectedVenue }),
}))

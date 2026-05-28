import { create } from "zustand"
import { AIMode } from "@/types/ai"

export type FilterStatus = "all" | "enabled" | "disabled" | "constant"
export type SortOption = "order" | "name" | "group" | "modified"

interface EditorState {
  selectedEntryUid: number | null
  aiPanelOpen: boolean
  aiPanelMode: AIMode
  advancedOptionsExpanded: boolean
  searchQuery: string
  filterGroup: string | null
  filterStatus: FilterStatus
  sortBy: SortOption
  selectEntry: (uid: number | null) => void
  openAIPanel: (mode: AIMode) => void
  closeAIPanel: () => void
  toggleAdvanced: () => void
  setSearch: (query: string) => void
  setFilter: (group: string | null, status: FilterStatus) => void
  setSort: (sortBy: SortOption) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  selectedEntryUid: null,
  aiPanelOpen: false,
  aiPanelMode: "write",
  advancedOptionsExpanded: false,
  searchQuery: "",
  filterGroup: null,
  filterStatus: "all",
  sortBy: "order",

  selectEntry: (uid) => {
    set({ selectedEntryUid: uid, advancedOptionsExpanded: false })
  },

  openAIPanel: (mode) => {
    set({ aiPanelOpen: true, aiPanelMode: mode })
  },

  closeAIPanel: () => {
    set({ aiPanelOpen: false })
  },

  toggleAdvanced: () => {
    set((state) => ({ advancedOptionsExpanded: !state.advancedOptionsExpanded }))
  },

  setSearch: (query) => {
    set({ searchQuery: query })
  },

  setFilter: (group, status) => {
    set({ filterGroup: group, filterStatus: status })
  },

  setSort: (sortBy) => {
    set({ sortBy })
  },
}))
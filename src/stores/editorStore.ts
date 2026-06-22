import { create } from "zustand"

export type FilterStatus = "all" | "enabled" | "disabled" | "constant"
export type SortOption = "order" | "name" | "group" | "modified"
export type View = "editor" | "templates" | "ai-lorebook"

interface EditorState {
  view: View
  selectedEntryUid: number | null
  aiPanelOpen: boolean
  advancedOptionsExpanded: boolean
  searchQuery: string
  filterGroup: string | null
  filterStatus: FilterStatus
  sortBy: SortOption
  showDeleteConfirm: boolean
  setView: (view: View) => void
  selectEntry: (uid: number | null) => void
  openAIPanel: () => void
  closeAIPanel: () => void
  toggleAdvanced: () => void
  setSearch: (query: string) => void
  setFilter: (group: string | null, status: FilterStatus) => void
  setSort: (sortBy: SortOption) => void
  setShowDeleteConfirm: (show: boolean) => void
}

export const useEditorStore = create<EditorState>((set) => ({
  view: "editor",
  selectedEntryUid: null,
  aiPanelOpen: false,
  advancedOptionsExpanded: true,
  searchQuery: "",
  filterGroup: null,
  filterStatus: "all",
  sortBy: "order",
  showDeleteConfirm: false,

  setView: (view) => {
    set({ view })
  },

  selectEntry: (uid) => {
    set({ selectedEntryUid: uid })
  },

  openAIPanel: () => {
    set({ aiPanelOpen: true })
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

  setShowDeleteConfirm: (show) => {
    set({ showDeleteConfirm: show })
  },
}))
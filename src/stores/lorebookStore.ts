import { create } from "zustand"
import { Lorebook, LorebookEntry } from "@/types/lorebook"
import { LOREBOOK_DEFAULTS, ENTRY_DEFAULTS } from "@/lib/defaults"
import { useEditorStore } from "./editorStore"

interface LorebookState {
  lorebook: Lorebook | null
  isDirty: boolean
  loadLorebook: (data: Lorebook) => void
  createNewLorebook: (name: string) => void
  updateMetadata: (fields: Partial<Lorebook>) => void
  addEntry: () => number
  updateEntry: (uid: number, fields: Partial<LorebookEntry>) => void
  deleteEntry: (uid: number) => void
  duplicateEntry: (uid: number) => number
  moveEntry: (fromUid: number, toIndex: number) => void
  getEntry: (uid: number) => LorebookEntry | undefined
  getEntries: () => LorebookEntry[]
  getNextUid: () => number
  reset: () => void
  markClean: () => void
}

export const useLorebookStore = create<LorebookState>((set, get) => ({
  lorebook: null,
  isDirty: false,

  loadLorebook: (data) => {
    useEditorStore.getState().setSearch("")
    useEditorStore.getState().setFilter(null, "all")
    useEditorStore.getState().selectEntry(null)
    set({ lorebook: data, isDirty: false })
  },

  createNewLorebook: (name) => {
    useEditorStore.getState().setSearch("")
    useEditorStore.getState().setFilter(null, "all")
    useEditorStore.getState().selectEntry(null)
    set({
      lorebook: {
        ...LOREBOOK_DEFAULTS,
        name,
        entries: {},
      },
      isDirty: true,
    })
  },

  updateMetadata: (fields) => {
    const { lorebook } = get()
    if (!lorebook) return
    set({
      lorebook: { ...lorebook, ...fields },
      isDirty: true,
    })
  },

  addEntry: () => {
    const { lorebook, getNextUid } = get()
    if (!lorebook) return -1

    const uid = getNextUid()
    const newEntry: LorebookEntry = {
      ...ENTRY_DEFAULTS,
      uid,
      order: uid * 100,
    }

    set({
      lorebook: {
        ...lorebook,
        entries: { ...lorebook.entries, [String(uid)]: newEntry },
      },
      isDirty: true,
    })

    return uid
  },

  updateEntry: (uid, fields) => {
    const { lorebook } = get()
    if (!lorebook) return

    const entryKey = String(uid)
    const existing = lorebook.entries[entryKey]
    if (!existing) return

    set({
      lorebook: {
        ...lorebook,
        entries: {
          ...lorebook.entries,
          [entryKey]: { ...existing, ...fields },
        },
      },
      isDirty: true,
    })
  },

  deleteEntry: (uid) => {
    const { lorebook } = get()
    if (!lorebook) return

    const entries = { ...lorebook.entries }
    delete entries[String(uid)]

    set({
      lorebook: { ...lorebook, entries },
      isDirty: true,
    })
  },

  duplicateEntry: (uid) => {
    const { lorebook, getNextUid } = get()
    if (!lorebook) return -1

    const original = lorebook.entries[String(uid)]
    if (!original) return -1

    const newUid = getNextUid()
    const newEntry: LorebookEntry = {
      ...original,
      uid: newUid,
      comment: `${original.comment} (copy)`,
      order: original.order + 1,
    }

    set({
      lorebook: {
        ...lorebook,
        entries: { ...lorebook.entries, [String(newUid)]: newEntry },
      },
      isDirty: true,
    })

    return newUid
  },

  moveEntry: (fromUid, toIndex) => {
    const { lorebook, getEntries } = get()
    if (!lorebook) return

    const entries = getEntries()
    const fromEntry = entries.find((e) => e.uid === fromUid)
    if (!fromEntry) return

    const newOrder = toIndex * 100
    const updatedEntries = { ...lorebook.entries }
    updatedEntries[String(fromUid)] = { ...fromEntry, order: newOrder }

    set({
      lorebook: { ...lorebook, entries: updatedEntries },
      isDirty: true,
    })
  },

  getEntry: (uid) => {
    const { lorebook } = get()
    if (!lorebook) return undefined
    return lorebook.entries[String(uid)]
  },

  getEntries: () => {
    const { lorebook } = get()
    if (!lorebook) return []
    return Object.values(lorebook.entries).sort((a, b) => a.order - b.order)
  },

  getNextUid: () => {
    const { lorebook } = get()
    if (!lorebook || Object.keys(lorebook.entries).length === 0) return 0
    const maxUid = Math.max(...Object.values(lorebook.entries).map((e) => e.uid))
    return maxUid + 1
  },

  reset: () => {
    set({ lorebook: null, isDirty: false })
  },

  markClean: () => {
    set({ isDirty: false })
  },
}))
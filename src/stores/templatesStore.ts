import { create } from "zustand"
import { CharacterTemplate } from "@/types/templates"
import { generateUid } from "@/lib/utils"
import { exportTemplates, importTemplates } from "@/lib/templateFile"

interface TemplatesState {
  templates: CharacterTemplate[]
  isDirty: boolean
  loadFromStorage: () => void
  saveToStorage: () => void
  addTemplate: (name: string, data: string) => string
  updateTemplate: (id: string, fields: Partial<Pick<CharacterTemplate, "name" | "data">>) => void
  deleteTemplate: (id: string) => void
  getTemplate: (id: string) => CharacterTemplate | undefined
  getAll: () => CharacterTemplate[]
  importFromFile: (file: File) => Promise<{ added: number; overwritten: number }>
  exportToFile: (filename?: string) => void
  markClean: () => void
}

export const useTemplatesStore = create<TemplatesState>((set, get) => ({
  templates: [],
  isDirty: false,

  loadFromStorage: () => {
    try {
      const stored = localStorage.getItem("loregenius-templates")
      if (stored) {
        const templates = JSON.parse(stored) as CharacterTemplate[]
        set({ templates, isDirty: false })
      }
    } catch {
      // ignore
    }
  },

  saveToStorage: () => {
    const { templates } = get()
    localStorage.setItem("loregenius-templates", JSON.stringify(templates))
  },

  addTemplate: (name, data) => {
    const existing = get().templates.find((t) => t.name === name)
    if (existing) {
      throw new Error(`Template with name "${name}" already exists`)
    }
    const id = String(generateUid())
    const now = Date.now()
    const template: CharacterTemplate = {
      id,
      name,
      data,
      createdAt: now,
      updatedAt: now,
    }
    set((state) => ({
      templates: [...state.templates, template],
      isDirty: true,
    }))
    get().saveToStorage()
    return id
  },

  updateTemplate: (id, fields) => {
    set((state) => ({
      templates: state.templates.map((t) =>
        t.id === id ? { ...t, ...fields, updatedAt: Date.now() } : t
      ),
      isDirty: true,
    }))
    get().saveToStorage()
  },

  deleteTemplate: (id) => {
    set((state) => ({
      templates: state.templates.filter((t) => t.id !== id),
      isDirty: true,
    }))
    get().saveToStorage()
  },

  getTemplate: (id) => {
    return get().templates.find((t) => t.id === id)
  },

  getAll: () => {
    return get().templates
  },

  importFromFile: async (file) => {
    const { templates } = get()
    const imported = await importTemplates(file)
    let added = 0
    let overwritten = 0

    const newTemplates = [...templates]
    for (const imp of imported.templates) {
      const existingIndex = newTemplates.findIndex((t) => t.name === imp.name)
      if (existingIndex >= 0) {
        newTemplates[existingIndex] = {
          ...newTemplates[existingIndex],
          data: imp.data,
          updatedAt: Date.now(),
        }
        overwritten++
      } else {
        newTemplates.push({
          id: String(generateUid()),
          name: imp.name,
          data: imp.data,
          createdAt: imp.createdAt,
          updatedAt: imp.updatedAt,
        })
        added++
      }
    }

    set({ templates: newTemplates, isDirty: true })
    get().saveToStorage()
    return { added, overwritten }
  },

  exportToFile: (filename) => {
    exportTemplates(get().templates, filename)
    get().markClean()
  },

  markClean: () => {
    set({ isDirty: false })
  },
}))

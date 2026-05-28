import { create } from "zustand"
import { AppSettings } from "@/types/settings"
import { AIConfig } from "@/types/ai"

const DEFAULT_AI_CONFIG: AIConfig = {
  provider: "openai-compatible",
  endpoint: "http://localhost:1234/v1",
  apiKey: "",
  model: "",
  systemPrompt:
    "You are a creative writing assistant specializing in worldbuilding and lore creation for roleplay. Write concise, factual, and evocative lore entries.",
  temperature: 0.7,
  maxTokens: 1024,
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: "dark",
  sidebarExpanded: true,
  autoSave: "off",
  showTokenCount: true,
  ai: DEFAULT_AI_CONFIG,
}

interface SettingsState {
  settings: AppSettings
  updateSettings: (fields: Partial<AppSettings>) => void
  updateAIConfig: (fields: Partial<AIConfig>) => void
  resetToDefaults: () => void
  loadFromStorage: () => void
  saveToStorage: () => void
}

function getStoredSettings(): AppSettings | null {
  try {
    const stored = localStorage.getItem("loregenius-settings")
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) }
    }
  } catch {
    // ignore
  }
  return null
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (fields) => {
    set((state) => ({
      settings: { ...state.settings, ...fields },
    }))
    get().saveToStorage()
  },

  updateAIConfig: (fields) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ai: { ...state.settings.ai, ...fields },
      },
    }))
    get().saveToStorage()
  },

  resetToDefaults: () => {
    set({ settings: { ...DEFAULT_SETTINGS, ai: { ...DEFAULT_AI_CONFIG } } })
    get().saveToStorage()
  },

  loadFromStorage: () => {
    const stored = getStoredSettings()
    if (stored) {
      set({ settings: stored })
    }
  },

  saveToStorage: () => {
    const { settings } = get()
    localStorage.setItem("loregenius-settings", JSON.stringify(settings))
  },
}))
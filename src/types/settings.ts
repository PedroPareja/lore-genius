import { AIConfig } from "./ai"

export type Theme = "dark" | "light" | "system"
export type AutoSaveInterval = "off" | "5s" | "10s" | "30s"

export interface AppSettings {
  theme: Theme
  sidebarExpanded: boolean
  autoSave: AutoSaveInterval
  showTokenCount: boolean
  ai: AIConfig
}
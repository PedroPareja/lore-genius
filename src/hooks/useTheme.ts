import { useEffect } from "react"
import { useSettingsStore } from "@/stores"

type Theme = "dark" | "light" | "system"

export function useTheme() {
  const { settings, updateSettings } = useSettingsStore()

  useEffect(() => {
    const applyTheme = (theme: Theme) => {
      const root = document.documentElement
      if (theme === "system") {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        root.classList.toggle("dark", prefersDark)
      } else {
        root.classList.toggle("dark", theme === "dark")
      }
    }

    applyTheme(settings.theme)

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => {
      if (settings.theme === "system") {
        applyTheme("system")
      }
    }
    mediaQuery.addEventListener("change", handler)
    return () => mediaQuery.removeEventListener("change", handler)
  }, [settings.theme])

  const setTheme = (theme: Theme) => {
    updateSettings({ theme })
  }

  const toggleTheme = () => {
    const next = settings.theme === "dark" ? "light" : settings.theme === "light" ? "system" : "dark"
    setTheme(next)
  }

  return { theme: settings.theme, setTheme, toggleTheme }
}
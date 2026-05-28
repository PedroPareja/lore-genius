import { useEffect, useRef } from "react"
import { useLorebookStore, useSettingsStore } from "@/stores"

export function useAutoSave() {
  const { lorebook, isDirty, markClean } = useLorebookStore()
  const { settings } = useSettingsStore()
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (settings.autoSave === "off" || !isDirty || !lorebook) {
      return
    }

    const delay = parseInt(settings.autoSave.replace("s", "")) * 1000

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem("lorebook-draft", JSON.stringify(lorebook))
        markClean()
      } catch {
        // localStorage quota exceeded - ignore
      }
    }, delay)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [lorebook, isDirty, settings.autoSave, markClean])
}
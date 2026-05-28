import { useEffect } from "react"
import { useLorebookStore, useEditorStore } from "@/stores"

interface ShortcutAction {
  key: string
  ctrl?: boolean
  shift?: boolean
  action: () => void
}

export function useKeyboardShortcuts() {
  const { addEntry, deleteEntry, duplicateEntry, lorebook } = useLorebookStore()
  const { selectedEntryUid, openAIPanel, selectEntry, aiPanelOpen, closeAIPanel, setShowDeleteConfirm } = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const isInput =
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable

      // Allow Escape to work everywhere; block other shortcuts when typing
      if (isInput && e.key !== "Escape") return

      const ctrl = e.ctrlKey || e.metaKey
      const shift = e.shiftKey

      const shortcuts: ShortcutAction[] = [
        {
          key: "n",
          ctrl: true,
          action: () => {
            e.preventDefault()
            const uid = addEntry()
            selectEntry(uid)
          },
        },
        {
          key: "s",
          ctrl: true,
          action: () => {
            e.preventDefault()
          },
        },
        {
          key: "i",
          ctrl: true,
          action: () => {
            e.preventDefault()
          },
        },
        {
          key: "f",
          ctrl: true,
          action: () => {
            e.preventDefault()
          },
        },
        {
          key: "g",
          ctrl: true,
          action: () => {
            e.preventDefault()
            if (aiPanelOpen) {
              closeAIPanel()
            } else {
              openAIPanel("write")
            }
          },
        },
        {
          key: ".",
          ctrl: true,
          action: () => {
            e.preventDefault()
          },
        },
        {
          key: "a",
          ctrl: true,
          shift: true,
          action: () => {
            e.preventDefault()
            if (selectedEntryUid !== null) {
              openAIPanel("write")
            }
          },
        },
        {
          key: "Delete",
          action: () => {
            if (selectedEntryUid !== null) {
              setShowDeleteConfirm(true)
            }
          },
        },
        {
          key: "d",
          ctrl: true,
          action: () => {
            e.preventDefault()
            if (selectedEntryUid !== null) {
              const newUid = duplicateEntry(selectedEntryUid)
              selectEntry(newUid)
            }
          },
        },
        {
          key: "Escape",
          action: () => {
            if (aiPanelOpen) {
              closeAIPanel()
            }
          },
        },
      ]

      for (const shortcut of shortcuts) {
        const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase()
        const ctrlMatch = !!shortcut.ctrl === ctrl
        const shiftMatch = !!shortcut.shift === shift

        if (keyMatch && ctrlMatch && shiftMatch) {
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedEntryUid, aiPanelOpen, lorebook, addEntry, deleteEntry, duplicateEntry, selectEntry, openAIPanel, closeAIPanel, setShowDeleteConfirm])
}
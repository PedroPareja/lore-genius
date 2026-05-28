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
  const { selectedEntryUid, openAIPanel, selectEntry, aiPanelOpen, closeAIPanel } = useEditorStore()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
            if (selectedEntryUid !== null && lorebook) {
              deleteEntry(selectedEntryUid)
              selectEntry(null)
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
          key: "ArrowUp",
          action: () => {
            e.preventDefault()
          },
        },
        {
          key: "ArrowDown",
          action: () => {
            e.preventDefault()
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
        } else if (keyMatch && ctrlMatch && !shortcut.shift) {
          shortcut.action()
          break
        } else if (keyMatch && !shortcut.ctrl && !shift) {
          shortcut.action()
          break
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedEntryUid, aiPanelOpen, lorebook, addEntry, deleteEntry, duplicateEntry, selectEntry, openAIPanel, closeAIPanel])
}
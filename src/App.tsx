import { useEffect } from "react"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { AppShell } from "@/components/layout"
import { EntryEditor } from "@/components/editor"
import { SettingsPage } from "@/components/settings"
import { AIPanel } from "@/components/ai"
import { useEditorStore, useSettingsStore, useTemplatesStore } from "@/stores"
import { useKeyboardShortcuts, useAutoSave, useTheme } from "@/hooks"
import { TooltipProvider } from "@/components/ui"

function AppContent() {
  const { aiPanelOpen, closeAIPanel } = useEditorStore()

  useKeyboardShortcuts()
  useAutoSave()
  useTheme()

  return (
    <>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<EntryEditor />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
      <AIPanel open={aiPanelOpen} onClose={closeAIPanel} />
    </>
  )
}

export function App() {
  useEffect(() => {
    useSettingsStore.getState().loadFromStorage()
    useTemplatesStore.getState().loadFromStorage()
  }, [])

  return (
    <TooltipProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  )
}
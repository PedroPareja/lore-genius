import { Outlet, useNavigate } from "react-router-dom"
import { TopBar } from "./TopBar"
import { Sidebar } from "./Sidebar"
import { useEditorStore } from "@/stores"
import { TemplatesManager } from "@/components/templates"
import { AILorebookWizard } from "@/components/agent"

export function AppShell() {
  const navigate = useNavigate()
  const { view } = useEditorStore()

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      <TopBar onOpenSettings={() => navigate("/settings")} />
      <div className="flex-1 flex overflow-hidden">
        {view === "templates" || view === "ai-lorebook" ? null : <Sidebar />}
        <main className="flex-1 overflow-y-auto">
          {view === "templates" ? (
            <TemplatesManager />
          ) : view === "ai-lorebook" ? (
            <AILorebookWizard />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  )
}
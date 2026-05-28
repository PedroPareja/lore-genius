import { Outlet, useNavigate } from "react-router-dom"
import { TopBar } from "./TopBar"
import { Sidebar } from "./Sidebar"

export function AppShell() {
  const navigate = useNavigate()

  return (
    <div className="h-screen flex flex-col bg-bg-primary">
      <TopBar onOpenSettings={() => navigate("/settings")} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
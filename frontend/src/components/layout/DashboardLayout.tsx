import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { DashboardSidebar } from './DashboardSidebar'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-[#F9F9F9]">
      <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="relative flex flex-1 flex-col overflow-hidden">
        {/* Dot pattern background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="pointer-events-none absolute inset-0 z-0 bg-[#F9F9F9]/90" />

        {/* Mobile hamburger */}
        <div className="relative z-10 flex items-center px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Page content */}
        <div className="relative z-10 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

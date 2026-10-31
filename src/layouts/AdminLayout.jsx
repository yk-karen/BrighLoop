import { useState } from 'react'
import { Bell, ChevronDown, LogOut, Menu, PanelLeftClose, PanelLeftOpen, Search, Sparkles } from 'lucide-react'
import { Outlet } from 'react-router-dom'
import { SidebarNav } from '../components/SidebarNav'
import { useAuth } from '../context/AuthContext'
import { adminNavItems } from '../lib/navigation'

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { profile, signOut, isDemoMode } = useAuth()

  const logout = async () => {
    await signOut()
    window.location.assign('/login')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,191,163,0.15),transparent_30%),linear-gradient(180deg,#f7f5ff_0%,#f4f7ff_100%)] text-slate-900">
      {isDemoMode ? (
        <div className="border-b border-amber-200 bg-amber-500 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
          DEMO MODE — SAMPLE DATA
        </div>
      ) : null}
      <div className="flex min-h-screen">
        <aside
          className={[
            'border-r border-violet-100 bg-white/80 backdrop-blur-xl transition-all duration-300',
            collapsed ? 'w-24' : 'w-72',
          ].join(' ')}
        >
          <div className="flex items-center justify-between border-b border-slate-200/60 px-4 py-4">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-violet-400/40">
                B
              </div>
              {!collapsed ? (
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">Brightloop</p>
                  <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                    {profile?.role === 'admin' ? 'Admin' : 'Staff'}
                  </p>
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="rounded-xl border border-slate-200 bg-slate-50 p-1.5 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>

          <div className="px-3 pt-4">
            <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-indigo-50 p-3 text-slate-800">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.18em] text-violet-600">
                <Sparkles className="h-3.5 w-3.5" />
                Growth mode
              </div>
              {!collapsed ? (
                <p className="mt-3 text-sm text-slate-600">Revenue operations are trending up this month.</p>
              ) : null}
            </div>
          </div>

          <SidebarNav items={adminNavItems} collapsed={collapsed} />
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-10 border-b border-violet-100 bg-white/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setCollapsed((value) => !value)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 md:hidden"
                  aria-label="Toggle sidebar"
                >
                  <Menu className="h-4 w-4" />
                </button>
                <div className="hidden rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex md:items-center md:gap-2">
                  <Search className="h-4 w-4" />
                  Quick search
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                  aria-label="Notifications"
                >
                  <Bell className="h-4 w-4" />
                  <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-[#ff7b6b] ring-2 ring-white" />
                </button>
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 pr-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-500 text-xs font-bold text-white">
                    {profile?.first_name?.[0] || 'A'}{profile?.last_name?.[0] || 'K'}
                  </div>
                  <div className="hidden text-left sm:block">
                    <p className="text-sm font-semibold text-slate-900">{profile?.first_name || 'Alicia'} {profile?.last_name || 'Kim'}</p>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{profile?.role || 'staff'}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-slate-400" />
                </div>
                <button
                  type="button"
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main className="p-5 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

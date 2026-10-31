import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowRight, CreditCard, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { customerNavItems } from '../lib/navigation'

export function CustomerLayout() {
  const { profile, signOut, isDemoMode } = useAuth()

  const logout = async () => {
    await signOut()
    window.location.assign('/login')
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(163,140,255,0.15),transparent_30%),linear-gradient(180deg,#f8f5ff_0%,#f5f7ff_100%)] text-slate-900">
      {isDemoMode ? (
        <div className="border-b border-amber-200 bg-amber-500 px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.24em] text-white">
          DEMO MODE — SAMPLE DATA
        </div>
      ) : null}
      <header className="sticky top-0 z-20 border-b border-violet-100 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-violet-400/40">
              B
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Brightloop</p>
              <p className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Customer portal</p>
            </div>
          </div>

          <nav className="hidden items-center gap-2 md:flex">
            {customerNavItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  [
                    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/20'
                      : 'text-slate-600 hover:bg-violet-50 hover:text-violet-700',
                  ].join(' ')
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-violet-100 bg-violet-50 px-3 py-1.5 text-sm text-violet-700 sm:flex">
              <CreditCard className="h-4 w-4" />
              {profile?.company_name || 'Pro Plan'}
            </div>
            <Link
              to="/customer/subscriptions"
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
            >
              My account
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-violet-200 hover:text-violet-700"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  )
}

import { ArrowRight, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(164,140,255,0.20),transparent_28%),linear-gradient(180deg,#f6f3ff_0%,#eef3ff_100%)] px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-violet-100 bg-white/85 shadow-[0_30px_80px_rgba(79,70,229,0.12)] backdrop-blur-sm lg:grid-cols-2">
        <div className="flex flex-col justify-between bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 p-8 text-white lg:p-12">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-lg font-bold backdrop-blur">
              B
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.24em] text-violet-100">
              Brightloop
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">Run billing that keeps up.</h1>
          </div>

          <div className="mt-8 space-y-4 text-violet-100">
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3">
              <ShieldCheck className="h-5 w-5 text-[#f7b4a8]" />
              Real-time subscription insights for product and finance teams.
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3">
              <ShieldCheck className="h-5 w-5 text-[#f7b4a8]" />
              Flexible plans, invoices, and approvals in one workspace.
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">
              Welcome back
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Sign in</h2>
            <p className="mt-2 text-sm text-slate-600">
              Pick up where your revenue operations left off.
            </p>

            <form className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="name@brightloop.io"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-slate-600">
                <label className="inline-flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500" />
                  Keep me signed in
                </label>
                <a href="#" className="font-medium text-violet-600 hover:text-violet-700">
                  Forgot password?
                </a>
              </div>

              <Link
                to="/admin/dashboard"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700"
              >
                Sign in
                <ArrowRight className="h-4 w-4" />
              </Link>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Need an account?{' '}
              <Link to="/signup" className="font-semibold text-violet-600 hover:text-violet-700">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

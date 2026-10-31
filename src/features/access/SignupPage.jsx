import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const trustPoints = [
  'Unified billing workspace',
  'Smart collections and dunning',
  'Fast, audit-friendly workflows',
]

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,181,163,0.15),transparent_25%),linear-gradient(180deg,#f7f5ff_0%,#edf5ff_100%)] px-4 py-10">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-violet-100 bg-white/90 shadow-[0_24px_80px_rgba(79,70,229,0.10)] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="bg-gradient-to-br from-violet-100 via-white to-indigo-50 p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">Launch faster</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900">Start your subscription engine in minutes.</h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-slate-600">
            Brightloop helps subscription teams manage pricing, billing, taxes, and retention from a single operational cockpit.
          </p>

          <div className="mt-8 space-y-4">
            {trustPoints.map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-white/80 p-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-slate-700">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-500">Create account</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Get started</h2>

          <form className="mt-8 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-700">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-700">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="company" className="mb-2 block text-sm font-medium text-slate-700">
                Company
              </label>
              <input
                id="company"
                type="text"
                placeholder="Northstar Labs"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                Work email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <Link
              to="/admin/dashboard"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700"
            >
              Create account
              <ArrowRight className="h-4 w-4" />
            </Link>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-violet-600 hover:text-violet-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

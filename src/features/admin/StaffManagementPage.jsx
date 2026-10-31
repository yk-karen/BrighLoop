import { useState } from 'react'
import { CheckCircle2, ShieldCheck, Sparkles, UserPlus } from 'lucide-react'
import { PageHeader } from '../../components/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { createStaffUser } from '../../lib/adminStaffService'

export default function StaffManagementPage() {
  const { profile } = useAuth()
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!profile || profile.role !== 'admin') {
      setError('Only administrators can create staff accounts.')
      return
    }

    setLoading(true)
    const result = await createStaffUser({
      email: form.email,
      password: form.password,
      firstName: form.firstName,
      lastName: form.lastName,
    })
    setLoading(false)

    if (!result.ok) {
      setError(result.error)
      return
    }

    setSuccess('Staff account creation request was accepted by the trusted server endpoint.')
    setForm({ email: '', password: '', firstName: '', lastName: '' })
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff access"
        subtitle="Create staff accounts through a trusted server endpoint and keep service-role secrets off the client."
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <aside className="rounded-[30px] border border-violet-100 bg-gradient-to-br from-violet-600 via-indigo-600 to-violet-800 p-6 text-white shadow-[0_18px_50px_rgba(91,65,192,0.22)]">
          <div className="flex items-center gap-3 text-violet-100">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Admin-only</span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold">Trusted staff onboarding</h2>
          <p className="mt-3 text-sm leading-6 text-violet-100/90">
            This flow is intentionally routed to a secure backend endpoint so service-role credentials stay off the frontend.
          </p>

          <div className="mt-8 space-y-3 text-sm text-violet-100/90">
            {[
              'Creates staff profiles with the trusted server',
              'Keeps auth secrets outside the browser bundle',
              'Requires admin access to start the request',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/5 p-3">
                <Sparkles className="h-4 w-4 text-[#f7b4a8]" />
                {item}
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-[30px] border border-violet-100 bg-white/85 p-6 shadow-[0_18px_40px_rgba(91,65,192,0.08)]">
          <div className="flex items-center gap-2 text-violet-600">
            <UserPlus className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-[0.2em]">Create staff member</span>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-2 block text-sm font-medium text-slate-700">First name</label>
                <input
                  id="firstName"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="mb-2 block text-sm font-medium text-slate-700">Last name</label>
                <input
                  id="lastName"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">Work email</label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
            ) : null}

            {success ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <CheckCircle2 className="h-4 w-4" />
              {loading ? 'Sending request…' : 'Create staff account'}
            </button>
          </form>
        </section>
      </div>
    </div>
  )
}

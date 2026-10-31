import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const { validatePassword, clearRecovery, recoveryMode } = useAuth()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const [recoveryReady, setRecoveryReady] = useState(false)

  useEffect(() => {
    let isMounted = true

    const verifyRecoverySession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error || !session?.user) {
        setRecoveryReady(false)
        setCheckingSession(false)
        setError('This password reset link is invalid or has expired. Please request a new reset email.')
        return
      }

      setRecoveryReady(true)
      setCheckingSession(false)
      setError('')
    }

    verifyRecoverySession()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) {
        return
      }

      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryReady(Boolean(nextSession?.user))
        setCheckingSession(false)
        setError('')
      }

      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        setRecoveryReady(false)
      }
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [recoveryMode])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!recoveryReady) {
      setError('This password reset link is invalid or has expired. Please request a new reset email.')
      return
    }

    if (!form.password.trim() || !form.confirmPassword.trim()) {
      setError('Please enter and confirm your new password.')
      return
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const passwordError = validatePassword(form.password)
    if (passwordError) {
      setError(passwordError)
      return
    }

    setLoading(true)

    const { error: updateError } = await supabase.auth.updateUser({
      password: form.password,
    })

    setLoading(false)

    if (updateError) {
      setError(updateError.message || 'We could not save your new password. Please try again.')
      return
    }

    clearRecovery()
    setSuccess('Your password has been updated successfully. Redirecting to sign in…')
    setForm({ password: '', confirmPassword: '' })

    window.setTimeout(() => {
      navigate('/login', { replace: true })
    }, 1600)
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(164,140,255,0.18),transparent_28%),linear-gradient(180deg,#f7f5ff_0%,#edf2ff_100%)] px-4 py-10">
        <div className="w-full max-w-md rounded-[30px] border border-violet-100 bg-white/90 p-8 text-center shadow-[0_18px_50px_rgba(91,65,192,0.08)]">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <ShieldCheck className="h-5 w-5 animate-pulse" />
          </div>
          <p className="mt-4 text-sm text-slate-600">Verifying your recovery link…</p>
        </div>
      </div>
    )
  }

  if (!recoveryReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(164,140,255,0.18),transparent_28%),linear-gradient(180deg,#f7f5ff_0%,#edf2ff_100%)] px-4 py-10">
        <div className="w-full max-w-md rounded-[30px] border border-violet-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(91,65,192,0.08)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-lg font-bold text-white">
              B
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">Brightloop</p>
              <h1 className="text-2xl font-semibold text-slate-900">Reset password</h1>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">{error}</div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/forgot-password"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700"
            >
              Request a new link
            </Link>
            <Link
              to="/login"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(164,140,255,0.18),transparent_28%),linear-gradient(180deg,#f7f5ff_0%,#edf2ff_100%)] px-4 py-10">
      <div className="w-full max-w-md rounded-[30px] border border-violet-100 bg-white/90 p-6 shadow-[0_18px_50px_rgba(91,65,192,0.08)] sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-500 text-lg font-bold text-white">
            B
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">Brightloop</p>
            <h1 className="text-2xl font-semibold text-slate-900">Create a new password</h1>
          </div>
        </div>

        <p className="mt-6 text-sm leading-6 text-slate-600">
          Choose a strong password to finish resetting your account.
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
              New password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter a new password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-300 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>
          ) : null}

          {success ? (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="h-4 w-4" />
              {success}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-violet-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Saving…' : 'Save new password'}
          </button>
        </form>

        <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:text-violet-700">
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </div>
  )
}

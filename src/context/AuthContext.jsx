import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
}

const DEMO_STORAGE_KEY = 'brightloop-demo-session'
const DEMO_ENABLED = import.meta.env.VITE_ENABLE_DEMO_MODE === 'true'

const DEMO_USERS = {
  admin: {
    id: 'demo-admin-1',
    email: 'admin@brightloop.demo',
    role: ROLES.ADMIN,
    first_name: 'Alicia',
    last_name: 'Kim',
    company_name: 'Brightloop Ops',
    demoCustomerId: null,
  },
  staff: {
    id: 'demo-staff-1',
    email: 'staff@brightloop.demo',
    role: ROLES.STAFF,
    first_name: 'Jordan',
    last_name: 'Lee',
    company_name: 'Brightloop Staff',
    demoCustomerId: null,
  },
  customer: {
    id: 'demo-customer-1',
    email: 'customer@brightloop.demo',
    role: ROLES.CUSTOMER,
    first_name: 'Maya',
    last_name: 'Patel',
    company_name: 'Northstar Labs',
    demoCustomerId: 'cust-northstar',
  },
}

const AuthContext = createContext(null)

function validatePassword(password) {
  if (password.length <= 8) {
    return 'Password must be longer than 8 characters.'
  }

  const hasUppercase = /[A-Z]/.test(password)
  const hasLowercase = /[a-z]/.test(password)
  const hasSpecial = /[^A-Za-z0-9]/.test(password)

  if (!hasUppercase || !hasLowercase || !hasSpecial) {
    return 'Password must contain uppercase, lowercase and one special character.'
  }

  return ''
}

async function ensureProfile(user) {
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  if (!data) {
    throw new Error('Profile not found. Please contact support to complete account setup.')
  }

  return data
}

function readDemoSession() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.localStorage.getItem(DEMO_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeDemoSession(sessionData) {
  if (typeof window === 'undefined') {
    return
  }

  if (sessionData) {
    window.localStorage.setItem(DEMO_STORAGE_KEY, JSON.stringify(sessionData))
    return
  }

  window.localStorage.removeItem(DEMO_STORAGE_KEY)
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const refreshProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null)
      return null
    }

    const nextProfile = await ensureProfile(user)
    setProfile(nextProfile)
    return nextProfile
  }, [])

  const restoreDemoSession = useCallback(() => {
    if (!DEMO_ENABLED) {
      return null
    }

    const storedSession = readDemoSession()
    if (!storedSession) {
      return null
    }

    const nextProfile = {
      ...storedSession.profile,
      isDemo: true,
    }

    setSession({
      access_token: 'demo-access-token',
      user: {
        id: storedSession.profile.id,
        email: storedSession.profile.email,
        role: storedSession.profile.role,
      },
    })
    setProfile(nextProfile)
    setIsDemoMode(true)
    return nextProfile
  }, [])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      if (!supabase) {
        setSession(null)
        setProfile(null)
        setAuthError(DEMO_ENABLED ? '' : 'Supabase is not configured in this environment.')
        if (DEMO_ENABLED) {
          restoreDemoSession()
        }
        setLoading(false)
        return
      }

      const { data: { session: currentSession }, error } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error) {
        setAuthError(error.message)
      }

      if (currentSession?.user) {
        setSession(currentSession)
        try {
          await refreshProfile(currentSession.user)
        } catch (error) {
          setAuthError(error.message)
          setProfile(null)
        }
      } else {
        setSession(null)
        setProfile(null)
        if (DEMO_ENABLED) {
          restoreDemoSession()
        }
      }

      setLoading(false)
    }

    initialize()

    if (!supabase) {
      return () => {
        isMounted = false
      }
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!isMounted) {
        return
      }

      setSession(nextSession)
      setAuthError('')

      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true)
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'SIGNED_OUT') {
        setRecoveryMode(false)
      }

      if (nextSession?.user) {
        try {
          await refreshProfile(nextSession.user)
        } catch (error) {
          setAuthError(error.message)
        }
      } else {
        setProfile(null)
        setIsDemoMode(false)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [refreshProfile, restoreDemoSession])

  const signIn = useCallback(async ({ email, password }) => {
    setAuthError('')

    if (!supabase) {
      return { ok: false, error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live auth.' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { ok: false, error: error.message }
    }

    try {
      const nextProfile = await refreshProfile(data.user)
      return { ok: true, user: data.user, role: nextProfile?.role }
    } catch (error) {
      const message = error?.message || 'Profile not found. Please contact support to complete account setup.'
      setAuthError(message)
      return { ok: false, error: message }
    }
  }, [refreshProfile])

  const signUp = useCallback(async ({ email, password, firstName, lastName, companyName }) => {
    const passwordError = validatePassword(password)
    if (passwordError) {
      return { ok: false, error: passwordError }
    }

    setAuthError('')

    if (!supabase) {
      return { ok: false, error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live signup.' }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          role: ROLES.CUSTOMER,
        },
      },
    })

    if (error) {
      return { ok: false, error: error.message }
    }

    if (data.user && !data.session) {
      return { ok: true, needsEmailConfirmation: true }
    }

    return { ok: true, needsEmailConfirmation: false, user: data.user }
  }, [])

  const signOut = useCallback(async () => {
    if (isDemoMode) {
      setSession(null)
      setProfile(null)
      setIsDemoMode(false)
      writeDemoSession(null)
      return
    }

    if (!supabase) {
      setSession(null)
      setProfile(null)
      return
    }

    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }

    setSession(null)
    setProfile(null)
  }, [isDemoMode])

  const loginDemo = useCallback((role) => {
    if (!DEMO_ENABLED) {
      return { ok: false, error: 'Demo mode is disabled. Set VITE_ENABLE_DEMO_MODE=true in your local environment.' }
    }

    const user = DEMO_USERS[role]
    if (!user) {
      return { ok: false, error: 'Unknown demo role.' }
    }

    const nextProfile = {
      id: user.id,
      email: user.email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      company_name: user.company_name,
      demoCustomerId: user.demoCustomerId,
      isDemo: true,
    }

    const nextSession = {
      access_token: 'demo-access-token',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    }

    setSession(nextSession)
    setProfile(nextProfile)
    setIsDemoMode(true)
    setAuthError('')
    writeDemoSession({ profile: nextProfile })

    return { ok: true, user: nextSession.user, role: user.role }
  }, [])

  const resetPassword = useCallback(async (email) => {
    if (!supabase) {
      return { ok: false, error: 'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable password recovery.' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  }, [])

  const clearRecovery = useCallback(() => {
    setRecoveryMode(false)
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      authError,
      recoveryMode,
      isDemoMode,
      demoEnabled: DEMO_ENABLED,
      signIn,
      signUp,
      signOut,
      loginDemo,
      resetPassword,
      clearRecovery,
      validatePassword,
    }),
    [session, profile, loading, authError, recoveryMode, isDemoMode, signIn, signUp, signOut, loginDemo, resetPassword, clearRecovery],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

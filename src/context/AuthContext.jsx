import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'

export const ROLES = {
  ADMIN: 'admin',
  STAFF: 'staff',
  CUSTOMER: 'customer',
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

  if (data) {
    return data
  }

  const role = user.user_metadata?.role || ROLES.CUSTOMER
  const firstName = user.user_metadata?.first_name || ''
  const lastName = user.user_metadata?.last_name || ''
  const companyName = user.user_metadata?.company_name || ''

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        company_name: companyName,
        role,
      },
    ])
    .select()
    .single()

  if (insertError) {
    throw insertError
  }

  return inserted
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState('')

  const refreshProfile = useCallback(async (user) => {
    if (!user) {
      setProfile(null)
      return null
    }

    const nextProfile = await ensureProfile(user)
    setProfile(nextProfile)
    return nextProfile
  }, [])

  useEffect(() => {
    let isMounted = true

    const initialize = async () => {
      const { data: { session: currentSession }, error } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error) {
        setAuthError(error.message)
      }

      setSession(currentSession)

      if (currentSession?.user) {
        try {
          await refreshProfile(currentSession.user)
        } catch (error) {
          setAuthError(error.message)
          setProfile(null)
        }
      }

      setLoading(false)
    }

    initialize()

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, nextSession) => {
      if (!isMounted) {
        return
      }

      setSession(nextSession)
      setAuthError('')

      if (nextSession?.user) {
        try {
          await refreshProfile(nextSession.user)
        } catch (error) {
          setAuthError(error.message)
        }
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      isMounted = false
      authListener.subscription.unsubscribe()
    }
  }, [refreshProfile])

  const signIn = useCallback(async ({ email, password }) => {
    setAuthError('')

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return { ok: false, error: error.message }
    }

    try {
      const nextProfile = await refreshProfile(data.user)
      return { ok: true, user: data.user, role: nextProfile?.role }
    } catch (error) {
      return { ok: false, error: error.message }
    }
  }, [refreshProfile])

  const signUp = useCallback(async ({ email, password, firstName, lastName, companyName }) => {
    const passwordError = validatePassword(password)
    if (passwordError) {
      return { ok: false, error: passwordError }
    }

    setAuthError('')

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
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }

    setSession(null)
    setProfile(null)
  }, [])

  const resetPassword = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  }, [])

  const value = useMemo(
    () => ({
      session,
      profile,
      loading,
      authError,
      signIn,
      signUp,
      signOut,
      resetPassword,
      validatePassword,
    }),
    [session, profile, loading, authError, signIn, signUp, signOut, resetPassword],
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

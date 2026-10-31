import { supabase } from './supabase'

export async function createStaffUser({ email, password, firstName, lastName }) {
  const { data: { session } } = await supabase.auth.getSession()

  const endpoint = import.meta.env.VITE_ADMIN_STAFF_ENDPOINT || '/api/admin/staff/create'

  if (!endpoint || endpoint.includes('placeholder') || endpoint === '/api/admin/staff/create') {
    return {
      ok: false,
      error: 'Trusted admin staff endpoint is not configured. Set VITE_ADMIN_STAFF_ENDPOINT to a secure backend URL.',
    }
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(session ? { Authorization: `Bearer ${session.access_token}` } : {}),
    },
    body: JSON.stringify({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
      role: 'staff',
    }),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    return {
      ok: false,
      error: payload.error || 'The trusted server rejected the staff creation request.',
    }
  }

  return { ok: true, user: payload.user || null }
}

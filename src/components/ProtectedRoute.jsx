import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { DataState } from './DataState'

export function ProtectedRoute({ children, allowedRoles = [], redirectTo = '/login' }) {
  const { profile, session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <DataState loading />
  }

  if (!session) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  if (allowedRoles.length && !allowedRoles.includes(profile?.role)) {
    if (profile?.role === 'customer') {
      return <Navigate to="/customer/subscriptions" replace />
    }

    if (profile?.role === 'staff' || profile?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />
    }

    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />
  }

  return children
}
